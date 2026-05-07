import { type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'warning';

export function buttonStyles(variant: ButtonVariant = 'primary') {
  const base =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55';
  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-slate-950 text-white shadow-sm shadow-slate-950/10 hover:-translate-y-0.5 hover:bg-slate-800 focus:ring-slate-400',
    secondary:
      'border border-slate-200 bg-white text-slate-800 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 focus:ring-slate-300',
    ghost:
      'text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus:ring-slate-300',
    destructive:
      'bg-rose-600 text-white shadow-sm shadow-rose-600/15 hover:-translate-y-0.5 hover:bg-rose-700 focus:ring-rose-300',
    warning:
      'bg-amber-500 text-amber-950 shadow-sm shadow-amber-500/15 hover:-translate-y-0.5 hover:bg-amber-400 focus:ring-amber-300',
  };

  return cn(base, variants[variant]);
}

export function ButtonLink({
  className,
  variant = 'primary',
  ...props
}: LinkProps & { variant?: ButtonVariant }) {
  return <Link className={cn(buttonStyles(variant), className)} {...props} />;
}

type BadgeTone = 'open' | 'resolved' | 'admin' | 'warning' | 'error' | 'success' | 'neutral';

export function StatusBadge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  const tones: Record<BadgeTone, string> = {
    open: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    resolved: 'border-blue-200 bg-blue-50 text-blue-700',
    admin: 'border-indigo-200 bg-indigo-50 text-indigo-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    error: 'border-rose-200 bg-rose-50 text-rose-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    neutral: 'border-slate-200 bg-slate-50 text-slate-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold',
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function PageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={cn('mx-auto w-full max-w-7xl px-5 py-10 sm:px-6 lg:px-8', className)}>{children}</section>;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-5 md:flex-row md:items-end md:justify-between', className)}>
      <div className="max-w-3xl">
        {eyebrow && <p className="text-sm font-bold text-emerald-700">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
          {title}
        </h1>
        {description && <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function SurfaceCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-slate-200/80 bg-white shadow-sm shadow-slate-950/[0.03]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  caption,
  icon,
}: {
  label: string;
  value: string;
  caption?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <p className="mt-2 truncate text-lg font-black text-slate-950">{value}</p>
      {caption && <p className="mt-1 text-xs font-medium text-slate-500">{caption}</p>}
    </div>
  );
}

type AlertTone = 'success' | 'error' | 'warning' | 'info';

export function AlertMessage({
  tone = 'info',
  children,
}: {
  tone?: AlertTone;
  children: ReactNode;
}) {
  const tones: Record<AlertTone, string> = {
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    error: 'border-rose-200 bg-rose-50 text-rose-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  };

  return (
    <div className={cn('rounded-2xl border px-4 py-3 text-sm font-semibold leading-6', tones[tone])}>
      {children}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <SurfaceCard className="px-6 py-12 text-center">
      {icon && (
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          {icon}
        </div>
      )}
      <h2 className="mt-5 text-xl font-black text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </SurfaceCard>
  );
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0">
      <span className="text-sm font-semibold text-slate-500">{label}</span>
      <span className="text-right text-sm font-black text-slate-950">{value}</span>
    </div>
  );
}

export const fieldStyles =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';
