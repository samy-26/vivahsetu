import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-saffron-50 flex items-center justify-center text-center p-4">
      <div>
        <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-12 h-12 text-primary-400" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/" className="btn-primary inline-block">Go Home</Link>
      </div>
    </div>
  );
}
