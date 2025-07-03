import React, { useState, useEffect } from 'react';
import { superAdminAPI } from '../../api/client';
import { PageLoading, Avatar, Badge, Modal, Spinner, EmptyState } from '../../components/common/index';
import { Scale, AlertCircle, CheckCircle, Clock, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_ICONS: Record<string, React.ReactNode> = {
  open: <AlertCircle size={16} className="text-red-500" />,
  under_review: <Clock size={16} className="text-amber-500" />,
  resolved: <CheckCircle size={16} className="text-green-500" />,
  dismissed: <CheckCircle size={16} className="text-gray-400" />,
};

const DisputeResolutionPage: React.FC = () => {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [resolveModal, setResolveModal] = useState<{ open: boolean; dispute: any | null }>({ open: false, dispute: null });
  const [resolution, setResolution] = useState('');
  const [resolveStatus, setResolveStatus] = useState('resolved');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await superAdminAPI.getDisputes({ status: statusFilter || undefined });
      setDisputes(res.data.disputes || []);
    } catch { toast.error('Failed to load disputes'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDisputes(); }, [statusFilter]);

  const handleResolve = async () => {
    if (!resolveModal.dispute || !resolution.trim()) { toast.error('Please enter a resolution'); return; }
    setActionLoading(true);
    try {
      await superAdminAPI.resolveDispute(resolveModal.dispute._id, { resolution, status: resolveStatus });
      toast.success('Dispute updated ✅');
      setResolveModal({ open: false, dispute: null });
      setResolution('');
      fetchDisputes();
    } catch { toast.error('Failed to update dispute'); }
    finally { setActionLoading(false); }
  };

  const statusColor: Record<string, string> = {
    open: 'bg-red-100 text-red-700',
    under_review: 'bg-amber-100 text-amber-700',
    resolved: 'bg-green-100 text-green-700',
    dismissed: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Scale size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dispute Resolution</h1>
            <p className="text-sm text-gray-500">{disputes.length} disputes found</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
            {['', 'open', 'under_review', 'resolved', 'dismissed'].map(s => (
              <option key={s} value={s}>{s ? s.replace('_', ' ') : 'All Disputes'}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? <PageLoading /> : disputes.length === 0 ? (
        <EmptyState icon={<Scale size={48} className="text-gray-300" />} title="No disputes found" description="No disputes match your current filter." />
      ) : (
        <div className="space-y-4">
          {disputes.map((d: any) => (
            <div key={d._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {STATUS_ICONS[d.status]}
                    <h3 className="font-bold text-gray-900">{d.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColor[d.status]}`}>
                      {d.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{d.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-gray-700">Raised by:</span>
                      <Avatar name={d.raisedBy?.name || 'User'} size="sm" />
                      <span>{d.raisedBy?.name}</span>
                      <Badge status={d.raisedBy?.role || 'creator'} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-gray-700">Against:</span>
                      <Avatar name={d.againstUser?.name || 'User'} size="sm" />
                      <span>{d.againstUser?.name}</span>
                    </div>
                  </div>
                  {d.resolution && (
                    <div className="mt-3 bg-green-50 border border-green-100 rounded-lg p-3">
                      <p className="text-xs font-semibold text-green-700 mb-1">Resolution</p>
                      <p className="text-sm text-green-800">{d.resolution}</p>
                    </div>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-gray-400 mb-3">{new Date(d.createdAt).toLocaleDateString()}</p>
                  {!['resolved', 'dismissed'].includes(d.status) && (
                    <button onClick={() => { setResolveModal({ open: true, dispute: d }); setResolution(''); setResolveStatus('resolved'); }}
                      className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 font-medium">
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={resolveModal.open} onClose={() => setResolveModal({ open: false, dispute: null })} title="Resolve Dispute" size="md">
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="font-semibold text-gray-900">{resolveModal.dispute?.title}</p>
            <p className="text-sm text-gray-600 mt-1">{resolveModal.dispute?.description}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Resolution</label>
            <textarea value={resolution} onChange={e => setResolution(e.target.value)} rows={4}
              placeholder="Describe the resolution and any actions taken..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Outcome</label>
            <select value={resolveStatus} onChange={e => setResolveStatus(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
              <option value="under_review">Mark Under Review</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setResolveModal({ open: false, dispute: null })} className="flex-1 py-2.5 border rounded-xl text-gray-700 text-sm">Cancel</button>
            <button onClick={handleResolve} disabled={actionLoading}
              className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {actionLoading && <Spinner size={14} />} Submit Resolution
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DisputeResolutionPage;
