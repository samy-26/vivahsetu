'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function AdminProfilesPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'pending' | 'approved'>('pending');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-profiles', tab, page],
    queryFn: () => api.get(`/admin/profiles/pending?page=${page}&limit=10`) as any,
    enabled: tab === 'pending',
  });

  const { mutate: approve, isPending: approving } = useMutation({
    mutationFn: (id: number) => api.post(`/admin/profiles/${id}/approve`, {}),
    onSuccess: () => { toast.success('Profile approved!'); qc.invalidateQueries({ queryKey: ['admin-profiles'] }); },
  });

  const { mutate: reject } = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => api.post(`/admin/profiles/${id}/reject`, { reason }),
    onSuccess: () => { toast.success('Rejection sent'); qc.invalidateQueries({ queryKey: ['admin-profiles'] }); },
  });

  const profiles = (data as any)?.data?.profiles || [];
  const total = (data as any)?.data?.total || 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Management</h1>
        <p className="text-gray-500 text-sm">{total} profiles pending review</p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-4">
        {[{ id: 'pending', label: 'Pending' }, { id: 'approved', label: 'Approved' }].map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === id ? 'bg-white shadow text-primary-600' : 'text-gray-500'}`}>
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{['Profile', 'Age/Location', 'Email', 'Submitted', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-500">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {profiles.map((profile: any) => (
                <tr key={profile.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex-shrink-0 overflow-hidden">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'U')}&background=${profile.user?.role === 'BRIDE' ? 'B83248' : '2B5C9B'}&color=fff&size=40&bold=true`}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{profile.name}</p>
                        <p className="text-xs text-gray-400">{profile.user?.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{profile.age} yrs · {profile.city || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{profile.user?.email}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(profile.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => approve(profile.id)} disabled={approving} title="Approve"
                        className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                        {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button onClick={() => reject({ id: profile.id, reason: 'Profile needs updates' })} title="Reject"
                        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!profiles.length && (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">No pending profiles</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline text-sm py-2 px-4 disabled:opacity-50">Previous</button>
          <span className="text-sm text-gray-600 self-center">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-outline text-sm py-2 px-4 disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
