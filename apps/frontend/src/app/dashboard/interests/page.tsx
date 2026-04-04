'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, CheckCircle, X, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';

export default function InterestsPage() {
  const [tab, setTab] = useState<'received' | 'sent' | 'matches'>('received');
  const qc = useQueryClient();

  const { data: received } = useQuery({ queryKey: ['received-interests'], queryFn: () => api.get('/interests/received') as any, enabled: tab === 'received' });
  const { data: sent } = useQuery({ queryKey: ['sent-interests'], queryFn: () => api.get('/interests/sent') as any, enabled: tab === 'sent' });
  const { data: matches } = useQuery({ queryKey: ['matches'], queryFn: () => api.get('/interests/matches') as any, enabled: tab === 'matches' });

  const { mutate: respond } = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.patch(`/interests/${id}/respond`, { status }),
    onSuccess: () => {
      toast.success('Response sent!');
      qc.invalidateQueries({ queryKey: ['received-interests'] });
      qc.invalidateQueries({ queryKey: ['matches'] });
    },
  });

  const getList = () => {
    if (tab === 'received') return (received as any)?.data?.interests || [];
    if (tab === 'sent') return (sent as any)?.data?.interests || [];
    return (matches as any)?.data || [];
  };

  const tabs = [
    { id: 'received' as const, label: 'Received', count: (received as any)?.data?.total },
    { id: 'sent' as const, label: 'Sent', count: (sent as any)?.data?.total },
    { id: 'matches' as const, label: 'Matches', count: (matches as any)?.data?.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Interests</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your profile interactions</p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map(({ id, label, count }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${tab === id ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}>
            {label}
            {count !== undefined && (
              <span className={`text-xs rounded-full px-1.5 ${tab === id ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-500'}`}>{count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {getList().map((item: any) => {
          const isReceived = tab === 'received';
          const person = isReceived ? item.sender : item.receiver;
          const profile = person?.profile;

          return (
            <div key={item.id} className="card flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || person?.email?.split('@')[0] || 'U')}&background=${person?.role === 'BRIDE' ? 'B83248' : '2B5C9B'}&color=fff&size=56&bold=true`}
                  alt={profile?.name || 'User'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/dashboard/profiles/${profile?.id}`} className="font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                  {profile?.name || person?.email?.split('@')[0] || 'User'}
                </Link>
                <p className="text-sm text-gray-500">{profile?.age ? `${profile.age} yrs · ` : ''}{profile?.city || ''}</p>
                {item.message && <p className="text-xs text-gray-400 mt-0.5 truncate">&ldquo;{item.message}&rdquo;</p>}
                <p className="text-xs text-gray-400">{formatRelativeTime(item.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {item.status === 'PENDING' && isReceived && (
                  <>
                    <button onClick={() => respond({ id: item.id, status: 'ACCEPTED' })} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="Accept">
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button onClick={() => respond({ id: item.id, status: 'REJECTED' })} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Reject">
                      <X className="w-5 h-5" />
                    </button>
                  </>
                )}
                {item.status === 'PENDING' && !isReceived && (
                  <span className="badge badge-pending flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
                )}
                {item.status === 'ACCEPTED' && (
                  <>
                    <span className="badge badge-verified flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Accepted</span>
                    <Link href={`/dashboard/chat?userId=${person?.id}`} className="btn-primary text-xs py-1.5 px-3">Chat</Link>
                  </>
                )}
                {item.status === 'REJECTED' && <span className="badge bg-red-100 text-red-700">Rejected</span>}
              </div>
            </div>
          );
        })}

        {getList().length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No {tab} interests yet.</p>
            {tab === 'sent' && (
              <Link href="/dashboard/profiles" className="text-primary-500 hover:underline text-sm mt-1 inline-block">Browse profiles to send interest</Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
