import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return format(new Date(date), 'dd MMM yyyy');
}

export function formatRelativeTime(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function getInitials(name: string) {
  if (!name) return 'VS';
  // Handle email addresses
  const base = name.includes('@') ? name.split('@')[0] : name;
  return base.split(/[\s._-]/).map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'VS';
}

export function getAvatarUrl(name: string) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=9B2335&color=fff&size=128&bold=true`;
}

export function truncate(str: string, length: number) {
  return str?.length > length ? `${str.slice(0, length)}...` : str;
}
