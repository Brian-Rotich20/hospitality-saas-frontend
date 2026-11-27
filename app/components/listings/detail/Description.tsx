'use client';

import { useEffect, useRef, useState } from 'react';

/** Listing description, clamped to a few lines with "Read more" when it is long. */
export function Description({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) setOverflows(el.scrollHeight > el.clientHeight + 2);
  }, [text]);
  return (
    <div>
      <p ref={ref} className={`text-[15px] leading-[1.7] text-text-secondary whitespace-pre-line max-w-[68ch] ${open ? '' : 'line-clamp-6'}`}>{text}</p>
      {(overflows || open) && (
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
          className="mt-2 text-[14px] font-semibold text-primary hover:underline underline-offset-4">
          {open ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
}
