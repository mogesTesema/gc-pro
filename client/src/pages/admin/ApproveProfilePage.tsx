import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/client';
import { IProfile } from '../../types';
import { PageLoading, Badge, Avatar, Modal, Spinner, EmptyState } from '../../components/common/index';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const ApproveProfilePage: React.FC = () => {
  const [profiles, setProfiles] = useState<IProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; userId: string; name: string }>({ open: false, userId: '', name: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [viewModal, setViewModal] = useState<{ open: boolean; profile: IProfile | null }>({ open: false, profile: null });

  useEffect(() => {
    (async () => {
      try {
        const res = await adminAPI.getPendingProfiles();
        setProfiles(res.data.profiles || []);
      } catch { toast.error('Failed to load pending profiles'); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      await adminAPI.approveProfile(userId);
      setProfiles(p => p.filter(pr => (pr.userId as any)?._id !== userId));
      toast.success('Profile approved ✅');
    } catch { toast.error('Failed to approve'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Please provide a reason'); return; }
    setActionLoading(rejectModal.userId);
    try {
      await adminAPI.rejectProfile(rejectModal.userId, { reason: rejectReason });
      setProfiles(p => p.filter(pr => (pr.userId as any)?._id !== rejectModal.userId));
      setRejectModal({ open: false, userId: '', name: '' });
      setRejectReason('');
      toast.success('Profile rejected');
    } catch { toast.error('Failed to reject'); }
    finally { setActionLoading(null); }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
              <Clock size={18} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          </div>
          <p className="text-gray-500 text-sm ml-12">{profiles.length} profiles awaiting review</p>
        </div>
      </div>

      {profiles.length === 0 ? (
        <EmptyState icon={<CheckCircle size={56} className="text-green-400" />} title="All caught up!" description="No profiles are currently pending approval." />
      ) : (
        <div className="space-y-4">
          {profiles.map(profile => {
            const u = profile.userId as any;
            const isLoading = actionLoading === u?._id;
            return (
              <div key={profile._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4">
                <Avatar name={u?.name || 'User'} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-bold text-gray-900">{u?.name}</p>
                    <Badge status={u?.role} />
                    <span className="text-xs text-gray-400">{u?.email}</span>
                  </div>
                  {profile.bio && <p className="text-sm text-gray-600 mb-2 line-clamp-2">{profile.bio}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    {(profile.niche?.length ?? 0) > 0 && <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">🎯 {profile.niche?.join(', ')}</span>}
                    {profile.followers && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">👥 {profile.followers.toLocaleString()} followers</span>}
                    {profile.platform && <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">📱 {profile.platform}</span>}
                    {profile.businessName && <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">🏢 {profile.businessName}</span>}
                    {profile.location && <span>📍 {profile.location}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => setViewModal({ open: true, profile })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
                    <Eye size={14} /> View
                  </button>
                  <button onClick={() => handleApprove(u?._id)} disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
                    {isLoading ? <Spinner size={14} /> : <CheckCircle size={14} />} Approve
                  </button>
                  <button onClick={() => setRejectModal({ open: true, userId: u?._id, name: u?.name })} disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 disabled:opacity-50">
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Profile Modal */}
      <Modal isOpen={viewModal.open} onClose={() => setViewModal({ open: false, profile: null })} title="Profile Details" size="lg">
        {viewModal.profile && (() => {
          const p = viewModal.profile;
          const u = p.userId as any;
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar name={u?.name} size="lg" />
                <div>
                  <p className="font-bold text-lg text-gray-900">{u?.name}</p>
                  <p className="text-gray-500 text-sm">{u?.email}</p>
                  <Badge status={u?.role} />
                </div>
              </div>
              {p.bio && <div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Bio</p><p className="text-sm text-gray-700">{p.bio}</p></div>}
              {p.niche && p.niche.length > 0 && <div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Niche</p><p className="text-sm text-gray-700">{p.niche.join(', ')}</p></div>}
              {p.skills && p.skills.length > 0 && <div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Skills</p><p className="text-sm text-gray-700">{p.skills.join(', ')}</p></div>}
              {p.followers && <div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Followers</p><p className="text-sm text-gray-700">{p.followers.toLocaleString()}</p></div>}
              {p.platform && <div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Platform</p><p className="text-sm text-gray-700 capitalize">{p.platform}</p></div>}
              {p.businessName && <div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Business</p><p className="text-sm text-gray-700">{p.businessName}</p></div>}
              {p.industry && <div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Industry</p><p className="text-sm text-gray-700">{p.industry}</p></div>}
              {p.location && <div><p className="text-xs font-semibold text-gray-500 uppercase mb-1">Location</p><p className="text-sm text-gray-700">{p.location}</p></div>}
            </div>
          );
        })()}
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={rejectModal.open} onClose={() => setRejectModal({ open: false, userId: '', name: '' })} title={`Reject ${rejectModal.name}'s Profile`} size="sm">
        <p className="text-sm text-gray-600 mb-3">Provide a clear reason so the user knows what to fix:</p>
        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={4}
          placeholder="e.g. Incomplete bio, missing social links..."
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400 mb-4" />
        <div className="flex gap-3">
          <button onClick={() => setRejectModal({ open: false, userId: '', name: '' })} className="flex-1 py-2 border rounded-xl text-gray-700 text-sm">Cancel</button>
          <button onClick={handleReject} disabled={actionLoading === rejectModal.userId}
            className="flex-1 bg-red-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {actionLoading === rejectModal.userId && <Spinner size={14} />} Reject
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ApproveProfilePage;
