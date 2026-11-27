'use client';

// Modal confirmation for consequential actions. Focus moves into the dialog, Escape and
// the backdrop close it (unless busy), and focus returns to the trigger afterwards.

import { useEffect, useId, useRef } from 'react';
import { Button } from './Button';

interface Props {
  title: string;
  children?: React.ReactNode;
  confirmLabel: string;
  busyLabel?: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  busy?: boolean;
  error?: string | null;
  /** Disable the confirm button (e.g. while a required field is invalid). */
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  title, children, confirmLabel, busyLabel, cancelLabel = 'Cancel', tone = 'primary',
  busy = false, error, confirmDisabled, onConfirm, onClose,
}: Props) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const first = panel.current?.querySelector<HTMLElement>('input, textarea, select, button[data-autofocus]')
      ?? panel.current?.querySelector<HTMLElement>('button');
    first?.focus();
    return () => previous?.focus?.();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/45 p-0 sm:p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId}
        className="w-full sm:max-w-md bg-card rounded-t-2xl sm:rounded-2xl shadow-lg p-5 sm:p-6 max-h-[90dvh] overflow-y-auto">
        <h2 id={titleId} className="text-[18px] font-semibold text-text-primary">{title}</h2>
        {children && <div className="mt-2 text-[14px] leading-relaxed text-text-secondary">{children}</div>}
        {error && <p role="alert" className="mt-3 text-[13px] text-error">{error}</p>}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={busy}>{cancelLabel}</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}
            loading={busy} loadingText={busyLabel} disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
