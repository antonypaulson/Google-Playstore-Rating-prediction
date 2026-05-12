import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface CardProps { className?: string; children: ReactNode; }

export function Card({ className, children }: CardProps) {
  return <div className={cn('bg-slate-800/60 border border-slate-700/50 rounded-xl backdrop-blur-sm', className)}>{children}</div>;
}
export function CardHeader({ className, children }: CardProps) {
  return <div className={cn('px-5 py-4 border-b border-slate-700/50', className)}>{children}</div>;
}
export function CardTitle({ className, children }: CardProps) {
  return <h3 className={cn('text-sm font-semibold text-slate-200 tracking-wide uppercase', className)}>{children}</h3>;
}
export function CardContent({ className, children }: CardProps) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>;
}
