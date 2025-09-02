import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../../api/client';
import { INotification } from '../../types';
import { PageLoading, EmptyState } from '../../components/common/index';
import { Bell, CheckCheck, Filter, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const NOTIF_ICONS: Record<string, string> = {
  profile_approved: '✅',
  profile_rejected: '❌',
  new_application: '📋',
  application_accepted: '🎉',
  application_rejected: '😞',
  new_message: '💬',
  collaboration_started: '🤝',
  work_completed: '🏆',
  rating_received: '⭐',
  coins_added: '🪙',
  campaign_match: '🎯',
};

const NotificationCenterPage: React.FC = () => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.getAll();
      setNotifications(res.data.notifications || []);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch { toast.error('Failed'); }
    finally { setMarkingAll(false); }
  };

  const filtered = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Bell size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
            <p className="text-sm text-gray-500">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchNotifications} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition">
            <RefreshCw size={15} />
          </button>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} disabled={markingAll}
              className="flex items-center gap-1.5 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium disabled:opacity-50">
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 w-fit">
        {(['all', 'unread'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition capitalize ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {f} {f === 'unread' && unreadCount > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5">{unreadCount}</span>}
          </button>
        ))}
      </div>

      {loading ? <PageLoading /> : filtered.length === 0 ? (
        <EmptyState icon={<Bell size={48} className="text-gray-300" />} title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'} description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {filtered.map(n => (
            <div key={n._id} onClick={() => !n.isRead && handleMarkRead(n._id)}
              className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition ${n.isRead ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100 hover:bg-blue-100/70'}`}>
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-xl shrink-0">
                {NOTIF_ICONS[n.type] || '🔔'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${n.isRead ? 'text-gray-800' : 'text-gray-900'}`}>{n.title}</p>
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                </div>
                <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationCenterPage;
