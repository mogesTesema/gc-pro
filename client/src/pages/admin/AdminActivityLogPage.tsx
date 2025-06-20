import React, { useState, useEffect, useCallback } from 'react';
import { superAdminAPI } from '../../api/client';
import { PageLoading, Avatar, Badge, EmptyState } from '../../components/common/index';
import { Activity, Search, Filter, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const ACTION_COLORS: Record<string, string> = {
  CREATE_ADMIN: 'bg-green-100 text-green-700',
  UPDATE_ADMIN: 'bg-blue-100 text-blue-700',
  DELETE_ADMIN: 'bg-red-100 text-red-700',
  RESOLVE_DISPUTE: 'bg-purple-100 text-purple-700',
  DEFAULT: 'bg-gray-100 text-gray-600',
};

const AdminActivityLogPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');

  const ACTIONS = ['', 'CREATE_ADMIN', 'UPDATE_ADMIN', 'DELETE_ADMIN', 'RESOLVE_DISPUTE'];

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await superAdminAPI.getActivityLogs({ page, limit: 30, action: actionFilter || undefined });
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load activity logs'); }
    finally { setLoading(false); }
  }, [page, actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = logs.filter(l => !search ||
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    (l.actorId as any)?.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.details?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-600 to-gray-700 flex items-center justify-center">
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Activity Log</h1>
            <p className="text-sm text-gray-500">{total} total audit events</p>
          </div>
        </div>
        <button onClick={fetchLogs} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
            {ACTIONS.map(a => <option key={a} value={a}>{a || 'All Actions'}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <PageLoading /> : filtered.length === 0 ? (
          <EmptyState icon={<Activity size={40} className="text-gray-300" />} title="No logs found" description="No activity matching your filters." />
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((log: any) => {
              const colorClass = ACTION_COLORS[log.action] || ACTION_COLORS.DEFAULT;
              return (
                <div key={log._id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition">
                  <Avatar name={(log.actorId as any)?.name || 'System'} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">{(log.actorId as any)?.name || 'System'}</p>
                      <Badge status={(log.actorId as any)?.role || 'admin'} />
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
                        {log.action?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {log.details && <p className="text-xs text-gray-500 mt-1">{log.details}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {total > 30 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Showing {Math.min(30, filtered.length)} of {total}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={logs.length < 30}
                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActivityLogPage;
