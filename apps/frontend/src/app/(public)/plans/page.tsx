import Link from 'next/link';
import { CheckCircle, ArrowRight, Star } from 'lucide-react';

export const metadata = { title: 'Membership Plans | VivahSetu' };

export default function PlansPage() {
  return (
    <div className="min-h-screen pt-16 bg-cream-100">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 to-saffron-50 py-16 px-4 text-center">
        <h1 className="heading-calligraphy text-4xl lg:text-6xl font-semibold text-gray-900 mb-4">Membership Plans</h1>
        <p className="text-gray-600 text-lg max-w-xl mx-auto">Choose the perfect plan for your matrimonial journey. No hidden charges.</p>
      </section>

      {/* Plans */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Basic',
                price: '500',
                period: 'per month',
                popular: false,
                color: 'border-gray-200',
                features: [
                  '10 profile views per month',
                  'Send unlimited interests',
                  'Basic chat access',
                  'Email support',
                  'Profile listing',
                ],
              },
              {
                name: 'Standard',
                price: '1,500',
                period: 'for 6 months',
                popular: true,
                color: 'border-primary-500',
                features: [
                  '50 contact views',
                  '6 months validity',
                  'Priority listing in search',
                  'Full chat access',
                  'Phone support',
                  'Interest notifications',
                ],
              },
              {
                name: 'Platinum',
                price: '2,000',
                period: 'lifetime access',
                popular: false,
                color: 'border-yellow-400',
                features: [
                  '60 contact views',
                  'Lifetime validity',
                  'Top priority listing',
                  'Unlimited chat',
                  'Dedicated relationship manager',
                  'Kundli service discount',
                ],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl border-2 ${plan.color} p-8 relative ${plan.popular ? 'shadow-2xl' : 'shadow-sm'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-500 text-white px-6 py-1.5 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" /> Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                <div className="mb-1 flex items-end gap-1">
                  <span className="text-gray-400 text-sm mb-1">Rs.</span>
                  <span className="text-4xl font-bold text-primary-500">{plan.price}</span>
                </div>
                <p className="text-sm text-gray-400 mb-6">{plan.period}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-gray-600 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className={`block text-center py-3 rounded-xl font-semibold transition-colors ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>

          {/* Kundli services */}
          <div className="mt-12 bg-white rounded-2xl border border-orange-100 p-8 shadow-sm">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Kundli Services</h3>
              <p className="text-gray-500 text-sm">Available as one-time purchases — no subscription required</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 max-w-xl mx-auto">
              <div className="text-center bg-primary-50 rounded-xl p-6">
                <div className="text-3xl font-bold text-primary-500 mb-1">Rs. 51</div>
                <div className="font-semibold text-gray-900 mb-1">Kundli Generation</div>
                <div className="text-sm text-gray-500">Download your personalised Janam Patri as PDF</div>
              </div>
              <div className="text-center bg-saffron-50 rounded-xl p-6">
                <div className="text-3xl font-bold text-saffron-600 mb-1">Rs. 101</div>
                <div className="font-semibold text-gray-900 mb-1">Matchmaking Report</div>
                <div className="text-sm text-gray-500">Ashtakoot Gun Milan compatibility report with partner</div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h3>
            <div className="space-y-4">
              {[
                { q: 'Is registration free?', a: 'Yes, basic registration and profile creation is completely free. You only pay when you want to view contact details or unlock premium features.' },
                { q: 'Can I upgrade my plan later?', a: 'Absolutely. You can upgrade your plan at any time. The new plan activates immediately after payment.' },
                { q: 'What payment methods are accepted?', a: 'We accept all major credit/debit cards, UPI, net banking, and wallets via Razorpay — India\'s most trusted payment gateway.' },
                { q: 'Is my data safe?', a: 'Yes. All data is encrypted. Aadhaar numbers are AES-encrypted and never displayed. Contact details are shared only with premium members.' },
              ].map((faq) => (
                <div key={faq.q} className="bg-white rounded-xl p-5 border border-orange-100">
                  <h4 className="font-semibold text-gray-900 mb-2">{faq.q}</h4>
                  <p className="text-sm text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-gray-500 mb-4">Still have questions? We are here to help.</p>
            <Link href="/auth/register" className="btn-primary text-base py-3 px-8 inline-flex items-center gap-2">
              Start Free Today <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
