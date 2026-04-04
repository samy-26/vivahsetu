'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Heart, LayoutDashboard, Users, CreditCard, FileText, Image, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';

const adminNav = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/profiles', label: 'Profiles', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') router.push('/auth/login');
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-60 bg-gray-900 text-white flex flex-col fixed h-full z-20">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-white">VivahSetu</span>
              <span className="block text-xs text-gray-400">Admin Panel</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {adminNav.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-primary-500 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={() => { logout(); router.push('/'); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white w-full transition-colors">
            <LogOut className="w-4 h-4" />Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-60 p-6 overflow-auto min-h-screen">{children}</main>
    </div>
  );
}
