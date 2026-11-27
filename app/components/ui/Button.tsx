'use client';

// The one button vocabulary for the app. Primary is ink (the strongest action on a
// screen, at most one per region); secondary is outlined; ghost is text-weight;
// danger is for destructive confirmations only.

import Link from 'next/link';
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'brand';
type Size = 'sm' | 'md' | 'lg';

const VARIANT: Record<Variant, string> = {
  primary:   'bg-ink text-white hover:bg-ink-hover disabled:bg-ink/40',
  brand:     'bg-brand text-white hover:bg-brand-hover disabled:bg-brand/40',
  secondary: 'bg-card text-text-primary border border-border-strong hover:bg-surface-muted disabled:text-text-muted',
  ghost:     'text-text-secondary hover:text-text-primary hover:bg-surface-muted disabled:text-text-muted',
  danger:    'bg-error text-white hover:bg-[#8F1C13] disabled:bg-error/40',
};
const SIZE: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-[10px]',
  lg: 'h-12 px-5 text-[15px] gap-2 rounded-xl',
};

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra = '') {
  return `inline-flex items-center justify-center font-semibold whitespace-nowrap no-underline select-none
    transition-colors duration-150 disabled:cursor-not-allowed ${VARIANT[variant]} ${SIZE[size]} ${extra}`;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** Shown instead of children while loading, e.g. "Saving…". */
  loadingText?: string;
  block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, loadingText, block, className = '', children, disabled, type = 'button', ...rest }, ref,
) {
  return (
    <button ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || undefined}
      className={buttonClass(variant, size, `${block ? 'w-full' : ''} ${className}`)} {...rest}>
      {loading && <Loader2 size={size === 'sm' ? 13 : 15} className="animate-spin" aria-hidden />}
      {loading && loadingText ? loadingText : children}
    </button>
  );
});

interface ButtonLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

export function ButtonLink({ href, variant = 'secondary', size = 'md', block, className = '', children, ...rest }: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClass(variant, size, `${block ? 'w-full' : ''} ${className}`)} {...rest}>
      {children}
    </Link>
  );
}
