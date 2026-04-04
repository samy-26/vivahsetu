'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import VivahSetuLogo from './VivahSetuLogo';

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/plans', label: 'Plans' },
  { href: '/blog', label: 'Blog' },
];

export default function PublicNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <VivahSetuLogo size="md" href="/" showTagline />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-primary-500 transition-colors font-medium ${pathname === link.href ? 'text-primary-500' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-primary-500 transition-colors font-medium">
              Login
            </Link>
            <Link href="/auth/register" className="btn-primary text-sm py-2 px-5">
              Register Free
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-gray-500 hover:text-gray-700"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm text-gray-700 font-medium hover:text-primary-500"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Link href="/auth/login" className="flex-1 text-center py-2 text-sm border border-gray-300 rounded-lg text-gray-700 font-medium">
              Login
            </Link>
            <Link href="/auth/register" className="flex-1 text-center py-2 text-sm btn-primary rounded-lg">
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
