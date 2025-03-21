import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Megaphone, Users, MessageSquare, Bell,
  Coins, User, FileText, ShieldCheck, LogOut, TrendingUp,
  ChevronRight, Sparkles, Scale, Activity, Settings,
} from 'lucide-react';

const NAV: Record<string, { label: string; icon: any; to: string }[]> = {
  creator: [
    { label: 'Dashboard',        icon: LayoutDashboard, to: '/dashboard' },
    { label: 'Browse Campaigns', icon: Megaphone,       to: '/campaigns' },
    { label: 'My Applications',  icon: FileText,        to: '/applications' },
    { label: 'Messages',         icon: MessageSquare,   to: '/chat' },
    { label: 'My Profile',       icon: User,            to: '/profile' },
    { label: 'Coins',            icon: Coins,           to: '/coins' },
    { label: 'Notifications',    icon: Bell,            to: '/notifications' },
    { label: 'Settings',         icon: Settings,        to: '/settings' },
  ],
  business: [
    { label: 'Dashboard',        icon: LayoutDashboard, to: '/dashboard' },
    { label: 'My Campaigns',     icon: Megaphone,       to: '/campaigns/my' },
    { label: 'Find Creators',    icon: Users,           to: '/creators' },
    { label: 'AI Picks',         icon: Sparkles,        to: '/ai/recommendations' },
    { label: 'Performance',      icon: TrendingUp,      to: '/performance' },
    { label: 'Trust Scores',     icon: ShieldCheck,     to: '/trust-scores' },
    { label: 'Messages',         icon: MessageSquare,   to: '/chat' },
    { label: 'My Profile',       icon: User,            to: '/profile' },
    { label: 'Coins',            icon: Coins,           to: '/coins' },
    { label: 'Notifications',    icon: Bell,            to: '/notifications' },
    { label: 'Settings',         icon: Settings,        to: '/settings' },
  ],
  admin: [
    { label: 'Dashboard',        icon: LayoutDashboard, to: '/admin' },
    { label: 'Users',            icon: Users,           to: '/admin/users' },
    { label: 'Approvals',        icon: ShieldCheck,     to: '/admin/approvals' },
    { label: 'All Campaigns',    icon: Megaphone,       to: '/campaigns' },
    { label: 'Trust Scores',     icon: TrendingUp,      to: '/trust-scores' },
    { label: 'Notifications',    icon: Bell,            to: '/notifications' },
    { label: 'Settings',         icon: Settings,        to: '/settings' },
  ],
  superadmin: [
    { label: 'Super Dashboard',  icon: LayoutDashboard, to: '/superadmin' },
    { label: 'Admin Panel',      icon: ShieldCheck,     to: '/admin' },
    { label: 'Manage Admins',    icon: Users,           to: '/superadmin/admins' },
    { label: 'Activity Logs',    icon: Activity,        to: '/superadmin/logs' },
    { label: 'Disputes',         icon: Scale,           to: '/superadmin/disputes' },
    { label: 'All Campaigns',    icon: Megaphone,       to: '/campaigns' },
    { label: 'Trust Scores',     icon: TrendingUp,      to: '/trust-scores' },
    { label: 'Notifications',    icon: Bell,            to: '/notifications' },
    { label: 'Settings',         icon: Settings,        to: '/settings' },
  ],
};

const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = NAV[user?.role || 'creator'] || NAV.creator;

  const handleLogout = () => { logout(); navigate('/'); };

  const roleColors: Record<string, string> = {
    creator:    'from-blue-500 to-purple-600',
    business:   'from-teal-500 to-blue-600',
    admin:      'from-orange-500 to-red-500',
    superadmin: 'from-purple-600 to-pink-600',
  };
  const gradient = roleColors[user?.role || 'creator'];

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden" onClick={onClose} />}

      <aside className={`
        fixed top-0 left-0 h-full w-64 z-30 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}
        style={{ background: 'linear-gradient(170deg, #0F1340 0%, #1A2170 60%, #1E2A8C 100%)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
            <span className="text-white font-black text-base">A</span>
          </div>
          <div>
            <p className="font-black text-white text-base tracking-tight">AACP</p>
            <p className="text-xs text-blue-300 capitalize font-medium">{user?.role}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {items.map(({ label, icon: Icon, to }) => (
            <NavLink key={to} to={to} onClick={onClose}
              className={({ isActive }) => `
                group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-white/15 text-white shadow-inner border border-white/10'
                  : 'text-blue-200 hover:bg-white/8 hover:text-white'
                }
              `}>
              {({ isActive }) => (
                <>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isActive ? `bg-gradient-to-br ${gradient} shadow-md` : 'bg-white/5 group-hover:bg-white/10'
                  }`}>
                    <Icon size={16} className={isActive ? 'text-white' : 'text-blue-300'} />
                  </div>
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} className="text-blue-300 opacity-60" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* AI badge */}
        <div className="mx-3 mb-3 bg-gradient-to-r from-purple-600/30 to-blue-600/30 border border-purple-500/30 rounded-2xl p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={14} className="text-purple-300" />
            <span className="text-xs font-bold text-purple-200">AI Features Active</span>
          </div>
          <p className="text-xs text-blue-300">Gemini AI powers smart matching and creator analytics.</p>
        </div>

        {/* User profile */}
        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white text-sm shadow-md shrink-0`}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-blue-300 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Coin balance */}
          <NavLink to="/coins"
            className="flex items-center justify-between bg-white/8 hover:bg-white/12 rounded-xl px-3 py-2 mb-2 transition group"
            onClick={onClose}>
            <div className="flex items-center gap-2">
              <span className="text-base">🪙</span>
              <span className="text-xs text-blue-200 font-medium">Coins</span>
            </div>
            <span className="text-sm font-black text-yellow-300">{user?.coinBalance}</span>
          </NavLink>

          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-300 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
