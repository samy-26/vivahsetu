'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, User } from 'lucide-react';
import VivahSetuLogo from '@/components/VivahSetuLogo';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Valid phone required'),
  password: z.string().min(8, 'Minimum 8 characters').regex(/(?=.*[A-Z])(?=.*[0-9])/, 'Must contain uppercase and number'),
  confirmPassword: z.string(),
  role: z.enum(['BRIDE', 'GROOM']),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords don't match", path: ['confirmPassword'] });
type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'BRIDE' },
  });
  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...payload } = data;
      const res = await api.post('/auth/register', payload) as any;
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      toast.success('Registration successful! Welcome to VivahSetu!');
      router.push('/dashboard/profile/create');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
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
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Start your matrimonial journey today — free!</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am looking as</label>
              <div className="grid grid-cols-2 gap-3">
                {(['BRIDE', 'GROOM'] as const).map((role) => (
                  <button key={role} type="button" onClick={() => setValue('role', role)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${selectedRole === role ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    <User className="w-4 h-4" />
                    <span className="font-medium">{role === 'BRIDE' ? 'Bride' : 'Groom'}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input {...register('email')} className="input-field" placeholder="your@email.com" type="email" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input {...register('phone')} className="input-field" placeholder="+91 9876543210" />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPassword ? 'text' : 'password'} className="input-field pr-10" placeholder="Min 8 chars, 1 uppercase, 1 number" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input {...register('confirmPassword')} type="password" className="input-field" placeholder="Repeat password" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <p className="text-xs text-gray-500">
              By registering you agree to our{' '}
              <Link href="/terms" className="text-primary-500 hover:underline">Terms</Link> and{' '}
              <Link href="/privacy" className="text-primary-500 hover:underline">Privacy Policy</Link>.
            </p>

            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Account
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary-500 hover:underline font-medium">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
