'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, CreditCard, TrendingUp, Clock, CheckCircle, X, Eye, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminDashboard() {
  const qc = useQueryClient();

  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: () => api.get('/admin/dashboard') as any });
  const { data: pending } = useQuery({ queryKey: ['pending-profiles'], queryFn: () => api.get('/admin/profiles/pending?limit=5') as any });
  const { data: analytics } = useQuery({ queryKey: ['analytics'], queryFn: () => api.get('/admin/analytics') as any });

  const { mutate: approve, isPending: approving } = useMutation({
    mutationFn: (id: number) => api.post(`/admin/profiles/${id}/approve`, {}),
    onSuccess: () => { toast.success('Profile approved!'); qc.invalidateQueries({ queryKey: ['pending-profiles'] }); qc.invalidateQueries({ queryKey: ['admin-stats'] }); },
  });

  const { mutate: reject } = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => api.post(`/admin/profiles/${id}/reject`, { reason }),
    onSuccess: () => { toast.success('Rejection sent'); qc.invalidateQueries({ queryKey: ['pending-profiles'] }); },
  });

  const s = (stats as any)?.data || {};
  const a = (analytics as any)?.data?.last30Days || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">VivahSetu Platform Overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: s.totalUsers, icon: Users, color: 'text-blue-500 bg-blue-50', sub: `${s.totalBrides || 0} Brides · ${s.totalGrooms || 0} Grooms` },
          { label: 'Pending Approvals', value: s.pendingApprovals, icon: Clock, color: 'text-yellow-500 bg-yellow-50', sub: 'Awaiting review' },
          { label: 'Active Subscriptions', value: s.activeSubscriptions, icon: CreditCard, color: 'text-green-500 bg-green-50', sub: 'Current subscribers' },
          { label: 'Total Revenue', value: formatCurrency(s.totalRevenue || 0), icon: TrendingUp, color: 'text-purple-500 bg-purple-50', sub: 'All time' },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color} mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value ?? '-'}</div>
            <div className="text-sm font-medium text-gray-700">{stat.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Last 30 Days</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'New Users', value: a.newUsers },
            { label: 'Revenue', value: formatCurrency(a.revenue || 0) },
            { label: 'Transactions', value: a.transactions },
            { label: 'New Subscriptions', value: a.subscriptionsCreated },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-4">
              <div className="text-xl font-bold text-gray-900">{item.value ?? '-'}</div>
              <div className="text-sm text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
          <Link href="/admin/profiles" className="text-sm text-primary-500 hover:underline">View All</Link>
        </div>
        {(pending as any)?.data?.profiles?.length > 0 ? (
          <div className="space-y-3">
            {(pending as any).data.profiles.map((profile: any) => (
              <div key={profile.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'U')}&background=${profile.user?.role === 'BRIDE' ? 'B83248' : '2B5C9B'}&color=fff&size=48&bold=true`}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{profile.name}</p>
                  <p className="text-sm text-gray-500">{profile.age} yrs · {profile.city} · {profile.user?.role}</p>
                  <p className="text-xs text-gray-400">{profile.user?.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => approve(profile.id)} disabled={approving}
                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                    {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  </button>
                  <button onClick={() => reject({ id: profile.id, reason: 'Profile needs updates' })}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>All profiles reviewed!</p>
          </div>
        )}
      </div>
    </div>
  );
}
