import React, { useState, useEffect } from 'react';
import { profileAPI, aiAPI } from '../../api/client';
import { PageLoading, EmptyState, Spinner, Avatar, Badge } from '../../components/common/index';
import { Brain, TrendingUp, Star, Shield, Search, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';

const TrustScorePage: React.FC = () => {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<Record<string, any>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await profileAPI.getCreators({ limit: 30 });
        setCreators(res.data.creators || []);
      } catch { toast.error('Failed to load creators'); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleAnalyze = async (creatorId: string) => {
    setAnalyzing(creatorId);
    setExpandedId(creatorId);
    try {
      const res = await aiAPI.analyzeCreator(creatorId);
      setAnalysisData(prev => ({ ...prev, [creatorId]: res.data.analysis }));
    } catch { toast.error('AI analysis failed'); }
    finally { setAnalyzing(null); }
  };

  const filtered = creators.filter(c => !search ||
    (c.userId as any)?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.niche?.join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const ScoreBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-bold">{value}/100</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );

  if (loading) return <PageLoading />;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trust Score & Rankings</h1>
            <p className="text-sm text-gray-500">AI-powered creator credibility analysis</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search creators by name or niche..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<BarChart2 size={48} className="text-gray-300" />} title="No creators found" />
      ) : (
        <div className="space-y-4">
          {filtered.map((creator: any, idx: number) => {
            const u = creator.userId as any;
            const analysis = analysisData[u?._id];
            const isExpanded = expandedId === u?._id;
            const isAnalyzing = analyzing === u?._id;
            const rating = creator.performanceMetrics?.averageRating || 0;

            return (
              <div key={creator._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 flex gap-4">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                    {idx + 1}
                  </div>
                  <Avatar name={u?.name || 'Creator'} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-bold text-gray-900">{u?.name}</p>
                      {creator.platform && <Badge status={creator.platform} />}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      {creator.niche?.map((n: string) => (
                        <span key={n} className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{n}</span>
                      ))}
                      <span>👥 {creator.followers?.toLocaleString() || 0}</span>
                      <span className="flex items-center gap-0.5">
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        {rating.toFixed(1)} rating
                      </span>
                      <span>📊 {creator.performanceMetrics?.engagementRate || 0}% eng.</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    {analysis && (
                      <div className="flex gap-2">
                        <div className="text-center">
                          <div className={`text-lg font-black ${analysis.overallScore >= 75 ? 'text-green-600' : analysis.overallScore >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                            {analysis.overallScore}
                          </div>
                          <div className="text-xs text-gray-400">Score</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-black ${analysis.trustScore >= 75 ? 'text-blue-600' : 'text-amber-600'}`}>
                            {analysis.trustScore}
                          </div>
                          <div className="text-xs text-gray-400">Trust</div>
                        </div>
                      </div>
                    )}
                    <button onClick={() => {
                      if (isExpanded && !isAnalyzing) { setExpandedId(null); return; }
                      if (!analysis) handleAnalyze(u?._id);
                      else setExpandedId(isExpanded ? null : u?._id);
                    }} disabled={isAnalyzing}
                      className="flex items-center gap-1.5 text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">
                      {isAnalyzing ? <Spinner size={12} className="text-white" /> : <Brain size={12} />}
                      {isAnalyzing ? 'Analyzing...' : analysis ? (isExpanded ? 'Hide' : 'View') : 'Analyze'}
                    </button>
                  </div>
                </div>

                {isExpanded && analysis && (
                  <div className="border-t border-gray-100 bg-gray-50 p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-3">
                      <ScoreBar label="Overall Score" value={analysis.overallScore} color="bg-emerald-500" />
                      <ScoreBar label="Trust Score" value={analysis.trustScore} color="bg-blue-500" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Growth Trend</span><span className="font-semibold capitalize">{analysis.growthTrend}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Risk Level</span>
                        <span className={`font-semibold capitalize ${analysis.riskLevel === 'low' ? 'text-green-600' : analysis.riskLevel === 'medium' ? 'text-amber-600' : 'text-red-500'}`}>{analysis.riskLevel}</span>
                      </div>
                      <div className="flex justify-between"><span className="text-gray-500">Engagement</span><span className="font-semibold">{analysis.predictedEngagementRange}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Budget Range</span><span className="font-semibold">{analysis.recommendedBudgetRange}</span></div>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Summary</p>
                      <p className="text-sm text-gray-700">{analysis.summary}</p>
                    </div>
                    {analysis.recommendations?.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">AI Recommendations</p>
                        <ul className="space-y-1">
                          {analysis.recommendations.map((r: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <TrendingUp size={13} className="mt-0.5 text-emerald-500 shrink-0" /> {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrustScorePage;
