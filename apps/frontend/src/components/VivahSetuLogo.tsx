'use client';
import Link from 'next/link';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  dark?: boolean;
  showTagline?: boolean;
}

export default function VivahSetuLogo({ size = 'md', href = '/', dark = false, showTagline = false }: Props) {
  const cfg = {
    sm: { wrap: 'gap-1.5', dot: 16, title: 'text-xl',   tagline: 'text-[9px]'  },
    md: { wrap: 'gap-2',   dot: 22, title: 'text-[28px]', tagline: 'text-[10px]' },
    lg: { wrap: 'gap-3',   dot: 30, title: 'text-[42px]', tagline: 'text-xs'     },
  }[size];

  const titleColor = dark ? 'text-white' : 'text-primary-700';
  const taglineColor = dark ? 'text-orange-200' : 'text-saffron-600';
  const dotSize = cfg.dot;

  const mark = (
    <div className={`inline-flex items-center ${cfg.wrap}`}>
      {/* Decorative diya/flame mark */}
      <svg width={dotSize} height={dotSize} viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
        {/* Diya base */}
        <ellipse cx="15" cy="22" rx="9" ry="4" fill={dark ? 'rgba(251,191,36,0.4)' : '#FDE68A'} />
        <path d="M6 22 Q15 26 24 22 Q21 28 15 29 Q9 28 6 22Z" fill={dark ? 'rgba(245,158,11,0.6)' : '#F59E0B'} opacity="0.7"/>
        {/* Flame outer */}
        <path d="M15 22 C13 17 12 13 15 7 C18 13 17 17 15 22Z" fill="#EF4444"/>
        {/* Flame inner */}
        <path d="M15 22 C14 18 13.5 15 15 10 C16.5 15 16 18 15 22Z" fill="#FCD34D"/>
        {/* Flame tip glow */}
        <ellipse cx="15" cy="9" rx="2" ry="2.5" fill="#FDE68A" opacity="0.8"/>
        {/* Left lotus petal */}
        <path d="M15 22 C11 20 7 18 6 14 C10 15 13 18 15 22Z" fill="#CC3322" opacity="0.5"/>
        {/* Right lotus petal */}
        <path d="M15 22 C19 20 23 18 24 14 C20 15 17 18 15 22Z" fill="#CC3322" opacity="0.5"/>
      </svg>

      {/* Text block */}
      <div className="flex flex-col leading-none">
        <span
          className={`heading-calligraphy font-semibold leading-none ${cfg.title} ${titleColor}`}
          style={{ letterSpacing: '-0.01em' }}
        >
          VivahSetu
        </span>
        {showTagline && (
          <span className={`font-sans uppercase tracking-[0.2em] font-medium leading-none mt-1 ${cfg.tagline} ${taglineColor}`}>
            Brahmana Matrimonial
          </span>
        )}
      </div>
    </div>
  );

  if (!href) return mark;
  return <Link href={href} className="inline-flex">{mark}</Link>;
}
