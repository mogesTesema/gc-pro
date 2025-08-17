import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { campaignAPI, applicationAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { ICampaign } from '../../types';
import { Badge, PageLoading, Modal, Spinner, Avatar } from '../../components/common/index';
import { Calendar, DollarSign, Users, Globe, MapPin, Briefcase, Send, ArrowLeft, Coins } from 'lucide-react';
import toast from 'react-hot-toast';

const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [campaign, setCampaign] = useState<ICampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [applyMsg, setApplyMsg] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [applying, setApplying] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await campaignAPI.getById(id!);
        setCampaign(res.data.campaign);
        if (user?.role === 'creator') {
          try {
            const appsRes = await applicationAPI.getMy();
            const apps = appsRes.data.applications || [];
            setAlreadyApplied(apps.some((a: any) => (a.campaignId?._id ?? a.campaignId) === id));
          } catch {}
        }
      } catch {
        toast.error('Campaign not found');
        navigate('/campaigns');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleApply = async () => {
    if (!applyMsg.trim()) { toast.error('Please write a message'); return; }
    setApplying(true);
    try {
      await applicationAPI.apply({ campaignId: id, message: applyMsg, proposedRate: proposedRate ? parseFloat(proposedRate) : undefined });
      toast.success('Application submitted! 🎉 (–5 coins)');
      if (user) setUser({ ...user, coinBalance: user.coinBalance - 5 });
      setShowApply(false);
      setAlreadyApplied(true);
      setCampaign((c) => c ? { ...c, applicationsCount: c.applicationsCount + 1 } : c);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <PageLoading />;
  if (!campaign) return null;

  const isOwner   = campaign.postedBy?._id === user?._id;
  const canApply  = user?.role === 'creator' && campaign.status === 'open' && !isOwner;
  const hasCoins  = (user?.coinBalance ?? 0) >= 5;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h1 className="text-xl font-bold text-gray-900">{campaign.title}</h1>
              <Badge status={campaign.status} />
            </div>
            {campaign.postedBy && (
              <div className="flex items-center gap-3 py-3 border-y border-gray-100 mb-4">
                <Avatar name={campaign.postedBy.name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{campaign.postedBy.name}</p>
                  <p className="text-xs text-gray-500">Posted {new Date(campaign.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}
            <p className="text-gray-700 leading-relaxed text-sm">{campaign.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-4">
              {campaign.niche.map((n) => (
                <span key={n} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full capitalize">{n}</span>
              ))}
            </div>
          </div>

          {campaign.requirements && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                <Briefcase size={15} /> Requirements
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{campaign.requirements}</p>
            </div>
          )}

          {campaign.requiredSkills?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-3 text-sm">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {campaign.requiredSkills.map((s) => (
                  <span key={s} className="text-sm bg-purple-50 text-purple-700 px-3 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h2 className="font-bold text-gray-900 text-sm border-b pb-2">Details</h2>
            {[
              { icon: <DollarSign size={14} />, label: 'Budget', val: `${campaign.budget.toLocaleString()} ${campaign.currency}` },
              { icon: <Calendar size={14} />,   label: 'Duration', val: `${campaign.duration} days` },
              { icon: <Users size={14} />,      label: 'Applicants', val: campaign.applicationsCount },
              { icon: <MapPin size={14} />,     label: 'Location', val: campaign.location || 'Any' },
            ].map(({ icon, label, val }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-gray-500">{icon} {label}</div>
                <span className="font-semibold text-gray-900">{val}</span>
              </div>
            ))}
            {campaign.platform?.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1"><Globe size={12} /> Platforms</p>
                <div className="flex flex-wrap gap-1">
                  {campaign.platform.map((p) => (
                    <span key={p} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full capitalize">{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {canApply && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              {alreadyApplied ? (
                <div className="text-center">
                  <p className="text-green-600 font-semibold text-sm">✅ Applied!</p>
                  <p className="text-gray-400 text-xs mt-1">Awaiting business review</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-gray-600">Your coins</span>
                    <span className="font-bold text-yellow-600">🪙 {user?.coinBalance}</span>
                  </div>
                  <button onClick={() => setShowApply(true)} disabled={!hasCoins}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
                    <Send size={15} /> Apply (–5 coins)
                  </button>
                  {!hasCoins && <p className="text-xs text-red-500 mt-2 text-center">Not enough coins</p>}
                </>
              )}
            </div>
          )}
          {isOwner && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-sm text-blue-700 font-medium">Your campaign</p>
              <p className="text-xs text-blue-500 mt-1">Manage it from your dashboard</p>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <Modal isOpen={showApply} onClose={() => setShowApply(false)} title="Apply to Campaign">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Message <span className="text-red-500">*</span></label>
            <textarea value={applyMsg} onChange={(e) => setApplyMsg(e.target.value)} rows={5}
              placeholder="Why are you a great fit? Share your experience and approach…"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Proposed Rate (ETB) <span className="text-gray-400 font-normal">– optional</span></label>
            <div className="relative">
              <Coins size={14} className="absolute left-3 top-3 text-gray-400" />
              <input type="number" value={proposedRate} onChange={(e) => setProposedRate(e.target.value)} placeholder="Your fee"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setShowApply(false)} className="flex-1 py-2.5 border rounded-xl text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
            <button onClick={handleApply} disabled={applying}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm">
              {applying ? <><Spinner size={15} /> Submitting…</> : '🚀 Submit'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CampaignDetail;
