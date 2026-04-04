'use client';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Star, ExternalLink, Plus, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function KundliPage() {
  const [tab, setTab] = useState<'details' | 'history' | 'matchmaking'>('details');
  const qc = useQueryClient();

  const { data: detailsRes, isLoading: detailsLoading } = useQuery({
    queryKey: ['kundli-details'],
    queryFn: () => (api.get('/kundli/details') as any).catch(() => null),
    retry: false,
  });
  const { data: history } = useQuery({
    queryKey: ['kundli-history'],
    queryFn: () => api.get('/kundli/history') as any,
    enabled: tab === 'history',
  });
  const { data: mmHistory } = useQuery({
    queryKey: ['mm-history'],
    queryFn: () => api.get('/kundli/matchmaking/history') as any,
    enabled: tab === 'matchmaking',
  });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: { birthDate: '', birthTime: '', birthPlace: '' },
  });

  // Populate form once the saved details load
  useEffect(() => {
    const d = (detailsRes as any)?.data;
    if (d) {
      reset({
        birthDate: d.birthDate ? d.birthDate.split('T')[0] : '',
        birthTime: d.birthTime || '',
        birthPlace: d.birthPlace || '',
      });
    }
  }, [detailsRes, reset]);

  const { mutate: saveDetails, isPending: saving } = useMutation({
    mutationFn: (data: any) => api.post('/kundli/details', data),
    onSuccess: () => {
      toast.success('Birth details saved!');
      qc.invalidateQueries({ queryKey: ['kundli-details'] });
    },
    onError: () => toast.error('Failed to save birth details'),
  });

  const { mutate: generateKundli, isPending: generating } = useMutation({
    mutationFn: () => api.post('/kundli/generate', {}),
    onSuccess: () => {
      toast.success('Kundli generated!');
      qc.invalidateQueries({ queryKey: ['kundli-history'] });
      setTab('history');
    },
    onError: (e: any) => toast.error(e?.message || 'Add birth details first'),
  });

  const hasSavedDetails = !!(detailsRes as any)?.data?.birthDate;
  const historyList: any[] = (history as any)?.data || [];
  const mmList: any[] = (mmHistory as any)?.data || [];

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Kundli</h1>
        <p className="text-gray-500 text-sm mt-0.5">Generate your Janam Patri and matchmaking reports</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-cream-200 rounded-xl p-1 w-fit">
        {[
          { id: 'details', label: 'Birth Details' },
          { id: 'history', label: 'My Kundlis' },
          { id: 'matchmaking', label: 'Matchmaking' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === id ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'details' && (
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Birth details form */}
          <div className="bg-white rounded-xl border border-orange-100 shadow-sm p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">Birth Details</h2>
            {detailsLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading saved details...
              </div>
            ) : (
              <form onSubmit={handleSubmit(saveDetails as any)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                    Date of Birth *
                  </label>
                  <input type="date" {...register('birthDate')} className="input-field" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                    Time of Birth
                  </label>
                  <input type="time" {...register('birthTime')} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                    Place of Birth
                  </label>
                  <input
                    type="text"
                    {...register('birthPlace')}
                    className="input-field"
                    placeholder="e.g., Pune, Maharashtra"
                  />
                </div>
                {hasSavedDetails && (
                  <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    <CheckCircle className="w-3.5 h-3.5" /> Details already saved — update anytime
                  </div>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {hasSavedDetails ? 'Update Birth Details' : 'Save Birth Details'}
                </button>
              </form>
            )}
          </div>

          {/* Generate card */}
          <div className="bg-gradient-to-br from-primary-50 to-saffron-50 rounded-xl border border-orange-100 shadow-sm p-5 flex flex-col">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">Generate Kundli</h2>
            <p className="text-gray-500 text-sm mb-4">
              Complete Janam Patri with planetary positions, rashi, nakshatra, and lagna chart.
            </p>
            <div className="bg-white rounded-xl p-4 mb-5 space-y-2 flex-1">
              {['Rashi (Moon Sign)', 'Nakshatra', 'Planetary Positions', 'Lagna (Ascendant)', 'Manglik Status', 'Printable PDF view'].map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" /> {f}
                </div>
              ))}
            </div>
            {!hasSavedDetails && (
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-3">
                Save your birth details above before generating.
              </p>
            )}
            <button
              onClick={() => generateKundli()}
              disabled={generating || !hasSavedDetails}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Generate Kundli
            </button>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-4">My Kundli History</h2>
          {historyList.length > 0 ? (
            <div className="space-y-3">
              {historyList.map((item: any) => (
                <div key={item.id} className="bg-white rounded-xl border border-orange-100 shadow-sm p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Kundli #{item.id}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Generated on {formatDate(item.createdAt)}</p>
                    </div>
                  </div>
                  <a
                    href={`${API_URL}/kundli/view/${item.pdfId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline text-sm py-1.5 px-4 flex items-center gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View & Print
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-orange-100">
              <Star className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="text-gray-500 text-sm">No Kundlis generated yet.</p>
              <button
                onClick={() => setTab('details')}
                className="text-primary-500 hover:underline text-sm mt-2 block mx-auto"
              >
                Add birth details to generate
              </button>
            </div>
          )}
        </div>
      )}

      {tab === 'matchmaking' && (
        <div>
          <h2 className="text-base font-bold text-gray-900 mb-1">Matchmaking Reports</h2>
          <p className="text-gray-500 text-sm mb-4">Ashtakoot Gun Milan compatibility reports (Rs. 101 each)</p>
          {mmList.length > 0 ? (
            <div className="space-y-3">
              {mmList.map((item: any) => (
                <div key={item.id} className="bg-white rounded-xl border border-orange-100 shadow-sm p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {item.partner?.profile?.name || 'Partner'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Score: {item.score}/36 · {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-orange-100">
              <p className="text-gray-500 text-sm">No matchmaking reports yet.</p>
              <Link href="/dashboard/interests" className="text-primary-500 hover:underline text-sm mt-2 inline-block">
                Accept interests to generate reports
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
