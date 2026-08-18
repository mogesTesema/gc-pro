import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../api/client';
import { IUser } from '../../types';
import { PageLoading, Badge, Avatar, Modal, Spinner, ConfirmDialog } from '../../components/common/index';
import { Users, Search, Filter, Coins, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = ['', 'creator', 'business', 'admin', 'superadmin'];
const STATUSES = ['', 'pending', 'approved', 'rejected'];

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [coinModal, setCoinModal] = useState<{ open: boolean; userId: string; name: string }>({ open: false, userId: '', name: '' });
  const [coinAmount, setCoinAmount] = useState('');
  const [coinNote, setCoinNote] = useState('');
  const [confirmToggle, setConfirmToggle] = useState<{ open: boolean; user: IUser | null }>({ open: false, user: null });
  const LIMIT = 15;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllUsers({ page, limit: LIMIT, role: roleFilter || undefined, status: statusFilter || undefined });
      setUsers(res.data.users || []);
      setTotal(res.data.pagination?.total || 0);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAddCoins = async () => {
    if (!coinAmount || parseInt(coinAmount) <= 0) { toast.error('Enter a valid amount'); return; }
    setActionLoading(coinModal.userId);
    try {
      await adminAPI.addCoins(coinModal.userId, { amount: parseInt(coinAmount), reason: coinNote || 'Admin top-up' });
      setCoinModal({ open: false, userId: '', name: '' });
      setCoinAmount(''); setCoinNote('');
      toast.success(`${coinAmount} coins added`);
      fetchUsers();
    } catch { toast.error('Failed to add coins'); }
    finally { setActionLoading(null); }
  };

  const handleToggle = async () => {
    if (!confirmToggle.user) return;
    const u = confirmToggle.user;
    setActionLoading(u._id);
    try {
      await adminAPI.toggleUserStatus(u._id);
      setUsers(prev => prev.map(usr => usr._id === u._id ? { ...usr, isActive: !(usr as any).isActive } : usr));
      toast.success((u as any).isActive ? 'User suspended' : 'User activated');
      setConfirmToggle({ open: false, user: null });
    } catch { toast.error('Failed to update user'); }
    finally { setActionLoading(null); }
  };

  const filtered = users.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Users size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        </div>
        <p className="text-gray-500 text-sm ml-12">{total} total users on the platform</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-gray-400" />
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
            {ROLES.map(r => <option key={r} value={r}>{r || 'All Roles'}</option>)}
          </select>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
            {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <PageLoading /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['User', 'Role', 'Status', 'Coins', 'Active', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} avatar={u.avatar} size="sm" />
                        <div>
                          <p className="font-semibold text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><Badge status={u.role} /></td>
                    <td className="px-5 py-3.5"><Badge status={u.profileStatus} /></td>
                    <td className="px-5 py-3.5"><span className="font-semibold text-amber-600">🪙 {u.coinBalance}</span></td>
                    <td className="px-5 py-3.5">
                      {(u as any).isActive !== false
                        ? <span className="flex items-center gap-1 text-green-600 text-xs font-medium"><ToggleRight size={16} />Yes</span>
                        : <span className="flex items-center gap-1 text-red-500 text-xs font-medium"><ToggleLeft size={16} />No</span>}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCoinModal({ open: true, userId: u._id, name: u.name })}
                          className="text-xs px-2.5 py-1.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 font-medium flex items-center gap-1">
                          <Coins size={12} /> Coins
                        </button>
                        {u.role !== 'superadmin' && (
                          <button onClick={() => setConfirmToggle({ open: true, user: u })} disabled={actionLoading === u._id}
                            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition ${(u as any).isActive !== false ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
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
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-40"><ChevronLeft size={16} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border hover:bg-gray-50 disabled:opacity-40"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={coinModal.open} onClose={() => setCoinModal({ open: false, userId: '', name: '' })} title={`Add Coins to ${coinModal.name}`} size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Amount</label>
            <input type="number" value={coinAmount} onChange={e => setCoinAmount(e.target.value)} min={1} placeholder="e.g. 50"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Note</label>
            <input value={coinNote} onChange={e => setCoinNote(e.target.value)} placeholder="Reason..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setCoinModal({ open: false, userId: '', name: '' })} className="flex-1 py-2.5 border rounded-xl text-gray-700 text-sm">Cancel</button>
            <button onClick={handleAddCoins} disabled={actionLoading === coinModal.userId}
              className="flex-1 bg-amber-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2">
              {actionLoading === coinModal.userId && <Spinner size={14} />} Add Coins
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={confirmToggle.open} onClose={() => setConfirmToggle({ open: false, user: null })} onConfirm={handleToggle}
        title={(confirmToggle.user as any)?.isActive !== false ? 'Suspend User?' : 'Activate User?'}
        message={(confirmToggle.user as any)?.isActive !== false ? `This will block ${confirmToggle.user?.name} from logging in.` : `This will restore access for ${confirmToggle.user?.name}.`}
        confirmLabel={(confirmToggle.user as any)?.isActive !== false ? 'Suspend' : 'Activate'}
        danger={(confirmToggle.user as any)?.isActive !== false} loading={actionLoading === confirmToggle.user?._id} />
    </div>
  );
};

export default UserManagementPage;
