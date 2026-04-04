'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Heart, Users, CheckCircle, TrendingUp, ChevronRight,
  AlertCircle, Search, Star, User, MapPin, GraduationCap,
  Bell, Flame, BookOpen,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { formatDate } from '@/lib/utils';

const bridePhotos = [
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/women/68.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
  'https://randomuser.me/api/portraits/women/29.jpg',
];
const groomPhotos = [
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/men/75.jpg',
  'https://randomuser.me/api/portraits/men/18.jpg',
  'https://randomuser.me/api/portraits/men/51.jpg',
];

const REGIONAL_TAGS = [
  { label: 'Madhya Pradesh', count: 210, color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { label: 'Maharashtra', count: 189, color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { label: 'Uttar Pradesh', count: 175, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { label: 'Karnataka', count: 154, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { label: 'Tamil Nadu', count: 142, color: 'bg-lime-50 text-lime-700 border-lime-200' },
  { label: 'Gujarat', count: 130, color: 'bg-green-50 text-green-700 border-green-200' },
  { label: 'Rajasthan', count: 118, color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { label: 'Delhi NCR', count: 105, color: 'bg-sky-50 text-sky-700 border-sky-200' },
];

const GOTRA_TAGS = ['Bharadwaj', 'Kashyap', 'Vashisht', 'Atri', 'Shandilya', 'Gautam', 'Kaushik', 'Parashar'];

const BLOGS = [
  {
    title: 'Gotra & Pravara: Why Same-Gotra Marriage is Avoided',
    excerpt: 'Understanding the ancient Vedic concept of Gotra and its significance in Brahmana matrimonial alliances.',
    img: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?w=400&q=80',
    tag: 'Tradition', mins: 4,
  },
  {
    title: 'Ashtakoot Matching: The 36-Point Compatibility System',
    excerpt: 'A detailed look at how Guna Milan works and what score you should aim for in a match.',
    img: 'https://images.unsplash.com/photo-1470116945706-e6bf5d5a53ca?w=400&q=80',
    tag: 'Kundli', mins: 6,
  },
  {
    title: 'Sapta Padi: Seven Steps of a Vedic Wedding',
    excerpt: 'Each of the seven vows taken around the sacred fire carries a deep spiritual meaning.',
    img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80',
    tag: 'Ritual', mins: 5,
  },
];

const MARRIAGE_PHOTOS = [
  'https://images.unsplash.com/photo-1631275536991-2eb43893dd0d?w=400&q=80',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&q=80',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&q=80',
];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-orange-100 overflow-hidden">
      <div className="skeleton aspect-[3/4] w-full" />
      <div className="p-2.5 space-y-1.5">
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="skeleton h-2.5 w-1/2 rounded" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/matchmaking/dashboard') as any,
  });

  const { data: recommendations, isLoading: recsLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => api.get('/matchmaking/recommendations?limit=6') as any,
  });

  const { data: interests } = useQuery({
    queryKey: ['interests-received'],
    queryFn: () => api.get('/interests/received?limit=4') as any,
  });

  const { data: subRes } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: () => api.get('/subscriptions/my') as any,
  });

  const s = (statsData as any)?.data || {};
  const profiles: any[] = (recommendations as any)?.data?.profiles || [];
  const receivedInterests: any[] = (interests as any)?.data?.interests || [];
  const activeSub = (subRes as any)?.data;
  const isBride = user?.role === 'BRIDE';
  const photos = isBride ? groomPhotos : bridePhotos;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden fade-up">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 75% 50%, #fff 0%, transparent 55%)' }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="heading-calligraphy text-2xl sm:text-3xl font-semibold">
              Namaste, {user?.email?.split('@')[0]}
            </h1>
            <p className="text-primary-200 text-sm mt-1">
              {user?.isApproved
                ? 'Your profile is live. Browse curated Brahmana matches below.'
                : 'Complete your profile to appear in search and speed up approval.'}
            </p>
            {activeSub && (
              <div className="mt-2 inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-medium px-3 py-1 rounded-full bounce-in">
                <CheckCircle className="w-3 h-3" />
                {activeSub.planType} Plan · {activeSub.remainingViews} contact views left
              </div>
            )}
          </div>
          {!user?.isApproved && (
            <Link href="/dashboard/profile/create"
              className="shrink-0 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-2 self-start sm:self-auto">
              <AlertCircle className="w-4 h-4" /> Complete Profile
            </Link>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-orange-100 p-4 shadow-sm">
                <div className="skeleton w-9 h-9 rounded-lg mb-3" />
                <div className="skeleton h-6 w-12 rounded mb-1" />
                <div className="skeleton h-3 w-20 rounded" />
              </div>
            ))
          : [
              { label: 'Interests Sent', value: s.sentInterests ?? 0, icon: Heart, bg: 'bg-rose-50', color: 'text-rose-500', d: 'stagger-1' },
              { label: 'Interests Received', value: s.receivedInterests ?? 0, icon: Bell, bg: 'bg-blue-50', color: 'text-blue-500', d: 'stagger-2' },
              { label: 'Accepted Matches', value: s.acceptedMatches ?? 0, icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600', d: 'stagger-3' },
              { label: 'Profile Views', value: s.profileViews ?? 0, icon: TrendingUp, bg: 'bg-purple-50', color: 'text-purple-500', d: 'stagger-4' },
            ].map((st) => (
              <div key={st.label} className={`bg-white rounded-xl border border-orange-100 p-4 shadow-sm card-lift bounce-in ${st.d}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${st.bg} mb-3`}>
                  <st.icon className={`w-4 h-4 ${st.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{st.value}</div>
                <div className="text-xs text-gray-500 mt-0.5 leading-tight">{st.label}</div>
              </div>
            ))
        }
      </div>

      {/* Main two-col */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">

          {/* Recommended matches */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Recommended Matches</h2>
              <Link href="/dashboard/profiles" className="text-xs text-primary-600 hover:underline flex items-center gap-0.5 font-medium">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {recsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : profiles.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {profiles.slice(0, 6).map((profile: any, idx: number) => (
                  <Link key={profile.id} href={`/dashboard/profiles/${profile.id}`}
                    className={`bg-white rounded-xl border border-orange-100 shadow-sm overflow-hidden group card-lift fade-up stagger-${idx + 1}`}>
                    <div className="relative">
                      <img src={photos[idx % photos.length]} alt={profile.name || 'Profile'}
                        className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-500" />
                      {profile.user?.isVerified && (
                        <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">Verified</span>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/65 to-transparent p-2.5">
                        <div className="text-white text-xs font-semibold truncate">{profile.name}</div>
                        <div className="text-white/75 text-[10px]">{profile.age} yrs{profile.city ? ` · ${profile.city}` : ''}</div>
                      </div>
                    </div>
                    {profile.gotra && (
                      <div className="px-2.5 py-1.5">
                        <span className="inline-block bg-saffron-50 text-saffron-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-saffron-200">
                          {profile.gotra}
                        </span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-orange-100 p-8 text-center">
                <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-500 mb-4">Complete your profile to see personalised matches.</p>
                <Link href="/dashboard/profile/create" className="btn-primary text-sm py-2 px-4 inline-block">Complete Profile</Link>
              </div>
            )}
          </div>

          {/* Wedding gallery */}
          <div>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Sacred Unions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MARRIAGE_PHOTOS.map((src, i) => (
                <div key={i} className={`rounded-xl overflow-hidden aspect-square fade-up stagger-${i + 1}`}>
                  <img src={src} alt={`Wedding ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Sub card */}
          {activeSub ? (
            <div className="bg-white rounded-xl border-l-4 border-l-green-500 border border-orange-100 p-4 shadow-sm fade-up">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-bold text-gray-900">{activeSub.planType} Active</span>
              </div>
              <p className="text-xs text-gray-500">{activeSub.remainingViews} contact views remaining</p>
              <p className="text-xs text-gray-400 mt-0.5">Expires {formatDate(activeSub.endDate)}</p>
              <Link href="/dashboard/subscription" className="mt-3 block text-center text-xs font-semibold text-primary-600 hover:underline">
                Manage Plan →
              </Link>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-4 shadow-sm fade-up">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-gray-900">Unlock Premium</span>
              </div>
              <p className="text-xs text-gray-600 mb-3">View contacts, match Kundli, and connect directly.</p>
              {['10–60 contact views', 'Priority listing', 'Kundli compatibility', 'Phone support'].map(f => (
                <div key={f} className="flex items-center gap-1.5 text-xs text-gray-700 mb-1">
                  <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />{f}
                </div>
              ))}
              <Link href="/dashboard/subscription" className="btn-primary text-xs py-2 px-4 block text-center w-full mt-3">View Plans</Link>
            </div>
          )}

          {/* Received interests */}
          <div className="bg-white rounded-xl border border-orange-100 shadow-sm overflow-hidden fade-up stagger-2">
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-orange-50">
              <h3 className="text-sm font-bold text-gray-900">Interests Received</h3>
              <Link href="/dashboard/interests" className="text-xs text-primary-600 hover:underline font-medium">All</Link>
            </div>
            {receivedInterests.length > 0 ? (
              <div className="divide-y divide-orange-50">
                {receivedInterests.slice(0, 4).map((interest: any, idx: number) => (
                  <Link key={interest.id} href={`/dashboard/profiles/${interest.senderId}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-cream-100 transition-colors">
                    <img src={photos[idx % photos.length]} alt="Profile"
                      className="w-9 h-9 rounded-full object-cover border border-orange-100 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-900 truncate">{interest.sender?.profile?.name || 'Unknown'}</div>
                      <div className="text-[11px] text-gray-400">{interest.sender?.profile?.age} yrs · {interest.sender?.profile?.city}</div>
                    </div>
                    <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-xs text-gray-400">No interests received yet</div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-orange-100 shadow-sm p-4 fade-up stagger-3">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-1.5">
              {[
                { href: '/dashboard/profiles', label: 'Browse Profiles', icon: Search, color: 'text-primary-500 bg-primary-50' },
                { href: '/dashboard/kundli', label: 'Check Compatibility', icon: Star, color: 'text-yellow-600 bg-yellow-50' },
                { href: '/dashboard/contacts', label: 'Viewed Contacts', icon: BookOpen, color: 'text-green-600 bg-green-50' },
                { href: '/dashboard/profile/create', label: 'Update Profile', icon: User, color: 'text-blue-500 bg-blue-50' },
              ].map((action) => (
                <Link key={action.href} href={action.href}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-cream-100 transition-colors group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color} shrink-0`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium group-hover:text-primary-600 transition-colors flex-1">{action.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Regional browse */}
      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-5 fade-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Browse by Region</h2>
            <p className="text-xs text-gray-500 mt-0.5">Find verified Brahmana profiles from your state</p>
          </div>
          <MapPin className="w-5 h-5 text-primary-400" />
        </div>
        <div className="flex flex-wrap gap-2">
          {REGIONAL_TAGS.map((r) => (
            <Link key={r.label} href={`/dashboard/profiles?state=${encodeURIComponent(r.label)}`}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors card-lift ${r.color}`}>
              <MapPin className="w-3 h-3" />{r.label} <span className="opacity-60">({r.count}+)</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Gotra browse */}
      <div className="bg-gradient-to-r from-saffron-50 to-amber-50 rounded-2xl border border-amber-100 shadow-sm p-5 fade-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Browse by Gotra</h2>
            <p className="text-xs text-gray-500 mt-0.5">Search within your preferred gotra or explore others</p>
          </div>
          <Flame className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex flex-wrap gap-2">
          {GOTRA_TAGS.map((g) => (
            <Link key={g} href={`/dashboard/profiles?gotra=${encodeURIComponent(g)}`}
              className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full border bg-white border-amber-200 text-amber-800 hover:bg-amber-50 transition-colors">
              {g}
            </Link>
          ))}
        </div>
      </div>

      {/* Blog section */}
      <div className="fade-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Wisdom & Tradition</h2>
          <Link href="/blog" className="text-xs text-primary-600 hover:underline flex items-center gap-0.5 font-medium">
            Read All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {BLOGS.map((b, i) => (
            <div key={b.title} className={`bg-white rounded-xl border border-orange-100 shadow-sm overflow-hidden card-lift fade-up stagger-${i + 1}`}>
              <div className="h-32 overflow-hidden">
                <img src={b.img} alt={b.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-semibold bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">{b.tag}</span>
                  <span className="text-[10px] text-gray-400">{b.mins} min read</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{b.title}</h3>
                <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{b.excerpt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
