'use client';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useState } from 'react';

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', page],
    queryFn: () => api.get(`/admin/payments?page=${page}&limit=20`) as any,
  });

  const payments = (data as any)?.data?.payments || [];
  const total = (data as any)?.data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const statusColors: Record<string, string> = {
    SUCCESS: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    FAILED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
        <p className="text-gray-500 text-sm">{total} total transactions</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{['User', 'Amount', 'Purpose', 'Razorpay ID', 'Date', 'Status'].map(h => <th key={h} className="text-left px-4 py-3 font-medium text-gray-500">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((payment: any) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{payment.user?.email}</p>
                    <p className="text-xs text-gray-400">{payment.user?.phone}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(payment.amount)}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{payment.purpose || '-'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">{payment.razorpayPaymentId?.slice(0, 16) || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(payment.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusColors[payment.status] || 'bg-gray-100 text-gray-700'}`}>{payment.status}</span>
                  </td>
                </tr>
              ))}
              {!payments.length && <tr><td colSpan={6} className="text-center py-12 text-gray-400">No payments found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline text-sm py-2 px-4 disabled:opacity-50">Previous</button>
          <span className="text-sm text-gray-600 self-center">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-outline text-sm py-2 px-4 disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
