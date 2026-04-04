'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Search, SlidersHorizontal, X, CheckCircle, MapPin, GraduationCap } from 'lucide-react';
import api from '@/lib/api';

const brideImgs = [
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/women/68.jpg',
  'https://randomuser.me/api/portraits/women/12.jpg',
  'https://randomuser.me/api/portraits/women/29.jpg',
  'https://randomuser.me/api/portraits/women/55.jpg',
  'https://randomuser.me/api/portraits/women/31.jpg',
  'https://randomuser.me/api/portraits/women/72.jpg',
  'https://randomuser.me/api/portraits/women/8.jpg',
];
const groomImgs = [
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/men/75.jpg',
  'https://randomuser.me/api/portraits/men/18.jpg',
  'https://randomuser.me/api/portraits/men/51.jpg',
  'https://randomuser.me/api/portraits/men/40.jpg',
  'https://randomuser.me/api/portraits/men/63.jpg',
  'https://randomuser.me/api/portraits/men/22.jpg',
  'https://randomuser.me/api/portraits/men/88.jpg',
];

const indianStates = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

export default function ProfilesPage() {
  const [filters, setFilters] = useState({ minAge: '', maxAge: '', city: '', state: '', gotra: '', maritalStatus: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const queryParams = new URLSearchParams({ page: String(page), limit: '12' });
  Object.entries(filters).forEach(([k, v]) => { if (v) queryParams.append(k, v); });

  const { data, isLoading } = useQuery({
    queryKey: ['profiles', filters, page],
    queryFn: () => api.get(`/profiles/search?${queryParams}`) as any,
  });

  const profiles = (data as any)?.data?.profiles || [];
  const total = (data as any)?.data?.total || 0;
  const totalPages = (data as any)?.data?.totalPages || 1;

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const clearFilters = () => {
    setFilters({ minAge: '', maxAge: '', city: '', state: '', gotra: '', maritalStatus: '' });
    setPage(1);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Find Your Match</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} verified profiles found</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 btn-outline text-sm py-2 px-4 relative"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Search Filters</h3>
            <div className="flex items-center gap-3">
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-sm text-primary-500 hover:underline flex items-center gap-1">
                  <X className="w-3.5 h-3.5" /> Clear All
                </button>
              )}
              <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Age Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minAge}
                  onChange={(e) => setFilters(f => ({ ...f, minAge: e.target.value }))}
                  className="input-field text-sm py-2"
                  min={18} max={60}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAge}
                  onChange={(e) => setFilters(f => ({ ...f, maxAge: e.target.value }))}
                  className="input-field text-sm py-2"
                  min={18} max={70}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
              <input
                type="text"
                placeholder="Enter city"
                value={filters.city}
                onChange={(e) => setFilters(f => ({ ...f, city: e.target.value }))}
                className="input-field text-sm py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
              <select
                value={filters.state}
                onChange={(e) => setFilters(f => ({ ...f, state: e.target.value }))}
                className="input-field text-sm py-2"
              >
                <option value="">All States</option>
                {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Gotra</label>
              <input
                type="text"
                placeholder="Enter gotra"
                value={filters.gotra}
                onChange={(e) => setFilters(f => ({ ...f, gotra: e.target.value }))}
                className="input-field text-sm py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Marital Status</label>
              <select
                value={filters.maritalStatus}
                onChange={(e) => setFilters(f => ({ ...f, maritalStatus: e.target.value }))}
                className="input-field text-sm py-2"
              >
                <option value="">All</option>
                <option>Single</option>
                <option>Divorced</option>
                <option>Widowed</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Profile Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="profile-card animate-pulse">
              <div className="aspect-[4/5] bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : profiles.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {profiles.map((profile: any, idx: number) => {
              const isBride = profile.user?.role === 'BRIDE';
              const photo = isBride ? brideImgs[idx % brideImgs.length] : groomImgs[idx % groomImgs.length];
              return (
              <Link key={profile.id} href={`/dashboard/profiles/${profile.id}`} className="profile-card group">
                <div className="relative overflow-hidden">
                  <img
                    src={photo}
                    alt={profile.name || 'Profile'}
                    className="w-full aspect-[4/5] object-cover object-top"
                  />
                  {profile.user?.isVerified && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                      <CheckCircle className="w-2.5 h-2.5" /> Verified
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <div className="text-white text-xs font-semibold">{profile.name}</div>
                    <div className="flex items-center gap-1 text-white/80 text-[10px]">
                      <MapPin className="w-2.5 h-2.5" />{profile.age} yrs · {profile.city || 'India'}
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  {profile.education && (
                    <div className="flex items-center gap-1 text-[11px] text-gray-500 truncate">
                      <GraduationCap className="w-3 h-3 shrink-0 text-primary-400" />{profile.education}
                    </div>
                  )}
                  {profile.gotra && (
                    <div className="text-[11px] text-primary-600 font-medium mt-0.5">Gotra: {profile.gotra}</div>
                  )}
                  <div className="mt-2 text-[11px] bg-primary-50 text-primary-700 rounded px-2 py-0.5 inline-block font-medium group-hover:bg-primary-100 transition-colors">
                    View Profile
                  </div>
                </div>
              </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-outline text-sm py-2 px-4 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-outline text-sm py-2 px-4 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-orange-100">
          <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-gray-900 mb-1">No profiles found</h3>
          <p className="text-gray-500 text-sm">
            {activeFilterCount > 0 ? 'Try adjusting your filters' : 'No profiles available yet'}
          </p>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="mt-4 btn-outline text-sm py-2 px-4">
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
