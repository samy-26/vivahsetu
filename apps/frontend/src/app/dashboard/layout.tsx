'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Heart, Home, Search, MessageCircle, Bell, User,
  Settings, LogOut, CreditCard, Star, ChevronDown, BookOpen,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { getInitials } from '@/lib/utils';
import { useState } from 'react';
import VivahSetuLogo from '@/components/VivahSetuLogo';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/profiles', label: 'Find Match', icon: Search },
  { href: '/dashboard/interests', label: 'Interests', icon: Heart },
  { href: '/dashboard/contacts', label: 'Contacts', icon: BookOpen },
  { href: '/dashboard/chat', label: 'Messages', icon: MessageCircle },
  { href: '/dashboard/kundli', label: 'Kundli', icon: Star },
  { href: '/dashboard/subscription', label: 'Membership', icon: CreditCard },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, _hasHydrated } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) router.push('/auth/login');
  }, [_hasHydrated, isAuthenticated, router]);

  // Wait for Zustand to rehydrate from localStorage before deciding to redirect
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-orange-100 shadow-sm h-14">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
          {/* Logo */}
          <VivahSetuLogo size="md" href="/dashboard" />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-cream-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary-500' : ''}`} />
                  <span className="hidden lg:block">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: notifications + profile */}
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/notifications"
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-cream-200 rounded-lg relative"
            >
              <Bell className="w-5 h-5" />
            </Link>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 hover:bg-cream-200 rounded-lg py-1.5 px-2 transition-colors"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-bold text-xs">{getInitials(user.email)}</span>
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-gray-900 leading-tight">{user.email.split('@')[0]}</div>
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${user.isVerified ? 'bg-green-500' : 'bg-yellow-400'}`} />
                    <span className="text-xs text-gray-400">{user.isVerified ? 'Verified' : 'Pending'}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1 overflow-hidden">
                    <div className="px-4 py-3 border-b border-orange-50">
                      <div className="text-sm font-semibold text-gray-900 truncate">{user.email}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{user.role}</div>
                    </div>
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream-100 transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" /> My Profile
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream-100 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-400" /> Settings
                    </Link>
                    <div className="border-t border-orange-50 my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-14 pb-20 md:pb-6 min-h-screen">
        <div key={pathname} className="max-w-6xl mx-auto px-4 sm:px-6 py-6 page-transition">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-orange-100 shadow-lg">
        <div className="flex overflow-x-auto scrollbar-hide h-16">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 transition-colors flex-shrink-0 w-16 h-full ${
                  isActive ? 'text-primary-500' : 'text-gray-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-500' : ''}`} />
                <span className="text-[9px] font-medium leading-tight text-center">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
