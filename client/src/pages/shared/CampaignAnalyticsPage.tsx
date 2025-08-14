import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { campaignAPI, applicationAPI } from '../../api/client';
import { ICampaign, IApplication } from '../../types';
import { PageLoading } from '../../components/common/index';
import {
  ArrowLeft, Users, TrendingUp, BarChart3,
  Clock, Target, CheckCircle, XCircle, Hourglass,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CampaignAnalyticsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<ICampaign | null>(null);
  const [apps, setApps] = useState<IApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [cRes, aRes] = await Promise.all([
          campaignAPI.getById(id),
          applicationAPI.getCampaignApps(id),
        ]);
        setCampaign(cRes.data.campaign);
        setApps(aRes.data.applications || []);
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <PageLoading />;
  if (!campaign) return (
    <div className="flex flex-col items-center justify-center py-24">
      <p className="text-xl font-bold text-gray-800 mb-4">Campaign not found</p>
      <Link to="/campaigns" className="text-blue-600 hover:underline">← Back</Link>
    </div>
  );

  const pending  = apps.filter(a => a.status === 'pending').length;
  const accepted = apps.filter(a => a.status === 'accepted').length;
  const rejected = apps.filter(a => a.status === 'rejected').length;
  const total    = apps.length;

  // Platform distribution
  const platformCounts: Record<string, number> = {};
  apps.forEach(a => {
    const p = (a.applicantId as any)?.platform || 'other';
    platformCounts[p] = (platformCounts[p] || 0) + 1;
  });

  // Application timeline (group by day)
  const timeline: Record<string, number> = {};
  apps.forEach(a => {
    const d = new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    timeline[d] = (timeline[d] || 0) + 1;
  });
  const timelineEntries = Object.entries(timeline).slice(-14);
  const maxTimeline = Math.max(...timelineEntries.map(e => e[1]), 1);

  // Funnel percentages
  const funnelSteps = [
    { label: 'Total Applied', count: total,    pct: 100,                             color: 'bg-blue-500',   icon: <Users size={16} /> },
    { label: 'Pending',       count: pending,  pct: total ? Math.round((pending / total) * 100) : 0,   color: 'bg-yellow-500', icon: <Hourglass size={16} /> },
    { label: 'Accepted',      count: accepted, pct: total ? Math.round((accepted / total) * 100) : 0,  color: 'bg-green-500',  icon: <CheckCircle size={16} /> },
    { label: 'Rejected',      count: rejected, pct: total ? Math.round((rejected / total) * 100) : 0,  color: 'bg-red-500',    icon: <XCircle size={16} /> },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 text-sm transition">
        <ArrowLeft size={16} /> Back to campaign
      </button>

      {/* Campaign header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-gray-900">{campaign.title}</h1>
            <p className="text-gray-500 text-sm mt-1">{campaign.description.slice(0, 120)}…</p>
            <div className="flex gap-2 mt-3 flex-wrap">
              {campaign.niche.map(n => (
                <span key={n} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full capitalize">{n}</span>
              ))}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-black text-gray-900">{campaign.budget.toLocaleString()} <span className="text-sm text-gray-400">ETB</span></p>
            <p className="text-sm text-gray-500">{campaign.duration} day campaign</p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {funnelSteps.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs font-medium">{s.label}</span>
              <div className={`w-7 h-7 rounded-lg ${s.color} bg-opacity-10 flex items-center justify-center`}>
                {s.icon}
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900">{s.count}</p>
            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
              <div className={`h-1.5 rounded-full ${s.color} transition-all duration-700`} style={{ width: `${s.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application timeline */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-blue-500" /> Application Timeline
          </h3>
          {timelineEntries.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No applications yet</p>
          ) : (
            <div className="flex items-end gap-2 h-40">
              {timelineEntries.map(([day, count]) => (
                <div key={day} className="flex flex-col items-center flex-1 gap-1">
                  <span className="text-xs font-bold text-gray-800">{count}</span>
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all duration-500 min-h-[4px]"
                    style={{ height: `${(count / maxTimeline) * 100}%` }}
                  />
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{day}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Platform distribution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Target size={16} className="text-purple-500" /> Applicants by Platform
          </h3>
          {Object.keys(platformCounts).length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(platformCounts).sort((a, b) => b[1] - a[1]).map(([platform, count]) => {
                const pct = total ? Math.round((count / total) * 100) : 0;
                const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500', 'bg-orange-500'];
                const cidx = Object.keys(platformCounts).indexOf(platform) % colors.length;
                return (
                  <div key={platform}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize font-medium text-gray-700">{platform}</span>
                      <span className="text-gray-500">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${colors[cidx]} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Conversion funnel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-green-500" /> Conversion Funnel
          </h3>
          <div className="flex items-center justify-center gap-4 py-4">
            {funnelSteps.map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-2xl ${step.color} bg-opacity-10 flex items-center justify-center mx-auto mb-2`}>
                    <span className="text-lg font-black text-gray-900">{step.count}</span>
                  </div>
                  <p className="text-xs font-medium text-gray-600">{step.label}</p>
                  <p className="text-xs text-gray-400">{step.pct}%</p>
                </div>
                {i < funnelSteps.length - 1 && (
                  <div className="text-gray-300 text-lg font-bold">→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignAnalyticsPage;
