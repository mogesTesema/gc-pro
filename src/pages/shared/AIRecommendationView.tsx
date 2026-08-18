import React, { useState, useEffect } from 'react';
import { aiAPI, campaignAPI } from '../../api/client';
import { ICampaign } from '../../types';
import { PageLoading, EmptyState, Spinner, Badge } from '../../components/common/index';
import { Sparkles, TrendingUp, Star, Users, ChevronDown, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

const ROI_COLORS: Record<string, string> = {
  excellent: 'bg-green-100 text-green-700',
  good: 'bg-blue-100 text-blue-700',
  fair: 'bg-amber-100 text-amber-700',
  poor: 'bg-red-100 text-red-700',
};
const ENG_COLORS: Record<string, string> = {
  high: 'text-green-600',
  medium: 'text-amber-600',
  low: 'text-red-500',
};

const AIRecommendationView: React.FC = () => {
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [ran, setRan] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await campaignAPI.getMy();
        setCampaigns(res.data.campaigns || []);
      } catch { toast.error('Failed to load campaigns'); }
      finally { setLoadingCampaigns(false); }
    })();
  }, []);

  const handleGetRecommendations = async () => {
    if (!selectedCampaignId) { toast.error('Please select a campaign'); return; }
    setLoading(true);
    setRan(false);
    try {
      const res = await aiAPI.getRecommendations({ campaignId: selectedCampaignId });
      setRecommendations(res.data.recommendations || []);
      setRan(true);
      if (res.data.recommendations?.length === 0) toast('No recommendations found for this campaign.');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'AI service error');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Creator Recommendations</h1>
            <p className="text-sm text-gray-500">Let AI match the best creators for your campaign</p>
          </div>
        </div>
      </div>

      {/* Campaign Selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">Select a Campaign</p>
        {loadingCampaigns ? <Spinner /> : (
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select value={selectedCampaignId} onChange={e => setSelectedCampaignId(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 pr-10">
                <option value="">-- Choose a campaign --</option>
                {campaigns.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
            <button onClick={handleGetRecommendations} disabled={loading || !selectedCampaignId}
              className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition shadow-sm">
              {loading ? <Spinner size={16} className="text-white" /> : <Sparkles size={16} />}
              {loading ? 'Analyzing...' : 'Get AI Picks'}
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-4 animate-pulse">
            <Sparkles size={28} className="text-violet-600" />
          </div>
          <p className="text-gray-600 font-medium">AI is analyzing creators...</p>
          <p className="text-gray-400 text-sm mt-1">This may take a few seconds</p>
        </div>
      )}

      {!loading && ran && recommendations.length === 0 && (
        <EmptyState icon={<BarChart3 size={48} className="text-gray-300" />} title="No recommendations" description="Try a different campaign or add more creator profiles." />
      )}

      {!loading && recommendations.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-gray-600">{recommendations.length} creators ranked by AI match score</p>
          {recommendations.map((rec: any, idx: number) => {
            const u = rec.profile?.userId as any;
            const score = rec.matchScore || 0;
            const scoreColor = score >= 80 ? 'text-green-600 bg-green-50' : score >= 60 ? 'text-amber-600 bg-amber-50' : 'text-red-500 bg-red-50';
            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4 hover:shadow-md transition">
                {/* Rank */}
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                  {idx + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold text-gray-900">{u?.name || 'Creator'}</p>
                    {rec.profile?.platform && <Badge status={rec.profile.platform} />}
                    {rec.profile?.niche?.map((n: string) => (
                      <span key={n} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{n}</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mb-2 italic">"{rec.reason}"</p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Users size={12} /> {rec.profile?.followers?.toLocaleString() || 0} followers</span>
                    <span className="flex items-center gap-1"><TrendingUp size={12} /> {rec.profile?.performanceMetrics?.engagementRate || 0}% engagement</span>
                    <span className="flex items-center gap-1"><Star size={12} /> {rec.profile?.performanceMetrics?.averageRating || 0}/5 rating</span>
                    <span className={`flex items-center gap-1 font-medium ${ENG_COLORS[rec.predictedEngagement] || ''}`}>
                      Predicted Engagement: {rec.predictedEngagement}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-semibold capitalize ${ROI_COLORS[rec.estimatedROI] || 'bg-gray-100 text-gray-600'}`}>
                      ROI: {rec.estimatedROI}
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className={`shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-lg ${scoreColor}`}>
                  {score}
                  <span className="text-xs font-normal">match</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AIRecommendationView;
