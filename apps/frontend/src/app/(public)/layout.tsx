'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import PublicNav from '@/components/PublicNav';
import { useScrollReveal } from '@/hooks/useScrollReveal';

function ScrollRevealInit() {
  useScrollReveal();
  return null;
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Re-run scroll reveal when route changes
  useScrollReveal();

  return (
    <>
      <PublicNav />
      <div key={pathname} className="page-transition">
        {children}
      </div>
    </>
  );
}
