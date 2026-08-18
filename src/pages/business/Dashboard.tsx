import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { campaignAPI, applicationAPI, aiAPI } from '../../api/client';
import { ICampaign, IApplication } from '../../types';
import {
  StatCard, Badge, PageLoading, EmptyState, Modal, Avatar,
} from '../../components/common/index';
import {
  Megaphone, Users, CheckCircle, Plus, Coins,
  Eye, ThumbsUp, ThumbsDown, Bot,
} from 'lucide-react';
import toast from 'react-hot-toast';

const BusinessDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<ICampaign | null>(null);
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [aiRecs, setAiRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAppsModal, setShowAppsModal] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await campaignAPI.getMy();
        setCampaigns(res.data.campaigns || []);
      } catch {
        toast.error('Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const viewApplications = async (campaign: ICampaign) => {
    setSelectedCampaign(campaign);
    setApplications([]);
    setAiRecs([]);
    setShowAppsModal(true);
    setAppsLoading(true);
    try {
      const res = await applicationAPI.getCampaignApps(campaign._id);
      setApplications(res.data.applications || []);
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setAppsLoading(false);
    }
  };

  const getAIRecs = async () => {
    if (!selectedCampaign) return;
    setAiLoading(true);
    try {
      const res = await aiAPI.getRecommendations({ campaignId: selectedCampaign._id });
      setAiRecs(res.data.recommendations || []);
      toast.success('AI analysis complete!');
    } catch {
      toast.error('AI service unavailable. Check GEMINI_API_KEY.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAccept = async (appId: string) => {
    setActionLoading(appId);
    try {
      const res = await applicationAPI.accept(appId);
      toast.success('Application accepted! Chat opened.');
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: 'accepted' as any, chatId: res.data.chatId } : a))
      );
      setCampaigns((prev) =>
        prev.map((c) => c._id === selectedCampaign?._id ? { ...c, status: 'in_progress' as any } : c)
      );
      setShowAppsModal(false);
      if (res.data.chatId) navigate(`/chat/${res.data.chatId}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to accept');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (appId: string) => {
    setActionLoading(appId);
    try {
      await applicationAPI.reject(appId);
      toast.success('Application rejected');
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: 'rejected' as any } : a))
      );
    } catch {
      toast.error('Failed to reject');
    } finally {
      setActionLoading(null);
    }
  };

  const open   = campaigns.filter((c) => c.status === 'open').length;
  const active = campaigns.filter((c) => c.status === 'in_progress').length;
  const done   = campaigns.filter((c) => c.status === 'completed').length;
  const total  = campaigns.reduce((s, c) => s + (c.applicationsCount || 0), 0);

  if (loading) return <PageLoading />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
          <p className="text-gray-500 mt-1">{profile?.businessName || user?.name}</p>
        </div>
        <button
          onClick={() => navigate('/campaigns/create')}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={18} /> Post Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Megaphone size={22} />}   title="Open"       value={open}   color="blue"   subtitle="Accepting applicants" />
        <StatCard icon={<CheckCircle size={22} />} title="Active"     value={active} color="green"  subtitle="In progress" />
        <StatCard icon={<Users size={22} />}       title="Applicants" value={total}  color="purple" subtitle="Across all campaigns" />
        <StatCard icon={<Coins size={22} />}       title="Coins"      value={user?.coinBalance ?? 0} color="yellow" subtitle="10 per campaign" />
      </div>

      {/* Analytics Charts */}
      {campaigns.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Budget Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4 text-sm">Campaign Budgets</h3>
            <div className="flex items-end gap-3 h-36">
              {campaigns.slice(0, 8).map(c => {
                const maxBudget = Math.max(...campaigns.map(x => x.budget), 1);
                const pct = (c.budget / maxBudget) * 100;
                const statusColors: Record<string, string> = {
                  open: 'from-blue-500 to-blue-400',
                  in_progress: 'from-green-500 to-green-400',
                  completed: 'from-purple-500 to-purple-400',
                  closed: 'from-gray-400 to-gray-300',
                };
                return (
                  <div key={c._id} className="flex flex-col items-center flex-1 gap-1">
                    <span className="text-[10px] font-bold text-gray-600">{(c.budget / 1000).toFixed(0)}K</span>
                    <div
                      className={`w-full bg-gradient-to-t ${statusColors[c.status] || 'from-blue-500 to-blue-400'} rounded-t-md transition-all duration-500 min-h-[4px]`}
                      style={{ height: `${pct}%` }}
                      title={`${c.title}: ${c.budget.toLocaleString()} ETB`}
                    />
                    <span className="text-[9px] text-gray-400 truncate max-w-full" title={c.title}>
                      {c.title.slice(0, 6)}…
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-3 text-[10px] text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full" /> Open</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full" /> Active</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-purple-500 rounded-full" /> Done</span>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-800 mb-4 text-sm">Campaign Status Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'Open', count: open, color: 'bg-blue-500', total: campaigns.length },
                { label: 'In Progress', count: active, color: 'bg-green-500', total: campaigns.length },
                { label: 'Completed', count: done, color: 'bg-purple-500', total: campaigns.length },
                { label: 'Closed', count: campaigns.filter(c => c.status === 'closed').length, color: 'bg-gray-400', total: campaigns.length },
              ].map(s => (
                <div key={s.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 font-medium">{s.label}</span>
                    <span className="text-gray-800 font-bold">{s.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${s.color} transition-all duration-500`}
                      style={{ width: `${s.total ? (s.count / s.total) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">
                Total budget across all: <strong>{campaigns.reduce((s, c) => s + c.budget, 0).toLocaleString()} ETB</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold text-gray-900">My Campaigns ({campaigns.length})</h2>
        </div>

        {campaigns.length === 0 ? (
          <EmptyState
            icon={<span className="text-5xl">📢</span>}
            title="No campaigns yet"
            description="Post your first campaign to find talented creators."
            action={
              <button
                onClick={() => navigate('/campaigns/create')}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={16} /> Post a Campaign
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-6 py-3">Campaign</th>
                  <th className="text-left px-6 py-3">Budget</th>
                  <th className="text-left px-6 py-3">Duration</th>
                  <th className="text-left px-6 py-3">Applicants</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {campaigns.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{c.title}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{c.niche.slice(0, 2).join(' • ')}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{c.budget.toLocaleString()} ETB</td>
                    <td className="px-6 py-4 text-gray-600">{c.duration}d</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <Users size={13} className="text-gray-400" />
                        {c.applicationsCount}
                      </span>
                    </td>
                    <td className="px-6 py-4"><Badge status={c.status} /></td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => viewApplications(c)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-semibold"
                      >
                        <Eye size={13} /> View Applicants
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Applications Modal */}
      <Modal
        isOpen={showAppsModal}
        onClose={() => { setShowAppsModal(false); setAiRecs([]); }}
        title={selectedCampaign?.title || 'Applications'}
        size="lg"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {applications.length} application{applications.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={getAIRecs}
            disabled={aiLoading || applications.length === 0}
            className="flex items-center gap-2 text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 transition disabled:opacity-50 font-medium"
          >
            <Bot size={14} />
            {aiLoading ? 'Analyzing…' : '🤖 AI Rank Applicants'}
          </button>
        </div>

        {appsLoading ? (
          <PageLoading />
        ) : applications.length === 0 ? (
          <EmptyState title="No applications yet" description="Share this campaign to attract creators." />
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const aiMatch = aiRecs.find(
                (r: any) =>
                  r.profile?.userId?._id === (app.applicantId as any)?._id ||
                  r.profile?.userId === (app.applicantId as any)?._id
              );
              const isLoading = actionLoading === app._id;

              return (
                <div key={app._id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-200 transition">
                  <div className="flex items-start gap-3">
                    <Avatar name={(app.applicantId as any)?.name || 'U'} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{(app.applicantId as any)?.name}</p>
                        <Badge status={app.status} />
                        {aiMatch && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                            🤖 {aiMatch.matchScore}/100 · {aiMatch.predictedEngagement} engagement
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{app.message}</p>
                      {app.proposedRate && (
                        <p className="text-xs text-gray-500 mt-1">
                          Proposed: <strong>{app.proposedRate.toLocaleString()} ETB</strong>
                        </p>
                      )}
                      {aiMatch?.reason && (
                        <div className="mt-2 text-xs text-purple-700 bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-lg">
                          {aiMatch.reason}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAccept(app._id)}
                            disabled={isLoading}
                            className="flex items-center gap-1 bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                          >
                            <ThumbsUp size={12} /> Accept
                          </button>
                          <button
                            onClick={() => handleReject(app._id)}
                            disabled={isLoading}
                            className="flex items-center gap-1 bg-red-100 text-red-700 text-xs px-3 py-1.5 rounded-lg hover:bg-red-200 transition disabled:opacity-50"
                          >
                            <ThumbsDown size={12} /> Reject
                          </button>
                        </>
                      )}
                      {app.status === 'accepted' && app.chatId && (
                        <Link
                          to={`/chat/${app.chatId}`}
                          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-center"
                          onClick={() => setShowAppsModal(false)}
                        >
                          Open Chat
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BusinessDashboard;
