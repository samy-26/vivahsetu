import Link from 'next/link';
import { Shield, Star, Users, Heart, ArrowRight, CheckCircle } from 'lucide-react';

export const metadata = { title: 'About VivahSetu | Brahmana Matrimonial' };

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 to-saffron-50 py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="heading-calligraphy text-4xl lg:text-6xl font-semibold text-gray-900 mb-6">About VivahSetu</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Trusted matrimonial platform exclusively for the Brahmana community — combining Vedic tradition with modern technology to create sacred, lasting bonds.
          </p>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'Our Mission',
                desc: 'To provide a safe, verified, and culturally aligned matrimonial platform for the global Brahmana community, where tradition meets technology for meaningful alliances.',
              },
              {
                icon: <Star className="w-6 h-6" />,
                title: 'Our Values',
                desc: 'We uphold traditional Brahmanical values of dharma, purity, and spiritual integrity while embracing technology to help families find compatible life partners.',
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: 'Our Community',
                desc: 'Exclusively serving Brahmana families across India and globally — Shaivites, Vaishnavas, Smartas, and all Brahmana sub-communities — maintaining cultural integrity.',
              },
              {
                icon: <Heart className="w-6 h-6" />,
                title: 'Our Success',
                desc: 'Over 5,000+ successful marriages and counting, building strong family bonds rooted in shared values, gotra compatibility, and Kundli harmony.',
              },
            ].map((item) => (
              <div key={item.title} className="card hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How we verify */}
      <section className="py-20 bg-cream-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="heading-calligraphy text-3xl lg:text-4xl font-semibold text-gray-900 mb-4">Our Verification Process</h2>
            <p className="text-gray-500">Every profile goes through a rigorous review before going live</p>
          </div>
          <div className="space-y-4">
            {[
              { step: 'Registration', desc: 'User registers with valid email and mobile number. OTP verified at sign-up.' },
              { step: 'Profile Creation', desc: 'User fills out detailed personal, family, and professional information.' },
              { step: 'Aadhaar Verification', desc: 'Identity verified through Aadhaar document upload. Stored encrypted.' },
              { step: 'Admin Review', desc: 'Our team manually reviews each profile for authenticity before approval.' },
              { step: 'Profile Active', desc: 'Approved profiles become visible to other members. Verified badge awarded.' },
            ].map((item, i) => (
              <div key={item.step} className="flex gap-4 items-start bg-white rounded-xl p-5 border border-orange-100">
                <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{item.step}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{item.desc}</div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 ml-auto mt-0.5" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-primary-500 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: '50,000+', label: 'Registered Members' },
              { value: '5,000+', label: 'Successful Marriages' },
              { value: '28+', label: 'States Covered' },
              { value: '100%', label: 'Brahmana Community' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-primary-100 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Community</h2>
          <p className="text-gray-500 mb-8">Start your sacred matrimonial journey with thousands of verified Brahmana profiles.</p>
          <Link href="/auth/register" className="btn-primary text-base py-3 px-8 inline-flex items-center gap-2">
            Register Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
