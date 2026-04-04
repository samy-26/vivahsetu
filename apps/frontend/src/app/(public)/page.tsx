import Link from 'next/link';
import Image from 'next/image';
import { Shield, Heart, Search, Star, Users, CheckCircle, ArrowRight, MapPin, GraduationCap } from 'lucide-react';

// Sample profiles shown on homepage (static for SEO/speed)
const featuredProfiles = [
  { id: 1, name: 'Priya Sharma', age: 24, city: 'Pune', state: 'MH', profession: 'Software Engineer', gotra: 'Bharadvaja', photo: 'https://randomuser.me/api/portraits/women/44.jpg', role: 'BRIDE' },
  { id: 2, name: 'Anusha Iyer', age: 26, city: 'Bangalore', state: 'KA', profession: 'Financial Analyst', gotra: 'Kaundinya', photo: 'https://randomuser.me/api/portraits/women/65.jpg', role: 'BRIDE' },
  { id: 3, name: 'Rahul Sharma', age: 28, city: 'Mumbai', state: 'MH', profession: 'Software Developer', gotra: 'Vishwamitra', photo: 'https://randomuser.me/api/portraits/men/32.jpg', role: 'GROOM' },
  { id: 4, name: 'Meera Tiwari', age: 23, city: 'Lucknow', state: 'UP', profession: 'Medical Doctor', gotra: 'Kashyapa', photo: 'https://randomuser.me/api/portraits/women/68.jpg', role: 'BRIDE' },
  { id: 5, name: 'Vikram Mishra', age: 29, city: 'Delhi', state: 'DL', profession: 'Physician', gotra: 'Bharadvaja', photo: 'https://randomuser.me/api/portraits/men/41.jpg', role: 'GROOM' },
  { id: 6, name: 'Divya Krishnan', age: 25, city: 'Chennai', state: 'TN', profession: 'IT Consultant', gotra: 'Vasishtha', photo: 'https://randomuser.me/api/portraits/women/79.jpg', role: 'BRIDE' },
  { id: 7, name: 'Deepak Menon', age: 30, city: 'Hyderabad', state: 'TS', profession: 'Senior Engineer', gotra: 'Agastya', photo: 'https://randomuser.me/api/portraits/men/52.jpg', role: 'GROOM' },
  { id: 8, name: 'Kavya Bhat', age: 27, city: 'Mangalore', state: 'KA', profession: 'Chartered Accountant', gotra: 'Atri', photo: 'https://randomuser.me/api/portraits/women/55.jpg', role: 'BRIDE' },
];

const successCouples = [
  { names: 'Priya & Rahul', location: 'Pune, Maharashtra', year: '2024', photo: 'https://picsum.photos/seed/couple1/300/300', score: 29 },
  { names: 'Anusha & Deepak', location: 'Bangalore, Karnataka', year: '2024', photo: 'https://picsum.photos/seed/couple2/300/300', score: 32 },
  { names: 'Meera & Vikram', location: 'Lucknow, Uttar Pradesh', year: '2025', photo: 'https://picsum.photos/seed/couple3/300/300', score: 27 },
];

