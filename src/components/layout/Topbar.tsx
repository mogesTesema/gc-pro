import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Bell, Search, X, Check, Dot } from 'lucide-react';
import { notificationsAPI } from '../../api/client';
import { INotification } from '../../types';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/campaigns':     'Browse Campaigns',
  '/campaigns/my':  'My Campaigns',
  '/campaigns/create': 'Post Campaign',
  '/applications':  'My Applications',
  '/chat':          'Messages',
  '/profile':       'My Profile',
  '/coins':         'Coins',
  '/creators':      'Find Creators',
  '/admin':         'Admin Panel',
};

const Topbar: React.FC<{ onMenuToggle: () => void }> = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unread, setUnread]   = useState(0);
  const [open, setOpen]       = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const pageTitle = Object.entries(PAGE_TITLES)
    .find(([path]) => location.pathname.startsWith(path))?.[1] || 'AACP';

  useEffect(() => {
    notificationsAPI.getAll({ limit: 12 }).then(r => {
      setNotifications(r.data.notifications || []);
      setUnread(r.data.unreadCount || 0);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('notification:new', (n: INotification) => {
      setNotifications(p => [n, ...p.slice(0, 11)]);
      setUnread(c => c + 1);
      toast(n.title, { icon: '🔔', duration: 3000 });
    });
    return () => { socket.off('notification:new'); };
  }, [socket]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const markAll = async () => {
    await notificationsAPI.markAllRead().catch(() => {});
    setNotifications(p => p.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const timeAgo = (d: string) => {
    const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins/60)}h ago`;
    return `${Math.floor(mins/1440)}d ago`;
  };

  const notifIcons: Record<string, string> = {
    profile_approved: '✅', profile_rejected: '❌', new_application: '📋',
    application_accepted: '🎉', application_rejected: '😔', new_message: '💬',
    coins_added: '🪙', campaign_match: '🎯', rating_received: '⭐',
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-5 gap-4 sticky top-0 z-10">
      {/* Mobile menu */}
      <button onClick={onMenuToggle}
        className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition">
        <Menu size={19} className="text-gray-600" />
      </button>

      {/* Page title */}
      <div className="flex-1">
        <h1 className="text-base font-bold text-gray-900">{pageTitle}</h1>
      </div>

      {/* Profile status pill */}
      {user?.profileStatus === 'pending' && (
        <div className="hidden sm:flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
          Profile under review
        </div>
      )}

      {/* Notifications */}
      <div className="relative" ref={panelRef}>
        <button onClick={() => setOpen(v => !v)}
          className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition">
          <Bell size={19} className="text-gray-600" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 animate-bounce">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-down">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <div>
                <p className="font-bold text-gray-900 text-sm">Notifications</p>
                {unread > 0 && <p className="text-xs text-gray-500">{unread} unread</p>}
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAll}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium bg-blue-50 px-2 py-1 rounded-lg">
                    <Check size={11} /> All read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-200 transition">
                  <X size={14} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Bell size={32} className="text-gray-200 mb-2" />
                  <p className="text-sm text-gray-500">All caught up!</p>
                </div>
              ) : notifications.map(n => (
                <div key={n._id} className={`flex gap-3 px-4 py-3 hover:bg-gray-50 transition cursor-pointer ${!n.isRead ? 'bg-blue-50/60' : ''}`}>
                  <div className="text-xl shrink-0 mt-0.5">{notifIcons[n.type] || '🔔'}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${!n.isRead ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Avatar */}
      <Link to="/profile"
        className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-bold text-sm hover:opacity-90 transition shadow-md">
        {user?.name?.[0]?.toUpperCase()}
      </Link>
    </header>
  );
};

export default Topbar;
