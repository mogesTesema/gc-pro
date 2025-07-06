import React, { useState, useEffect } from 'react';
import { superAdminAPI } from '../../api/client';
import { PageLoading, StatCard, Avatar, Badge, EmptyState } from '../../components/common/index';
import { Shield, Users, Megaphone, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await superAdminAPI.getStats();
        setStats(res.data.stats);
        setRecentLogs(res.data.recentLogs || []);
      } catch { toast.error('Failed to load super admin stats'); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <PageLoading />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Platform-wide control center</p>
          </div>
        </div>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Users size={22} />} title="Total Users" value={stats.totalUsers} color="blue" />
            <StatCard icon={<Shield size={22} />} title="Admins" value={stats.totalAdmins} color="purple" />
            <StatCard icon={<Megaphone size={22} />} title="Campaigns" value={stats.totalCampaigns} color="green" />
            <StatCard icon={<AlertTriangle size={22} />} title="Open Disputes" value={stats.openDisputes} color="orange" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Creators', value: stats.totalCreators, color: 'bg-indigo-50 text-indigo-700' },
              { label: 'Businesses', value: stats.totalBusinesses, color: 'bg-teal-50 text-teal-700' },
              { label: 'Applications', value: stats.totalApplications, color: 'bg-green-50 text-green-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
                <p className="text-gray-600 font-medium">{label}</p>
                <span className={`text-2xl font-bold px-3 py-1 rounded-xl ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Activity size={18} className="text-purple-500" />
          <h2 className="text-base font-bold text-gray-900">Recent Activity</h2>
        </div>
        {recentLogs.length === 0 ? (
          <EmptyState icon={<TrendingUp size={40} className="text-gray-300" />} title="No activity yet" description="Actions taken by admins will appear here." />
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log: any) => (
              <div key={log._id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
                <Avatar name={(log.actorId as any)?.name || 'System'} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{(log.actorId as any)?.name}</p>
                    <Badge status={(log.actorId as any)?.role || 'admin'} />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{log.action?.replace(/_/g, ' ')}</p>
                  {log.details && <p className="text-xs text-gray-400 mt-0.5 truncate">{log.details}</p>}
                </div>
                <p className="text-xs text-gray-400 shrink-0">{new Date(log.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
