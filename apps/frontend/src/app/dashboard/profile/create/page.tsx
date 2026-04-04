'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Loader2, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

const steps = ['Personal', 'Professional', 'Location', 'About'];

export default function CreateProfilePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { name: '', age: 25, maritalStatus: 'Single', complexion: '', height: '', weight: '', gotra: '', manglik: false, education: '', profession: '', income: '', city: '', state: '', country: 'India', nativePlace: '', bio: '' },
  });

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: (data: any) => api.post('/profiles', { ...data, age: Number(data.age) }),
    onSuccess: () => { toast.success('Profile created! Pending admin approval.'); qc.invalidateQueries({ queryKey: ['my-profile'] }); router.push('/dashboard'); },
    onError: (err: any) => toast.error(err.message || 'Failed to save profile'),
  });

  const inputClass = 'input-field';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Your Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Complete all steps to get your profile approved</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${i < currentStep ? 'bg-green-500 text-white' : i === currentStep ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
              {i < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`hidden sm:block text-xs font-medium ${i === currentStep ? 'text-primary-600' : 'text-gray-400'}`}>{step}</span>
            {i < steps.length - 1 && <div className={`h-px w-6 ${i < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(saveProfile as any)}>
        <div className="card space-y-4">
          {currentStep === 0 && (
            <>
              <h2 className="font-semibold text-gray-900">Personal Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Full Name *</label>
                  <input {...register('name', { required: true })} className={inputClass} placeholder="Enter your full name" />
                </div>
                <div>
                  <label className={labelClass}>Age *</label>
                  <input type="number" {...register('age')} className={inputClass} placeholder="25" min={18} max={60} />
                </div>
                <div>
                  <label className={labelClass}>Marital Status</label>
                  <select {...register('maritalStatus')} className={inputClass}>
                    <option>Single</option><option>Divorced</option><option>Widowed</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Height</label>
                  <input {...register('height')} className={inputClass} placeholder="5'5&quot;" />
                </div>
                <div>
                  <label className={labelClass}>Weight</label>
                  <input {...register('weight')} className={inputClass} placeholder="55 kg" />
                </div>
                <div>
                  <label className={labelClass}>Complexion</label>
                  <select {...register('complexion')} className={inputClass}>
                    <option value="">Select</option>
                    <option>Fair</option><option>Wheatish</option><option>Dusky</option><option>Dark</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Gotra</label>
                  <input {...register('gotra')} className={inputClass} placeholder="Enter gotra" />
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <input type="checkbox" {...register('manglik')} id="manglik" className="w-4 h-4 accent-primary-500" />
                  <label htmlFor="manglik" className="text-sm font-medium text-gray-700">Manglik</label>
                </div>
              </div>
            </>
          )}

          {currentStep === 1 && (
            <>
              <h2 className="font-semibold text-gray-900">Professional Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Education</label>
                  <input {...register('education')} className={inputClass} placeholder="B.Tech / MBA / etc." />
                </div>
                <div>
                  <label className={labelClass}>Profession</label>
                  <input {...register('profession')} className={inputClass} placeholder="Software Engineer" />
                </div>
                <div>
                  <label className={labelClass}>Annual Income</label>
                  <select {...register('income')} className={inputClass}>
                    <option value="">Select range</option>
                    {['Below 3 LPA','3-5 LPA','5-10 LPA','10-15 LPA','15-25 LPA','25-50 LPA','Above 50 LPA'].map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <h2 className="font-semibold text-gray-900">Location Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Current City</label>
                  <input {...register('city')} className={inputClass} placeholder="Mumbai" />
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <input {...register('state')} className={inputClass} placeholder="Maharashtra" />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <input {...register('country')} className={inputClass} placeholder="India" />
                </div>
                <div>
                  <label className={labelClass}>Native Place</label>
                  <input {...register('nativePlace')} className={inputClass} placeholder="Ancestral home town" />
                </div>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <h2 className="font-semibold text-gray-900">About Yourself</h2>
              <div>
                <label className={labelClass}>Bio / About Me</label>
                <textarea {...register('bio')} className={inputClass} rows={5}
                  placeholder="Tell us about yourself, your interests, what you're looking for in a partner..." />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button type="button" onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={currentStep === 0}
            className="btn-outline flex items-center gap-2 disabled:opacity-50">
            <ChevronLeft className="w-4 h-4" />Previous
          </button>
          {currentStep < steps.length - 1 ? (
            <button type="button" onClick={() => setCurrentStep(s => Math.min(steps.length - 1, s + 1))} className="btn-primary flex items-center gap-2">
              Next<ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="submit" disabled={isPending} className="btn-primary flex items-center gap-2">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Submit Profile
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
