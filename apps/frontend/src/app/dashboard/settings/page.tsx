'use client';
import { useState } from 'react';
import { Shield, Bell, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [notifications, setNotifications] = useState({
    emailInterests: true,
    emailMatches: true,
    emailMessages: false,
  });

  const changePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Please fill all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      await api.put('/users/me', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your account preferences</p>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary-500" /> Account Information
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <div>
              <div className="text-sm font-medium text-gray-900">Email Address</div>
              <div className="text-sm text-gray-500 mt-0.5">{user?.email}</div>
            </div>
            <span className="badge-verified">Registered</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-50">
            <div>
              <div className="text-sm font-medium text-gray-900">Account Status</div>
              <div className="text-sm text-gray-500 mt-0.5">
                {user?.isApproved ? 'Approved and active' : 'Pending admin approval'}
              </div>
            </div>
            <span className={user?.isApproved ? 'badge-verified' : 'badge badge-pending'}>
              {user?.isApproved ? 'Approved' : 'Pending'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-sm font-medium text-gray-900">Account Type</div>
              <div className="text-sm text-gray-500 mt-0.5 capitalize">{user?.role?.toLowerCase()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary-500" /> Change Password
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field pr-10"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              placeholder="Minimum 8 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="Repeat new password"
            />
          </div>
          <button
            onClick={changePassword}
            disabled={passwordLoading}
            className="btn-primary flex items-center gap-2"
          >
            {passwordLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Update Password
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary-500" /> Notification Preferences
        </h2>
        <div className="space-y-4">
          {[
            { key: 'emailInterests', label: 'Interest Notifications', desc: 'Email when someone sends you an interest' },
            { key: 'emailMatches', label: 'Match Notifications', desc: 'Email when an interest is accepted' },
            { key: 'emailMessages', label: 'Message Notifications', desc: 'Email when you receive a new message' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div>
                <div className="text-sm font-medium text-gray-900">{item.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
              </div>
              <button
                onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key as keyof typeof n] }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  notifications[item.key as keyof typeof notifications] ? 'bg-primary-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
        <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" /> Account Actions
        </h2>
        <p className="text-sm text-gray-600 mb-4">These actions cannot be undone. Please be careful.</p>
        <button
          onClick={() => {
            if (confirm('Are you sure you want to sign out?')) {
              logout();
              window.location.href = '/';
            }
          }}
          className="border border-red-300 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Sign Out from All Devices
        </button>
      </div>
    </div>
  );
}
