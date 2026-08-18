import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/client';
import { IProfile, IUser } from '../../types';
import { StatCard, Badge, PageLoading, EmptyState, Modal, Avatar, Spinner } from '../../components/common/index';
import { ShieldCheck, Users, Megaphone, Coins, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'pending' | 'users' | 'stats';

const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState<Tab>('pending');
  const [stats, setStats] = useState<any>(null);
  const [pendingProfiles, setPendingProfiles] = useState<IProfile[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Reject modal state
  const [rejectModal, setRejectModal] = useState<{ open: boolean; userId: string; name: string }>({ open: false, userId: '', name: '' });
  const [rejectReason, setRejectReason] = useState('');

  // Coin modal state
  const [coinModal, setCoinModal] = useState<{ open: boolean; userId: string; name: string }>({ open: false, userId: '', name: '' });
  const [coinAmount, setCoinAmount] = useState('');
  const [coinNote, setCoinNote] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, pendingRes, usersRes] = await Promise.all([
          adminAPI.getDashboardStats(),
          adminAPI.getPendingProfiles(),
          adminAPI.getAllUsers({ limit: 20 }),
        ]);
        setStats(statsRes.data.stats);
        setPendingProfiles(pendingRes.data.profiles || []);
        setUsers(usersRes.data.users || []);
      } catch {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      await adminAPI.approveProfile(userId);
      setPendingProfiles((p) => p.filter((pr) => (pr.userId as any)?._id !== userId));
      toast.success('Profile approved ✅');
    } catch { toast.error('Failed to approve'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('Please provide a reason'); return; }
    setActionLoading(rejectModal.userId);
    try {
      await adminAPI.rejectProfile(rejectModal.userId, { reason: rejectReason });
      setPendingProfiles((p) => p.filter((pr) => (pr.userId as any)?._id !== rejectModal.userId));
      setRejectModal({ open: false, userId: '', name: '' });
      setRejectReason('');
      toast.success('Profile rejected');
    } catch { toast.error('Failed to reject'); }
    finally { setActionLoading(null); }
  };

  const handleAddCoins = async () => {
    if (!coinAmount || parseInt(coinAmount) <= 0) { toast.error('Enter a valid amount'); return; }
    setActionLoading(coinModal.userId);
    try {
      await adminAPI.addCoins(coinModal.userId, { amount: parseInt(coinAmount), reason: coinNote || 'Admin top-up' });
      setCoinModal({ open: false, userId: '', name: '' });
      setCoinAmount('');
      setCoinNote('');
      toast.success(`${coinAmount} coins added to ${coinModal.name}`);
    } catch { toast.error('Failed to add coins'); }
    finally { setActionLoading(null); }
  };

  const handleToggleUser = async (userId: string, isActive: boolean) => {
    setActionLoading(userId);
    try {
      await adminAPI.toggleUserStatus(userId);
      setUsers((u) => u.map((usr) => usr._id === userId ? { ...usr, isActive: !isActive } : usr));
      toast.success(isActive ? 'User suspended' : 'User activated');
    } catch { toast.error('Failed to update user'); }
    finally { setActionLoading(null); }
  };

  if (loading) return <PageLoading />;

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: 'pending', label: 'Pending Approvals', count: pendingProfiles.length },
    { key: 'users',   label: 'Users' },
    { key: 'stats',   label: 'Statistics' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage users, profiles, and platform settings</p>
      </div>

      {/* Quick stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Users size={22} />}       title="Total Users"    value={stats.totalUsers}       color="blue"   />
          <StatCard icon={<ShieldCheck size={22} />} title="Pending Review" value={stats.pendingProfiles}  color="orange" />
          <StatCard icon={<Megaphone size={22} />}   title="Campaigns"      value={stats.totalCampaigns}   color="purple" />
          <StatCard icon={<Coins size={22} />}       title="Applications"   value={stats.totalApplications} color="green"  />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {TABS.map(({ key, label, count }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
            {label}
            {count !== undefined && count > 0 && (
              <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Pending Profiles ── */}
      {tab === 'pending' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          {pendingProfiles.length === 0 ? (
            <EmptyState icon={<span className="text-5xl">✅</span>} title="All caught up!" description="No profiles awaiting approval." />
          ) : (
            <div className="divide-y">
              {pendingProfiles.map((profile) => {
                const u = profile.userId as any;
                const isLoading = actionLoading === u?._id;
                return (
                  <div key={profile._id} className="p-5 flex items-start gap-4">
                    <Avatar name={u?.name || 'User'} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{u?.name}</p>
                        <Badge status={u?.role} />
                        <span className="text-xs text-gray-400">{u?.email}</span>
                      </div>
                      {profile.bio && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{profile.bio}</p>}
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                        {(profile.niche?.length ?? 0) > 0 && <span>Niche: {profile.niche?.join(', ')}</span>}
                        {profile.followers && <span>Followers: {profile.followers.toLocaleString()}</span>}
                        {profile.businessName && <span>Business: {profile.businessName}</span>}
                        {profile.location && <span>📍 {profile.location}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={() => handleApprove(u?._id)} disabled={isLoading}
                        className="flex items-center gap-1 bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50">
                        {isLoading ? <Spinner size={14} /> : <Check size={14} />} Approve
                      </button>
                      <button onClick={() => setRejectModal({ open: true, userId: u?._id, name: u?.name })} disabled={isLoading}
                        className="flex items-center gap-1 bg-red-100 text-red-700 text-sm px-3 py-1.5 rounded-lg hover:bg-red-200 disabled:opacity-50">
                        <X size={14} /> Reject
                      </button>
                      <button onClick={() => setCoinModal({ open: true, userId: u?._id, name: u?.name })}
                        className="flex items-center gap-1 bg-yellow-100 text-yellow-700 text-sm px-3 py-1.5 rounded-lg hover:bg-yellow-200">
                        <Coins size={14} /> Add Coins
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Users ── */}
      {tab === 'users' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-6 py-3">User</th>
                  <th className="text-left px-6 py-3">Role</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Coins</th>
                  <th className="text-left px-6 py-3">Joined</th>
                  <th className="text-left px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><Badge status={u.role} /></td>
                    <td className="px-6 py-4"><Badge status={u.profileStatus} /></td>
                    <td className="px-6 py-4 font-semibold">🪙 {u.coinBalance}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCoinModal({ open: true, userId: u._id, name: u.name })}
                          className="text-xs text-yellow-600 hover:text-yellow-800 font-medium">
                          + Coins
                        </button>
                        {u.role !== 'superadmin' && (
                          <button onClick={() => handleToggleUser(u._id, (u as any).isActive !== false)}
                            disabled={actionLoading === u._id}
                            className={`text-xs font-medium ${(u as any).isActive !== false ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}>
                            {(u as any).isActive !== false ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      {tab === 'stats' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Users',      val: stats.totalUsers },
            { label: 'Creators',         val: stats.totalCreators },
            { label: 'Businesses',       val: stats.totalBusinesses },
            { label: 'Pending Profiles', val: stats.pendingProfiles },
            { label: 'Total Campaigns',  val: stats.totalCampaigns },
            { label: 'Open Campaigns',   val: stats.openCampaigns },
            { label: 'Applications',     val: stats.totalApplications },
          ].map(({ label, val }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-gray-500 text-sm">{label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{val ?? 0}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      <Modal isOpen={rejectModal.open} onClose={() => setRejectModal({ open: false, userId: '', name: '' })} title={`Reject ${rejectModal.name}'s Profile`} size="sm">
        <p className="text-sm text-gray-600 mb-3">Provide a reason so the user knows what to fix:</p>
        <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={4}
          placeholder="e.g. Incomplete bio, missing social links, blurry portfolio images…"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400 mb-4" />
        <div className="flex gap-3">
          <button onClick={() => setRejectModal({ open: false, userId: '', name: '' })} className="flex-1 py-2 border rounded-lg text-gray-700 text-sm">Cancel</button>
          <button onClick={handleReject} disabled={actionLoading === rejectModal.userId}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {actionLoading === rejectModal.userId && <Spinner size={14} />} Reject
          </button>
        </div>
      </Modal>

      {/* Add Coins Modal */}
      <Modal isOpen={coinModal.open} onClose={() => setCoinModal({ open: false, userId: '', name: '' })} title={`Add Coins to ${coinModal.name}`} size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Amount</label>
            <input type="number" value={coinAmount} onChange={(e) => setCoinAmount(e.target.value)} placeholder="e.g. 50" min={1}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Note (optional)</label>
            <input value={coinNote} onChange={(e) => setCoinNote(e.target.value)} placeholder="Reason for adding coins"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setCoinModal({ open: false, userId: '', name: '' })} className="flex-1 py-2 border rounded-lg text-gray-700 text-sm">Cancel</button>
            <button onClick={handleAddCoins} disabled={actionLoading === coinModal.userId}
              className="flex-1 bg-yellow-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-yellow-600 disabled:opacity-50 flex items-center justify-center gap-2">
              {actionLoading === coinModal.userId && <Spinner size={14} />} Add Coins
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
