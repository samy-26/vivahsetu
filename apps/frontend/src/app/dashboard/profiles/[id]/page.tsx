'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, MapPin, GraduationCap, Briefcase, Calendar, Heart,
  MessageCircle, CheckCircle, AlertCircle, Star, Users, Loader2,
  Phone, Mail, Lock, CreditCard, ChevronRight, Ruler, IndianRupee,
  Globe, Shield, Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

declare global { interface Window { Razorpay: any } }

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const bridePhotos = ['https://randomuser.me/api/portraits/women/44.jpg','https://randomuser.me/api/portraits/women/68.jpg','https://randomuser.me/api/portraits/women/12.jpg','https://randomuser.me/api/portraits/women/29.jpg','https://randomuser.me/api/portraits/women/55.jpg','https://randomuser.me/api/portraits/women/31.jpg'];
const groomPhotos = ['https://randomuser.me/api/portraits/men/32.jpg','https://randomuser.me/api/portraits/men/75.jpg','https://randomuser.me/api/portraits/men/18.jpg','https://randomuser.me/api/portraits/men/51.jpg','https://randomuser.me/api/portraits/men/40.jpg','https://randomuser.me/api/portraits/men/63.jpg'];

function ContactCard({ email, phone, alreadyViewed }: { email: string; phone: string; alreadyViewed?: boolean }) {
  return (
    <div className="space-y-2">
      {alreadyViewed && (
        <div className="flex items-center gap-1.5 text-[11px] text-green-700 bg-green-50 px-2.5 py-1.5 rounded-lg">
          <Eye className="w-3 h-3" /> Previously viewed — no views deducted
        </div>
      )}
      <div className="flex items-center gap-2.5 bg-green-50 rounded-xl px-3 py-2.5 border border-green-100">
        <Phone className="w-4 h-4 text-green-600 shrink-0" />
        <div className="min-w-0">
          <div className="text-[10px] text-gray-400 uppercase tracking-wide">Phone</div>
          <div className="text-sm font-bold text-gray-900">{phone}</div>
        </div>
      </div>
      <div className="flex items-center gap-2.5 bg-blue-50 rounded-xl px-3 py-2.5 border border-blue-100">
        <Mail className="w-4 h-4 text-blue-600 shrink-0" />
        <div className="min-w-0">
          <div className="text-[10px] text-gray-400 uppercase tracking-wide">Email</div>
          <div className="text-sm font-bold text-gray-900 break-all">{email}</div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const numId = Number(id);

  const [contactInfo, setContactInfo] = useState<{ email: string; phone: string; alreadyViewed?: boolean } | null>(null);
  const [kundliResult, setKundliResult] = useState<any>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => api.get(`/profiles/${id}`) as any,
  });

  const { data: subRes } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: () => api.get('/subscriptions/my') as any,
  });

  const { data: myKundliRes } = useQuery({
    queryKey: ['kundli-details'],
    queryFn: () => (api.get('/kundli/details') as any).catch(() => null),
    retry: false,
  });

  const profile = (data as any)?.data;
  const isBride = profile?.user?.role === 'BRIDE';
  const photo = isBride
    ? bridePhotos[numId % bridePhotos.length]
    : groomPhotos[numId % groomPhotos.length];

  const myHasKundli = !!(myKundliRes as any)?.data?.birthDate;
  const partnerHasKundli = !!(profile?.user?.kundliDetails?.birthDate);

  const activeSub = (subRes as any)?.data;
  const hasSubscription = !!activeSub;
  const remainingViews = activeSub?.remainingViews ?? 0;

  // If API says this contact was already viewed, load it immediately — no button shown
  useEffect(() => {
    if (profile?.revealedContact && !contactInfo) {
      setContactInfo({ ...profile.revealedContact, alreadyViewed: true });
    }
  }, [profile]);

  const sendInterest = useMutation({
    mutationFn: () => api.post(`/interests/${id}`, {}),
    onSuccess: () => { toast.success('Interest sent!'); queryClient.invalidateQueries({ queryKey: ['profile', id] }); },
    onError: (e: any) => toast.error(e?.message || 'Already sent or failed'),
  });

  const viewContact = useMutation({
    mutationFn: () => api.post(`/profiles/${id}/contact`, {}) as any,
    onSuccess: (res: any) => {
      const d = res?.data;
      if (d?.contactRevealed) {
        setContactInfo({ email: d.email, phone: d.phone, alreadyViewed: d.alreadyViewed });
        if (!d.alreadyViewed) {
          toast.success(`Contact revealed! ${d.remainingViews} views remaining`);
          queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
        }
      } else {
        toast.error(d?.reason === 'no_subscription'
          ? 'No active subscription. Please subscribe first.'
          : 'Could not reveal contact');
      }
    },
    onError: (e: any) => toast.error(e?.message || 'Failed to view contact'),
  });

  const kundliOrder = useMutation({
    mutationFn: () => api.post('/payments/create-order', { amount: 101, purpose: 'kundli_matchmaking', metadata: { partnerId: numId } }) as any,
    onSuccess: (res: any) => {
      const order = res.data;
      const options = {
        key: order.keyId, amount: order.amount, currency: order.currency,
        name: 'VivahSetu', description: 'Kundli Matchmaking Report', order_id: order.orderId,
        handler: async (response: any) => {
          try {
            await api.post('/payments/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            const report = await api.post(`/kundli/matchmaking/${numId}`, {}) as any;
            setKundliResult(report?.data);
            toast.success('Kundli matching report generated!');
          } catch (e: any) { toast.error(e?.message || 'Matchmaking failed after payment'); }
        },
        prefill: { name: user?.email?.split('@')[0] },
        theme: { color: '#CC3322' },
      };
      new window.Razorpay(options).open();
    },
    onError: () => toast.error('Failed to create order'),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  if (isError || !profile) return (
    <div className="text-center py-20 px-4">
      <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile not found</h3>
      <Link href="/dashboard/profiles" className="text-primary-500 hover:underline text-sm">Back to Profiles</Link>
    </div>
  );

  const infoFields = [
    { label: 'Age', value: profile.age ? `${profile.age} years` : null, icon: Calendar },
    { label: 'Height', value: profile.height, icon: Ruler },
    { label: 'Location', value: [profile.city, profile.state].filter(Boolean).join(', ') || null, icon: MapPin },
    { label: 'Education', value: profile.education, icon: GraduationCap },
    { label: 'Occupation', value: profile.profession, icon: Briefcase },
    { label: 'Income', value: profile.income, icon: IndianRupee },
    { label: 'Mother Tongue', value: profile.motherTongue, icon: Globe },
    { label: 'Gotra', value: profile.gotra, icon: Users },
    { label: 'Marital Status', value: profile.maritalStatus, icon: Heart },
    { label: 'Country', value: profile.country, icon: MapPin },
  ].filter(f => f.value);

  return (
    <div className="max-w-4xl mx-auto space-y-4 px-0 sm:px-0">

      {/* Back */}
      <button onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Profiles
      </button>

      {/* Hero card */}
      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
        {/* Cover gradient */}
        <div className="h-32 sm:h-44 bg-gradient-to-r from-primary-200 to-saffron-200 relative">
          <img src={photo} alt={profile.name} className="w-full h-full object-cover object-top opacity-25" />
          {profile.user?.isVerified && (
            <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium shadow">
              <CheckCircle className="w-3 h-3" /> Verified
            </div>
          )}
        </div>

        {/* Avatar + info */}
        <div className="relative px-4 sm:px-6 pb-4 sm:pb-5">
          <div className="absolute -top-10 sm:-top-14 left-4 sm:left-6">
            <img src={photo} alt={profile.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white shadow-lg object-cover object-top" />
          </div>

          <div className="pt-12 sm:pt-14 flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{profile.name}</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {profile.age && `${profile.age} yrs · `}
                {[profile.city, profile.state].filter(Boolean).join(', ')}
              </p>
              <p className="text-xs text-primary-600 mt-1 font-medium">
                {isBride ? 'Bride — Looking for Groom' : 'Groom — Looking for Bride'}
              </p>
            </div>
            {profile.gotra && (
              <div className="bg-saffron-50 border border-saffron-200 rounded-xl px-3 py-2 text-center">
                <div className="text-xs text-gray-500">Gotra</div>
                <div className="font-bold text-saffron-700 text-sm">{profile.gotra}</div>
              </div>
            )}
          </div>

          {/* Action row — fully responsive */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button onClick={() => sendInterest.mutate()} disabled={sendInterest.isPending}
              className="flex-1 min-w-[110px] btn-primary flex items-center justify-center gap-1.5 text-sm py-2.5">
              {sendInterest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
              <span>Send Interest</span>
            </button>
            <Link href={`/dashboard/chat?partner=${id}`}
              className="flex-1 min-w-[110px] btn-secondary flex items-center justify-center gap-1.5 text-sm py-2.5">
              <MessageCircle className="w-4 h-4" /><span>Message</span>
            </Link>
            {/* Contact button — only show if contact not yet revealed */}
            {!contactInfo && (
              hasSubscription ? (
                <button
                  onClick={() => viewContact.mutate()}
                  disabled={viewContact.isPending}
                  className="flex-1 min-w-[130px] bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {viewContact.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                  <span>View Contact</span>
                </button>
              ) : (
                <Link href="/dashboard/subscription"
                  className="flex-1 min-w-[130px] bg-gray-100 hover:bg-primary-50 hover:border-primary-300 border border-gray-200 text-gray-700 font-semibold text-sm py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                  <Lock className="w-4 h-4" /><span>Subscribe</span>
                </Link>
              )
            )}
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left — details */}
        <div className="lg:col-span-2 space-y-4">

          {/* Profile fields */}
          {infoFields.length > 0 && (
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 sm:p-5">
              <h2 className="font-bold text-gray-900 mb-4 text-xs uppercase tracking-widest text-primary-600">Profile Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {infoFields.map((field) => (
                  <div key={field.label} className="flex items-start gap-2">
                    <div className="w-7 h-7 bg-cream-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <field.icon className="w-3.5 h-3.5 text-primary-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{field.label}</div>
                      <div className="text-sm text-gray-900 font-medium capitalize mt-0.5 truncate">{field.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About */}
          {profile.bio && (
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 sm:p-5">
              <h2 className="font-bold text-gray-900 mb-3 text-xs uppercase tracking-widest text-primary-600">About</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Family Details */}
          {profile.user?.familyDetails && (
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 sm:p-5">
              <h2 className="font-bold text-gray-900 mb-4 text-xs uppercase tracking-widest text-primary-600">Family Background</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: "Father's Occupation", value: profile.user.familyDetails.fatherOccupation },
                  { label: "Mother's Occupation", value: profile.user.familyDetails.motherOccupation },
                  { label: 'Siblings', value: profile.user.familyDetails.siblings },
                  { label: 'Family Type', value: profile.user.familyDetails.familyType },
                  { label: 'Family Values', value: profile.user.familyDetails.familyValues },
                ].filter(f => f.value).map((item) => (
                  <div key={item.label}>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">{item.label}</div>
                    <div className="text-gray-900 font-medium capitalize">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Partner Kundli */}
          {profile.user?.kundliDetails && (
            <div className="bg-yellow-50 rounded-2xl border border-yellow-200 shadow-sm p-4 sm:p-5">
              <h2 className="font-bold text-gray-900 mb-3 text-xs uppercase tracking-widest flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" /> Kundli Details
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Date of Birth', value: profile.user.kundliDetails.birthDate ? new Date(profile.user.kundliDetails.birthDate).toLocaleDateString('en-IN') : null },
                  { label: 'Birth Place', value: profile.user.kundliDetails.birthPlace },
                  { label: 'Rashi', value: profile.user.kundliDetails.rashi },
                  { label: 'Nakshatra', value: profile.user.kundliDetails.nakshatra },
                ].filter(f => f.value).map(item => (
                  <div key={item.label}>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide font-medium mb-0.5">{item.label}</div>
                    <div className="text-gray-900 font-semibold capitalize">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">

          {/* Contact Info card */}
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4">
            <h3 className="font-bold text-gray-900 text-xs mb-3 flex items-center gap-2 uppercase tracking-widest text-primary-600">
              <Phone className="w-3.5 h-3.5" /> Contact Details
            </h3>

            {contactInfo ? (
              <ContactCard email={contactInfo.email} phone={contactInfo.phone} alreadyViewed={contactInfo.alreadyViewed} />
            ) : hasSubscription ? (
              <div>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                  Uses <span className="font-semibold text-primary-600">1 view</span> from your plan.{' '}
                  {remainingViews > 0 && <span className="text-green-600 font-medium">{remainingViews} remaining.</span>}
                </p>
                <button onClick={() => viewContact.mutate()} disabled={viewContact.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
                  {viewContact.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                  View Contact
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 mb-3 border border-gray-100">
                  <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-gray-700">Contact Hidden</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">Subscribe to view phone & email</div>
                  </div>
                </div>
                <Link href="/dashboard/subscription"
                  className="w-full btn-primary text-sm py-2.5 flex items-center justify-center gap-2 rounded-xl">
                  <CreditCard className="w-4 h-4" /> Subscribe to View
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Kundli Matchmaking */}
          <div className="bg-gradient-to-br from-yellow-50 to-saffron-50 rounded-2xl border border-yellow-200 shadow-sm p-4">
            <h3 className="font-bold text-gray-900 text-xs mb-1 flex items-center gap-2 uppercase tracking-widest">
              <Star className="w-3.5 h-3.5 text-yellow-500" /> Kundli Match
            </h3>
            <p className="text-xs text-gray-500 mb-3">Ashtakoot Gun Milan — 36-point score</p>

            {kundliResult ? (
              <div className="text-center py-2">
                <div className="text-4xl font-bold text-primary-600">{kundliResult.score?.total ?? '?'}<span className="text-lg text-gray-400">/36</span></div>
                <div className={`text-sm font-semibold mt-1 ${(kundliResult.score?.percentage ?? 0) >= 66 ? 'text-green-600' : (kundliResult.score?.percentage ?? 0) >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                  {(kundliResult.score?.percentage ?? 0) >= 66 ? 'Excellent Match!' : (kundliResult.score?.percentage ?? 0) >= 50 ? 'Good Match' : 'Needs Consideration'}
                </div>
                <a href={`${API_URL}/kundli/view/${kundliResult.pdfId}`} target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary-600 hover:underline">
                  View Full Report
                </a>
              </div>
            ) : !myHasKundli ? (
              <div>
                <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg mb-3 border border-amber-100">
                  Add your birth details first to match kundli.
                </p>
                <Link href="/dashboard/kundli"
                  className="w-full flex items-center justify-center gap-2 text-sm py-2.5 rounded-xl border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 font-semibold transition-colors">
                  <Star className="w-4 h-4" /> Set Up My Kundli
                </Link>
              </div>
            ) : !partnerHasKundli ? (
              <p className="text-xs text-gray-500 bg-white rounded-xl px-3 py-2.5 border border-gray-100">
                This profile hasn't added kundli details yet.
              </p>
            ) : (
              <div>
                <div className="bg-white rounded-xl px-3 py-2.5 mb-3 text-xs text-gray-600 space-y-1 border border-gray-100">
                  <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-green-500" /> Your kundli ready</div>
                  <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-green-500" /> Partner's kundli available</div>
                </div>
                <button onClick={() => kundliOrder.mutate()} disabled={kundliOrder.isPending}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {kundliOrder.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                  Match Kundli — Rs. 101
                </button>
              </div>
            )}
          </div>

          {/* Verified badge */}
          {profile.user?.isVerified && (
            <div className="bg-green-50 rounded-xl border border-green-200 p-3 flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <div className="text-xs font-semibold text-green-800">Aadhaar Verified</div>
                <div className="text-[11px] text-green-600">Identity confirmed</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
