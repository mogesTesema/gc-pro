import React from 'react';
import { X, Loader2 } from 'lucide-react';

// ─── Spinner ─────────────────────────────────────────────
export const Spinner: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = '',
}) => (
  <Loader2 size={size} className={`animate-spin text-blue-600 ${className}`} />
);

export const PageLoading: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <Spinner size={32} />
  </div>
);

// ─── Badge ────────────────────────────────────────────────
const badgeColors: Record<string, string> = {
  open: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-purple-100 text-purple-800',
  closed: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  accepted: 'bg-green-100 text-green-800',
  withdrawn: 'bg-gray-100 text-gray-600',
  negotiating: 'bg-orange-100 text-orange-800',
  active: 'bg-blue-100 text-blue-800',
  creator: 'bg-indigo-100 text-indigo-800',
  business: 'bg-teal-100 text-teal-800',
  admin: 'bg-pink-100 text-pink-800',
};

export const Badge: React.FC<{ status: string; label?: string }> = ({ status, label }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
      badgeColors[status] || 'bg-gray-100 text-gray-700'
    }`}
  >
    {label || status.replace(/_/g, ' ')}
  </span>
);

// ─── Empty State ──────────────────────────────────────────
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {icon && <div className="text-gray-300 mb-4 text-6xl">{icon}</div>}
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    {description && <p className="text-gray-500 text-sm mt-1 max-w-xs">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// ─── Stat Card ────────────────────────────────────────────
const statColors: Record<string, { bg: string; icon: string; text: string }> = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-500',   text: 'text-blue-900' },
  green:  { bg: 'bg-green-50',  icon: 'text-green-500',  text: 'text-green-900' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-500', text: 'text-purple-900' },
  orange: { bg: 'bg-orange-50', icon: 'text-orange-500', text: 'text-orange-900' },
  yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', text: 'text-yellow-900' },
  teal:   { bg: 'bg-teal-50',   icon: 'text-teal-500',   text: 'text-teal-900' },
};

export const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color?: string;
  subtitle?: string;
}> = ({ icon, title, value, color = 'blue', subtitle }) => {
  const c = statColors[color] || statColors.blue;
  return (
    <div className={`${c.bg} rounded-xl p-5`}>
      <div className={`${c.icon} mb-3`}>{icon}</div>
      <p className="text-sm text-gray-600 font-medium">{title}</p>
      <p className={`text-2xl font-bold ${c.text} mt-1`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};

// ─── Modal ────────────────────────────────────────────────
export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${widths[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
      </div>
    </div>
  );
};

// ─── Avatar ───────────────────────────────────────────────
export const Avatar: React.FC<{
  name: string;
  avatar?: string;
  size?: 'sm' | 'md' | 'lg';
  online?: boolean;
}> = ({ name, avatar, size = 'md', online }) => {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base' };
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div className="relative inline-block">
      {avatar ? (
        <img src={avatar} alt={name} className={`${sizes[size]} rounded-full object-cover`} />
      ) : (
        <div className={`${sizes[size]} rounded-full bg-blue-600 flex items-center justify-center font-semibold text-white`}>
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span className={`absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full border-2 border-white ${online ? 'bg-green-500' : 'bg-gray-400'}`} />
      )}
    </div>
  );
};

// ─── Confirm Dialog ───────────────────────────────────────
export const ConfirmDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
}> = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger, loading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <p className="text-gray-600 mb-6">{message}</p>
    <div className="flex gap-3 justify-end">
      <button onClick={onClose} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50 transition">
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={loading}
        className={`px-4 py-2 rounded-lg text-white font-medium transition disabled:opacity-50 flex items-center gap-2 ${
          danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading && <Spinner size={14} />}
        {confirmLabel}
      </button>
    </div>
  </Modal>
);
