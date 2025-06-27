import React, { useState, useEffect } from 'react';
import { superAdminAPI } from '../../api/client';
import { IUser } from '../../types';
import { PageLoading, Avatar, Badge, Modal, Spinner, ConfirmDialog, EmptyState } from '../../components/common/index';
import { ShieldPlus, Pencil, Trash2, Plus, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

type AdminForm = { name: string; email: string; password: string };
const EMPTY_FORM: AdminForm = { name: '', email: '', password: '' };

const AdminManagementPage: React.FC = () => {
  const [admins, setAdmins] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState<{ open: boolean; admin: IUser | null }>({ open: false, admin: null });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; admin: IUser | null }>({ open: false, admin: null });
  const [form, setForm] = useState<AdminForm>(EMPTY_FORM);

  const fetchAdmins = async () => {
    try {
      const res = await superAdminAPI.getAdmins();
      setAdmins(res.data.admins || []);
    } catch { toast.error('Failed to load admins'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) { toast.error('All fields are required'); return; }
    setActionLoading(true);
    try {
      await superAdminAPI.createAdmin(form);
      toast.success('Admin created ✅');
      setCreateModal(false);
      setForm(EMPTY_FORM);
      fetchAdmins();
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed to create admin'); }
    finally { setActionLoading(false); }
  };

  const handleUpdate = async () => {
    if (!editModal.admin) return;
    setActionLoading(true);
    try {
      await superAdminAPI.updateAdmin(editModal.admin._id, { name: form.name, email: form.email });
      toast.success('Admin updated');
      setEditModal({ open: false, admin: null });
      setForm(EMPTY_FORM);
      fetchAdmins();
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed to update'); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.admin) return;
    setActionLoading(true);
    try {
      await superAdminAPI.deleteAdmin(deleteConfirm.admin._id);
      toast.success('Admin deleted');
      setDeleteConfirm({ open: false, admin: null });
      fetchAdmins();
    } catch (e: any) { toast.error(e?.response?.data?.message || 'Failed to delete'); }
    finally { setActionLoading(false); }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
            <ShieldPlus size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
            <p className="text-sm text-gray-500">{admins.length} admins on the platform</p>
          </div>
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setCreateModal(true); }}
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-violet-700 transition shadow-sm">
          <Plus size={16} /> New Admin
        </button>
      </div>

      {admins.length === 0 ? (
        <EmptyState icon={<UserCheck size={48} className="text-gray-300" />} title="No admins yet" description="Create the first admin account." />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Admin', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {admins.map(admin => (
                <tr key={admin._id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={admin.name} avatar={admin.avatar} size="sm" />
                      <div>
                        <p className="font-semibold text-gray-900">{admin.name}</p>
                        <p className="text-xs text-gray-400">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><Badge status={admin.role} /></td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${(admin as any).isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {(admin as any).isActive !== false ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{new Date(admin.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    {admin.role !== 'superadmin' && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setForm({ name: admin.name, email: admin.email, password: '' }); setEditModal({ open: true, admin }); }}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteConfirm({ open: true, admin })}
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition"><Trash2 size={14} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create New Admin" size="sm">
        <div className="space-y-4">
          {(['name', 'email', 'password'] as const).map(field => (
            <div key={field}>
              <label className="text-sm font-medium text-gray-700 block mb-1.5 capitalize">{field}</label>
              <input type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                placeholder={field === 'name' ? 'Admin Name' : field === 'email' ? 'admin@example.com' : 'Min 6 characters'}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400" />
            </div>
          ))}
          <div className="flex gap-3 pt-1">
            <button onClick={() => setCreateModal(false)} className="flex-1 py-2.5 border rounded-xl text-gray-700 text-sm">Cancel</button>
            <button onClick={handleCreate} disabled={actionLoading}
              className="flex-1 bg-violet-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {actionLoading && <Spinner size={14} />} Create Admin
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal.open} onClose={() => setEditModal({ open: false, admin: null })} title="Edit Admin" size="sm">
        <div className="space-y-4">
          {(['name', 'email'] as const).map(field => (
            <div key={field}>
              <label className="text-sm font-medium text-gray-700 block mb-1.5 capitalize">{field}</label>
              <input type={field === 'email' ? 'email' : 'text'} value={form[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          ))}
          <div className="flex gap-3 pt-1">
            <button onClick={() => setEditModal({ open: false, admin: null })} className="flex-1 py-2.5 border rounded-xl text-gray-700 text-sm">Cancel</button>
            <button onClick={handleUpdate} disabled={actionLoading}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {actionLoading && <Spinner size={14} />} Save Changes
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, admin: null })} onConfirm={handleDelete}
        title="Delete Admin?" message={`This will permanently remove ${deleteConfirm.admin?.name}'s admin account.`}
        confirmLabel="Delete" danger loading={actionLoading} />
    </div>
  );
};

export default AdminManagementPage;
