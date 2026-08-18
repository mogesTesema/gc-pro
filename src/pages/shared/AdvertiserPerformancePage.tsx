import React, { useState, useEffect } from 'react';
import { campaignAPI, applicationAPI } from '../../api/client';
import { PageLoading, Badge, EmptyState } from '../../components/common/index';
import { BarChart3, TrendingUp, Megaphone, Users, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdvertiserPerformancePage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [appsByCampaign, setAppsByCampaign] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const campRes = await campaignAPI.getMy();
        const camps = campRes.data.campaigns || [];
        setCampaigns(camps);
        const appMap: Record<string, any[]> = {};
        await Promise.all(camps.map(async (c: any) => {
          try {
            const res = await applicationAPI.getCampaignApps(c._id);
            appMap[c._id] = res.data.applications || [];
          } catch { appMap[c._id] = []; }
        }));
        setAppsByCampaign(appMap);
      } catch { toast.error('Failed to load performance data'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <PageLoading />;

  const totalApps = Object.values(appsByCampaign).flat().length;
  const acceptedApps = Object.values(appsByCampaign).flat().filter((a: any) => a.status === 'accepted').length;
  const completedApps = Object.values(appsByCampaign).flat().filter((a: any) => a.collaborationStatus === 'completed').length;
  const openCampaigns = campaigns.filter(c => c.status === 'open').length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow">
            <BarChart3 size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advertiser Performance</h1>
            <p className="text-sm text-gray-500">Analytics across all your campaigns</p>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Campaigns', value: campaigns.length, icon: <Megaphone size={20} />, color: 'bg-blue-50 text-blue-600' },
          { label: 'Open Campaigns', value: openCampaigns, icon: <TrendingUp size={20} />, color: 'bg-green-50 text-green-600' },
          { label: 'Total Applications', value: totalApps, icon: <Users size={20} />, color: 'bg-purple-50 text-purple-600' },
          { label: 'Completed Collabs', value: completedApps, icon: <CheckCircle size={20} />, color: 'bg-teal-50 text-teal-600' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>{icon}</div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Acceptance rate */}
      {totalApps > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-4">Application Conversion Funnel</p>
          <div className="space-y-3">
            {[
              { label: 'Total Applications', value: totalApps, max: totalApps, color: 'bg-blue-500' },
              { label: 'Accepted', value: acceptedApps, max: totalApps, color: 'bg-green-500' },
              { label: 'Completed', value: completedApps, max: totalApps, color: 'bg-teal-500' },
            ].map(({ label, value, max, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-bold text-gray-900">{value} ({max > 0 ? Math.round((value / max) * 100) : 0}%)</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-campaign breakdown */}
      {campaigns.length === 0 ? (
        <EmptyState icon={<Megaphone size={48} className="text-gray-300" />} title="No campaigns yet" description="Create your first campaign to see performance data." />
      ) : (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-gray-600">Campaign Breakdown</p>
          {campaigns.map((c: any) => {
            const apps = appsByCampaign[c._id] || [];
            const accepted = apps.filter((a: any) => a.status === 'accepted').length;
            const completed = apps.filter((a: any) => a.collaborationStatus === 'completed').length;
            return (
              <div key={c._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="font-bold text-gray-900">{c.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{c.niche?.join(', ')}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge status={c.status} />
                    <span className="text-sm font-semibold text-gray-700">🪙 {c.budget?.toLocaleString()} ETB</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: 'Applications', value: apps.length, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Accepted', value: accepted, color: 'text-green-600 bg-green-50' },
                    { label: 'Completed', value: completed, color: 'text-teal-600 bg-teal-50' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className={`rounded-xl py-2.5 ${color}`}>
                      <p className="text-xl font-black">{value}</p>
                      <p className="text-xs font-medium">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdvertiserPerformancePage;
