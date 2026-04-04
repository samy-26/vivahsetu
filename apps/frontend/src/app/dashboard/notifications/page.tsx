'use client';
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCircle, Heart, Star, CreditCard, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications') as any,
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: () => api.patch('/notifications/read-all', {}),
    onSuccess: () => { toast.success('All marked as read'); qc.invalidateQueries({ queryKey: ['notifications'] }); },
  });

  const { mutate: markRead } = useMutation({
    mutationFn: (id: number) => api.patch(`/notifications/${id}/read`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = (data as any)?.data?.notifications || [];
  const unread = (data as any)?.data?.unread || 0;

  const typeIconMap: Record<string, { icon: React.ReactNode; bg: string }> = {
    interest: { icon: <Heart className="w-4 h-4" />, bg: 'bg-rose-100 text-rose-600' },
    interest_response: { icon: <CheckCircle className="w-4 h-4" />, bg: 'bg-green-100 text-green-600' },
    subscription: { icon: <Star className="w-4 h-4" />, bg: 'bg-yellow-100 text-yellow-600' },
    payment: { icon: <CreditCard className="w-4 h-4" />, bg: 'bg-blue-100 text-blue-600' },
    message: { icon: <MessageCircle className="w-4 h-4" />, bg: 'bg-purple-100 text-purple-600' },
    default: { icon: <Bell className="w-4 h-4" />, bg: 'bg-gray-100 text-gray-600' },
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unread > 0 && <p className="text-sm text-gray-500">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={() => markAllRead()} className="btn-outline text-sm py-2 px-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((n: any) => (
          <div key={n.id}
            onClick={() => !n.isRead && markRead(n.id)}
            className={`card cursor-pointer hover:shadow-md transition-all flex items-start gap-4 ${!n.isRead ? 'border-l-4 border-l-primary-500' : ''}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${(typeIconMap[n.type] || typeIconMap.default).bg}`}>
              {(typeIconMap[n.type] || typeIconMap.default).icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-gray-900 ${!n.isRead ? 'text-primary-700' : ''}`}>{n.title}</p>
              <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
            </div>
            {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />}
          </div>
        ))}
        {!notifications.length && (
          <div className="text-center py-16 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
