'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import VivahSetuLogo from '@/components/VivahSetuLogo';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or phone required'),
  password: z.string().min(6, 'Minimum 6 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'password' | 'otp'>('password');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTarget, setOtpTarget] = useState('');
  const [otp, setOtp] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onPasswordLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', data) as any;
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      toast.success('Welcome back!');
      router.push(res.data.user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async () => {
    if (!otpTarget) { toast.error('Enter email or phone'); return; }
    setIsLoading(true);
    try {
      await api.post('/auth/otp/send', { target: otpTarget, type: otpTarget.includes('@') ? 'email' : 'phone' });
      setOtpSent(true);
      toast.success('OTP sent successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) { toast.error('Enter OTP'); return; }
    setIsLoading(true);
    try {
      const res = await api.post('/auth/otp/verify', { target: otpTarget, otp }) as any;
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      toast.success('Login successful!');
      router.push(res.data.user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-saffron-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <VivahSetuLogo size="lg" href="/" showTagline />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to continue your journey</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Tabs */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            {(['password', 'otp'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab ? 'bg-white shadow text-primary-600' : 'text-gray-500'}`}>
                {tab === 'password' ? 'Password' : 'OTP Login'}
              </button>
            ))}
          </div>

          {activeTab === 'password' ? (
            <form onSubmit={handleSubmit(onPasswordLogin)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email or Phone</label>
                <input {...register('identifier')} className="input-field" placeholder="Enter email or phone" />
                {errors.identifier && <p className="text-red-500 text-xs mt-1">{errors.identifier.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input {...register('password')} type={showPassword ? 'text' : 'password'} className="input-field pr-10" placeholder="Enter password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Sign In
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email or Phone</label>
                <div className="flex gap-2">
                  <input value={otpTarget} onChange={(e) => setOtpTarget(e.target.value)} className="input-field" placeholder="Enter email or phone" />
                  <button onClick={sendOtp} disabled={isLoading || otpSent} className="btn-primary whitespace-nowrap text-sm py-2 px-4 disabled:opacity-50">
                    {isLoading && !otpSent ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send OTP'}
                  </button>
                </div>
              </div>
              {otpSent && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                    <input value={otp} onChange={(e) => setOtp(e.target.value)} className="input-field text-center text-2xl tracking-[1rem]" placeholder="••••••" maxLength={6} />
                  </div>
                  <button onClick={verifyOtp} disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Verify & Login
                  </button>
                </>
              )}
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-primary-500 hover:underline font-medium">Register Free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
