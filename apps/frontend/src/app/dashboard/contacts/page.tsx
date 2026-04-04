'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Phone, Mail, MapPin, Calendar, Loader2, Inbox } from 'lucide-react';
import api from '@/lib/api';

const bridePhotos = ['https://randomuser.me/api/portraits/women/44.jpg','https://randomuser.me/api/portraits/women/68.jpg','https://randomuser.me/api/portraits/women/12.jpg','https://randomuser.me/api/portraits/women/29.jpg','https://randomuser.me/api/portraits/women/55.jpg','https://randomuser.me/api/portraits/women/31.jpg'];
const groomPhotos = ['https://randomuser.me/api/portraits/men/32.jpg','https://randomuser.me/api/portraits/men/75.jpg','https://randomuser.me/api/portraits/men/18.jpg','https://randomuser.me/api/portraits/men/51.jpg','https://randomuser.me/api/portraits/men/40.jpg','https://randomuser.me/api/portraits/men/63.jpg'];

export default function ContactHistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['contact-history'],
    queryFn: () => api.get('/profiles/contact-history') as any,
  });

  const history = (data as any)?.data ?? [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Viewed Contacts</h1>
        <p className="text-gray-500 text-sm mt-1">All profiles whose contact details you have unlocked</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-orange-100">
          <Inbox className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 mb-1">No viewed contacts yet</h3>
          <p className="text-sm text-gray-400 mb-4">Browse profiles and use View Contact to unlock details</p>
          <Link href="/dashboard/profiles" className="btn-primary text-sm py-2 px-5 inline-flex">Find Matches</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item: any) => {
            const p = item.profile;
            const isBride = p.user?.role === 'BRIDE';
            const photo = isBride
              ? bridePhotos[p.id % bridePhotos.length]
              : groomPhotos[p.id % groomPhotos.length];
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4">
                {/* Avatar */}
                <img src={photo} alt={p.name}
                  className="w-16 h-16 rounded-xl object-cover object-top border-2 border-orange-100 shrink-0 self-start" />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <Link href={`/dashboard/profiles/${p.id}`}
                        className="font-bold text-gray-900 hover:text-primary-600 transition-colors text-base">
                        {p.name}
                      </Link>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-xs text-gray-500">
                        {p.age && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{p.age} yrs</span>}
                        {(p.city || p.state) && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{[p.city, p.state].filter(Boolean).join(', ')}</span>}
                        {p.profession && <span>{p.profession}</span>}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Contact details */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-lg px-3 py-1.5">
                      <Phone className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      <span className="text-sm font-semibold text-gray-900">{item.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="text-sm font-semibold text-gray-900 truncate">{item.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
