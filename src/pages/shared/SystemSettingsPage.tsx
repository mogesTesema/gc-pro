import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/client';
import { Spinner } from '../../components/common/index';
import { Settings, Lock, Bell, Globe, Palette, Save, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'account' | 'security' | 'notifications' | 'display';

const SystemSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('account');
  const [saving, setSaving] = useState(false);

  // Security
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // Notifications prefs (local only — can wire to backend)
  const [notifPrefs, setNotifPrefs] = useState({
    emailOnApplication: true,
    emailOnMessage: true,
    emailOnApproval: true,
    pushOnMessage: true,
    pushOnCampaignMatch: true,
  });

  // Display
  const [displayPrefs, setDisplayPrefs] = useState({ language: 'en', timezone: 'Africa/Addis_Ababa', currency: 'ETB' });

  const handleChangePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) { toast.error('Fill in all fields'); return; }
    if (passwords.newPassword !== passwords.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwords.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  const handleSavePrefs = () => {
    toast.success('Preferences saved');
  };

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'account', label: 'Account', icon: <Settings size={15} /> },
    { key: 'security', label: 'Security', icon: <Lock size={15} /> },
    { key: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
    { key: 'display', label: 'Display', icon: <Palette size={15} /> },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <Settings size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        </div>
        <p className="text-sm text-gray-500 ml-12">Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 flex-wrap">
        {TABS.map(({ key, label, icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {icon} {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* Account Tab */}
        {tab === 'account' && (
          <div className="space-y-5">
            <h2 className="font-bold text-gray-900 text-base">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1.5">Full Name</label>
                <input defaultValue={user?.name} readOnly
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1.5">Email</label>
                <input defaultValue={user?.email} readOnly
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1.5">Role</label>
                <input defaultValue={user?.role} readOnly
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed capitalize" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1.5">Coin Balance</label>
                <input defaultValue={`🪙 ${user?.coinBalance}`} readOnly
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-amber-50 text-amber-700 cursor-not-allowed font-semibold" />
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
              <CheckCircle size={15} className="shrink-0" />
              Profile status: <strong className="capitalize">{user?.profileStatus}</strong>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {tab === 'security' && (
          <div className="space-y-5">
            <h2 className="font-bold text-gray-900 text-base">Change Password</h2>
            {[
              { key: 'currentPassword', label: 'Current Password' },
              { key: 'newPassword', label: 'New Password' },
              { key: 'confirmPassword', label: 'Confirm New Password' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-sm font-medium text-gray-600 block mb-1.5">{label}</label>
                <input type="password" value={(passwords as any)[key]}
                  onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
              </div>
            ))}
            <button onClick={handleChangePassword} disabled={saving}
              className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-50">
              {saving ? <Spinner size={14} className="text-white" /> : <Save size={15} />} Update Password
            </button>
          </div>
        )}

        {/* Notifications Tab */}
        {tab === 'notifications' && (
          <div className="space-y-5">
            <h2 className="font-bold text-gray-900 text-base">Notification Preferences</h2>
            {Object.entries(notifPrefs).map(([key, val]) => {
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
              return (
                <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <p className="text-sm text-gray-700">{label}</p>
                  <button onClick={() => setNotifPrefs(p => ({ ...p, [key]: !val }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${val ? 'bg-blue-600' : 'bg-gray-200'}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${val ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              );
            })}
            <button onClick={handleSavePrefs}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700">
              <Save size={15} /> Save Preferences
            </button>
          </div>
        )}

        {/* Display Tab */}
        {tab === 'display' && (
          <div className="space-y-5">
            <h2 className="font-bold text-gray-900 text-base">Display Preferences</h2>
            {[
              { key: 'language', label: 'Language', options: [{ val: 'en', label: 'English' }, { val: 'am', label: 'Amharic' }] },
              { key: 'timezone', label: 'Timezone', options: [{ val: 'Africa/Addis_Ababa', label: 'Africa/Addis Ababa (EAT)' }, { val: 'UTC', label: 'UTC' }] },
              { key: 'currency', label: 'Currency', options: [{ val: 'ETB', label: 'Ethiopian Birr (ETB)' }, { val: 'USD', label: 'US Dollar (USD)' }] },
            ].map(({ key, label, options }) => (
              <div key={key}>
                <label className="text-sm font-medium text-gray-600 block mb-1.5">{label}</label>
                <select value={(displayPrefs as any)[key]} onChange={e => setDisplayPrefs(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-400">
                  {options.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                </select>
              </div>
            ))}
            <button onClick={handleSavePrefs}
              className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800">
              <Save size={15} /> Save Display Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemSettingsPage;
