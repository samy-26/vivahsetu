'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Crown, Zap, Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';

declare global { interface Window { Razorpay: any } }

export default function SubscriptionPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: plans } = useQuery({ queryKey: ['plans'], queryFn: () => api.get('/subscriptions/plans') as any });
  const { data: currentSub, refetch } = useQuery({ queryKey: ['my-subscription'], queryFn: () => api.get('/subscriptions/my') as any });
  const { data: history } = useQuery({ queryKey: ['sub-history'], queryFn: () => api.get('/subscriptions/history') as any });

  const { mutate: createOrder, isPending } = useMutation({
    mutationFn: (data: any) => api.post('/payments/create-order', data) as any,
    onSuccess: (res: any) => {
      const order = res.data;
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'VivahSetu',
        description: `${selectedPlan} Membership`,
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            await api.post('/payments/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success('Subscription activated!');
            refetch();
            qc.invalidateQueries({ queryKey: ['sub-history'] });
          } catch { toast.error('Payment verification failed'); }
        },
        prefill: { name: 'VivahSetu User' },
        theme: { color: '#CC3322' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    },
    onError: () => toast.error('Failed to create order'),
  });

  const handleSubscribe = (planId: string, price: number) => {
    setSelectedPlan(planId);
    createOrder({ amount: price, purpose: 'subscription', metadata: { planType: planId } });
  };

  const planIcons: Record<string, any> = { BASIC: Zap, STANDARD: Star, PLATINUM: Crown };
  const planColors: Record<string, string> = {
    BASIC: 'border-gray-200',
    STANDARD: 'border-primary-500 ring-2 ring-primary-200',
    PLATINUM: 'border-yellow-400',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Membership Plans</h1>
        <p className="text-gray-500 text-sm mt-1">Unlock premium features to connect with your match</p>
      </div>

      {(currentSub as any)?.data && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Active: {(currentSub as any).data.planType} Plan</p>
            <p className="text-sm text-green-600">
              {(currentSub as any).data.remainingViews} views remaining · Valid till {formatDate((currentSub as any).data.endDate)}
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {((plans as any)?.data || []).map((plan: any) => {
          const Icon = planIcons[plan.id] || Star;
          const activePlanType = (currentSub as any)?.data?.planType;
          const isCurrentPlan = activePlanType === plan.id;
          const hasActivePlan = !!activePlanType;
          return (
            <div key={plan.id} className={`bg-white rounded-2xl border-2 p-6 relative ${isCurrentPlan ? 'border-green-400 ring-2 ring-green-100' : planColors[plan.id] || 'border-gray-200'}`}>
              {isCurrentPlan ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Active Plan
                </div>
              ) : plan.id === 'STANDARD' && !hasActivePlan ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-xs font-medium">Most Popular</div>
              ) : null}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isCurrentPlan ? 'bg-green-100 text-green-600' : plan.id === 'PLATINUM' ? 'bg-yellow-100 text-yellow-600' : plan.id === 'STANDARD' ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-primary-500">{formatCurrency(plan.price)}</span>
                <span className="text-gray-400 text-sm">/{plan.duration}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f: string) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              {isCurrentPlan ? (
                <div className="w-full py-2.5 rounded-lg font-medium text-sm bg-green-50 text-green-700 border border-green-200 text-center">
                  {(currentSub as any).data.remainingViews} views left · Active
                </div>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.id, plan.price)}
                  disabled={isPending && selectedPlan === plan.id}
                  className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${plan.id === 'STANDARD' && !hasActivePlan ? 'btn-primary' : 'btn-secondary'} disabled:opacity-50`}>
                  {isPending && selectedPlan === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {hasActivePlan ? 'Upgrade Plan' : 'Subscribe Now'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {(history as any)?.data?.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Subscription History</h2>
          <div className="bg-white rounded-xl border border-orange-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream-100">
                <tr>{['Plan', 'Start Date', 'End Date', 'Views', 'Status'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-500">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {(history as any).data.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-cream-100">
                    <td className="px-4 py-3 font-medium">{sub.planType}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(sub.startDate)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(sub.endDate)}</td>
                    <td className="px-4 py-3">{sub.remainingViews}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${sub.status === 'ACTIVE' ? 'badge-verified' : 'badge-pending'}`}>{sub.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