const communities = [
  { name: 'Iyer / Iyengar', state: 'Tamil Nadu', members: '4,200+', color: 'bg-orange-50 border-orange-200' },
  { name: 'Deshastha', state: 'Maharashtra', members: '3,800+', color: 'bg-red-50 border-red-200' },
  { name: 'Kanyakubja', state: 'Uttar Pradesh', members: '3,100+', color: 'bg-yellow-50 border-yellow-200' },
  { name: 'Namboodiri', state: 'Kerala', members: '2,900+', color: 'bg-green-50 border-green-200' },
  { name: 'Saraswat', state: 'Karnataka / Goa', members: '2,700+', color: 'bg-blue-50 border-blue-200' },
  { name: 'Kashmiri Pandit', state: 'Pan India', members: '2,400+', color: 'bg-purple-50 border-purple-200' },
  { name: 'Kulin / Bengali', state: 'West Bengal', members: '2,200+', color: 'bg-pink-50 border-pink-200' },
  { name: 'Chitpavan', state: 'Maharashtra', members: '1,900+', color: 'bg-teal-50 border-teal-200' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream-100">

      {/* ── HERO ── */}
      <section className="pt-16 bg-gradient-to-br from-primary-600 via-primary-500 to-saffron-600 text-white relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/25 px-4 py-1.5 rounded-full text-sm font-medium">
                India's Most Trusted Brahmana Matrimonial
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Find Your Sacred<br />
                <span className="heading-calligraphy text-5xl lg:text-6xl italic text-saffron-200">Life Partner</span><br />
                Among Brahmana Families
              </h1>
              <p className="text-white/85 text-base leading-relaxed max-w-md">
                50,000+ verified Brahmana profiles. Aadhaar-verified identities, Kundli matching, and culturally aligned matchmaking — all on one trusted platform.
              </p>

              {/* Search bar */}
              <div className="bg-white rounded-xl p-3 flex gap-2 shadow-xl max-w-lg">
                <select className="flex-1 text-gray-700 text-sm px-3 py-2 rounded-lg bg-cream-100 border-0 outline-none focus:ring-2 focus:ring-primary-300">
                  <option>Looking for Bride</option>
                  <option>Looking for Groom</option>
                </select>
                <select className="flex-1 text-gray-700 text-sm px-3 py-2 rounded-lg bg-cream-100 border-0 outline-none focus:ring-2 focus:ring-primary-300">
                  <option>Age: 22-30</option>
                  <option>Age: 25-35</option>
                  <option>Age: 28-40</option>
                </select>
                <Link href="/auth/register" className="bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5" /> Search
                </Link>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-6 pt-1">
                {[
                  { count: '50,000+', label: 'Profiles' },
                  { count: '5,000+', label: 'Marriages' },
                  { count: '28', label: 'States' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-2xl font-bold text-saffron-300">{s.count}</div>
                    <div className="text-xs text-white/70 mt-0.5">{s.label}</div>
                  </div>
                ))}
                <div className="flex items-center gap-1 ml-2">
                  {Array.from({length:5}).map((_,i)=>(
                    <Star key={i} className="w-3.5 h-3.5 fill-saffron-400 text-saffron-400" />
                  ))}
                  <span className="text-xs text-white/80 ml-1">4.9 rated</span>
                </div>
              </div>
            </div>

            {/* Right: profile cards collage */}
            <div className="hidden lg:grid grid-cols-4 gap-2.5">
              {featuredProfiles.slice(0,8).map((p, i) => (
                <div key={p.id} className={`bg-white rounded-xl overflow-hidden shadow-lg ${i % 2 === 0 ? 'translate-y-3' : '-translate-y-1'}`}>
                  <div className="relative h-24">
                    <Image src={p.photo} alt={p.name} fill className="object-cover" sizes="100px" />
                  </div>
                  <div className="p-2">
                    <div className="text-xs font-semibold text-gray-900 truncate">{p.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-gray-400">{p.age} · {p.city}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative h-10 overflow-hidden">
          <svg viewBox="0 0 1440 40" className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path d="M0,40 C360,0 1080,0 1440,40 L1440,40 L0,40 Z" fill="#FFF9F2" />
          </svg>
        </div>
      </section>

      {/* ── FEATURED PROFILES ── */}
      <section className="py-10 bg-cream-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 reveal">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Today's Featured Profiles</h2>
              <p className="text-gray-500 text-sm mt-0.5">Verified Brahmana profiles active today</p>
            </div>
            <Link href="/auth/register" className="text-primary-500 hover:underline text-sm font-semibold flex items-center gap-1">
              View All Profiles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 reveal-group">
            {featuredProfiles.map((p) => (
              <Link key={p.id} href="/auth/register" className="profile-card group">
                <div className="relative h-52 overflow-hidden">
                  <Image src={p.photo} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width:640px) 50vw, 25vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                    <CheckCircle className="w-2.5 h-2.5" /> Verified
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <div className="font-semibold text-sm leading-tight">{p.name}</div>
                    <div className="text-xs text-white/80">{p.age} yrs · {p.city}</div>
                  </div>
                </div>
                <div className="p-3 bg-white">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                    <GraduationCap className="w-3 h-3 text-primary-400" />
                    <span className="truncate">{p.profession}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary-600 font-medium">Gotra: {p.gotra}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${p.role === 'BRIDE' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                      {p.role === 'BRIDE' ? 'Bride' : 'Groom'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNITY SECTIONS ── */}
      <section className="py-10 bg-white border-y border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 reveal">
            <h2 className="heading-calligraphy text-3xl lg:text-4xl font-semibold text-gray-900">Browse by Community</h2>
            <p className="text-gray-500 text-sm mt-1">Find profiles from your specific Brahmana sub-community</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 reveal-group">
            {communities.map((c) => (
              <Link key={c.name} href="/auth/register"
                className={`${c.color} border rounded-xl p-3 text-center hover:shadow-md transition-all group cursor-pointer`}>
                <div className="font-semibold text-gray-900 text-xs group-hover:text-primary-600 transition-colors leading-tight">{c.name}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{c.state}</div>
                <div className="text-xs font-bold text-primary-500 mt-1">{c.members}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-10 bg-cream-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 reveal">
            <h2 className="heading-calligraphy text-3xl lg:text-4xl font-semibold text-gray-900">How VivahSetu Works</h2>
          </div>
          <div className="grid sm:grid-cols-4 gap-4 reveal-group">
            {[
              { step: '01', icon: <Users className="w-5 h-5" />, title: 'Register Free', desc: 'Create your account in 2 minutes as Bride or Groom' },
              { step: '02', icon: <Shield className="w-5 h-5" />, title: 'Verify Profile', desc: 'Upload Aadhaar, fill personal and family details' },
              { step: '03', icon: <Search className="w-5 h-5" />, title: 'Browse Matches', desc: 'Search with filters: age, gotra, state, education' },
              { step: '04', icon: <Heart className="w-5 h-5" />, title: 'Connect & Meet', desc: 'Send interest, chat, and arrange family meetings' },
            ].map((item, i) => (
              <div key={item.step} className="bg-white rounded-xl p-5 border border-orange-100 shadow-sm relative">
                <div className="w-10 h-10 bg-primary-500 text-white rounded-xl flex items-center justify-center mb-3 shadow-md">
                  {item.icon}
                </div>
                <div className="absolute top-4 right-4 text-3xl font-black text-primary-50">{item.step}</div>
                <h3 className="font-bold text-gray-900 mb-1 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                {i < 3 && (
                  <div className="hidden sm:flex absolute top-1/2 -right-3 z-10 w-6 h-6 bg-primary-500 rounded-full items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUCCESS STORIES WITH COUPLE IMAGES ── */}
      <section className="py-10 bg-white border-y border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 reveal">
            <h2 className="heading-calligraphy text-3xl lg:text-4xl font-semibold text-gray-900">Happy Couples</h2>
            <p className="text-gray-500 text-sm mt-1">Thousands of Brahmana families found their match on VivahSetu</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 reveal-group">
            {successCouples.map((couple) => (
              <div key={couple.names} className="bg-cream-100 rounded-2xl overflow-hidden border border-orange-100 shadow-sm">
                <div className="relative h-52">
                  <Image src={couple.photo} alt={couple.names} fill className="object-cover" sizes="33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="font-bold text-base">{couple.names}</div>
                    <div className="flex items-center gap-1 text-xs text-white/80 mt-0.5">
                      <MapPin className="w-3 h-3" /> {couple.location}
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-gold-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    {couple.score}/36 Kundli
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({length:5}).map((_,i)=>(
                      <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">Married {couple.year}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    "VivahSetu made our connection possible. The Kundli matching and verified profiles gave our families complete confidence."
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Successful Marriages', value: '5,000+' },
              { label: 'States Covered', value: '28' },
              { label: 'Average Kundli Score', value: '28/36' },
              { label: 'Satisfaction Rate', value: '96%' },
            ].map((stat) => (
              <div key={stat.label} className="bg-primary-500 text-white rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-primary-100 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY VIVAHSETU ── */}
      <section className="py-10 bg-cream-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 reveal">
            <h2 className="heading-calligraphy text-3xl lg:text-4xl font-semibold text-gray-900">Why Brahmana Families Trust VivahSetu</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 reveal-group">
            {[
              { icon: <Shield className="w-5 h-5" />, title: 'Aadhaar Verified', desc: 'Every profile verified with Aadhaar — stored encrypted, never displayed.', color: 'bg-blue-50 text-blue-600 border-blue-200' },
              { icon: <Star className="w-5 h-5" />, title: 'Kundli Matching', desc: 'Authentic Ashtakoot Gun Milan — 8-koot compatibility scoring up to 36 points.', color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
              { icon: <Users className="w-5 h-5" />, title: 'Community-Only', desc: 'Exclusively for Brahmana families — Iyer, Namboodiri, Deshastha, Kashmiri Pandit and more.', color: 'bg-purple-50 text-purple-600 border-purple-200' },
              { icon: <Search className="w-5 h-5" />, title: 'Gotra Filtering', desc: 'Smart gotra compatibility — automatically excludes same-gotra profiles for tradition.', color: 'bg-green-50 text-green-600 border-green-200' },
              { icon: <Heart className="w-5 h-5" />, title: 'Admin Approved', desc: 'Manual admin review of every profile before it goes live — no fake profiles.', color: 'bg-red-50 text-red-600 border-red-200' },
              { icon: <CheckCircle className="w-5 h-5" />, title: 'Safe & Private', desc: 'Contact details hidden until subscription. Chat only after mutual interest acceptance.', color: 'bg-orange-50 text-orange-600 border-orange-200' },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-5 border border-orange-100 shadow-sm flex gap-4 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${f.color}`}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEMBERSHIP PLANS ── */}
      <section className="py-10 bg-white border-y border-orange-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 reveal">
            <h2 className="heading-calligraphy text-3xl lg:text-4xl font-semibold text-gray-900">Membership Plans</h2>
            <p className="text-gray-500 text-sm mt-1">Start free. Upgrade to connect with your match.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'Basic', price: '500', period: '/ month', popular: false, badge: null, features: ['10 profile views/month','Send interests','Basic chat','Email support'], cta: 'Get Basic' },
              { name: 'Standard', price: '1,500', period: '/ 6 months', popular: true, badge: 'Most Popular', features: ['50 contact views','6 months validity','Priority listing','Full chat access','Phone support'], cta: 'Get Standard' },
              { name: 'Platinum', price: '2,000', period: '/ lifetime', popular: false, badge: 'Best Value', features: ['60 contact views','Lifetime validity','Top priority listing','Unlimited chat','Dedicated manager','Kundli discounts'], cta: 'Get Platinum' },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-6 relative ${plan.popular ? 'bg-primary-500 text-white shadow-2xl scale-105' : 'bg-white border-2 border-orange-100 shadow-sm'}`}>
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${plan.popular ? 'bg-saffron-400 text-white' : 'bg-gold-500 text-white'}`}>
                    {plan.badge}
                  </div>
                )}
                <h3 className={`text-lg font-bold mb-1 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className={`text-xs mb-1 ${plan.popular ? 'text-primary-100' : 'text-gray-400'}`}>Rs.</span>
                  <span className={`text-3xl font-black ${plan.popular ? 'text-white' : 'text-primary-500'}`}>{plan.price}</span>
                  <span className={`text-xs mb-1 ${plan.popular ? 'text-primary-100' : 'text-gray-400'}`}>{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs">
                      <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${plan.popular ? 'text-saffron-300' : 'text-green-500'}`} />
                      <span className={plan.popular ? 'text-primary-100' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register" className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${plan.popular ? 'bg-white text-primary-600 hover:bg-primary-50' : 'bg-primary-500 text-white hover:bg-primary-600'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG PREVIEW ── */}
      <section className="py-10 bg-cream-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">From Our Blog</h2>
              <p className="text-gray-500 text-sm mt-0.5">Marriage advice, traditions, and Kundli guidance</p>
            </div>
            <Link href="/blog" className="text-primary-500 text-sm font-semibold hover:underline flex items-center gap-1">
              All Articles <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { slug: 'brahmana-vivah-traditions', title: 'Sacred Brahmana Vivah Traditions Across India', cat: 'Traditions', img: 'https://picsum.photos/seed/blog-t1/600/350', date: 'Mar 15' },
              { slug: 'kundli-matching-guide', title: 'Kundli Matching: Complete Ashtakoot Guide', cat: 'Kundli', img: 'https://picsum.photos/seed/blog-t2/600/350', date: 'Mar 8' },
              { slug: 'choosing-life-partner', title: 'How to Choose the Right Life Partner', cat: 'Relationships', img: 'https://picsum.photos/seed/blog-t3/600/350', date: 'Feb 28' },
            ].map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="bg-white rounded-xl overflow-hidden border border-orange-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="relative h-40 overflow-hidden">
                  <Image src={post.img} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="33vw" />
                  <div className="absolute top-3 left-3 bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">{post.cat}</div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-1">{post.date}</p>
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-primary-600 transition-colors">{post.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-12 bg-gradient-to-r from-primary-600 to-saffron-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3">Begin Your Sacred Matrimonial Journey</h2>
          <p className="text-white/80 mb-7 text-base">Join 50,000+ Brahmana families. Registration is free and takes under 2 minutes.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register" className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-3 rounded-xl font-bold transition-colors inline-flex items-center gap-2">
              Register as Bride <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/auth/register" className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-xl font-bold transition-colors inline-flex items-center gap-2">
              Register as Groom <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">VivahSetu</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                India's most trusted Brahmana matrimonial platform. Connecting families with verified profiles, Kundli matching, and cultural alignment.
              </p>
              <div className="flex gap-3 flex-wrap">
                {['Iyer', 'Namboodiri', 'Kashmiri Pandit', 'Deshastha'].map(c => (
                  <span key={c} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">{c}</span>
                ))}
              </div>
            </div>
            {[
              { title: 'Platform', links: [{ label: 'About Us', href: '/about' }, { label: 'How It Works', href: '/' }, { label: 'Membership Plans', href: '/plans' }, { label: 'Blog', href: '/blog' }] },
              { title: 'Support', links: [{ label: 'Help Center', href: '#' }, { label: 'Safety Tips', href: '#' }, { label: 'Contact Us', href: '#' }, { label: 'Report Profile', href: '#' }] },
              { title: 'Legal', links: [{ label: 'Privacy Policy', href: '#' }, { label: 'Terms of Service', href: '#' }, { label: 'Refund Policy', href: '#' }, { label: 'Cookie Policy', href: '#' }] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold mb-3 text-white text-sm">{col.title}</h4>
                <ul className="space-y-1.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-gray-400 hover:text-white text-xs transition-colors">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-500 text-xs">© {new Date().getFullYear()} VivahSetu. All rights reserved.</p>
            <p className="text-gray-500 text-xs">Made with care for the Brahmana community across India</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
