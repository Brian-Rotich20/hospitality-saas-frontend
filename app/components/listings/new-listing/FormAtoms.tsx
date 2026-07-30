import { AlertCircle } from 'lucide-react';

export const field = (err?: boolean) =>
  `w-full px-3 py-2.5 text-sm rounded-xl border bg-white text-gray-900
   placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D3B45]
   focus:border-transparent transition
   ${err ? 'border-red-400' : 'border-gray-200'}`;

export function Label({ children, req }: { children: React.ReactNode; req?: boolean }) {
  return (
    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5">
      {children}
      {req && <span className="text-red-400 normal-case font-normal ml-1">*</span>}
    </label>
  );
}

export function Err({ msg }: { msg?: string }) {
  return msg
    ? <p className="text-red-500 text-[11px] mt-1 flex items-center gap-1">
        <AlertCircle size={10} />{msg}
      </p>
    : null;
}

/**
 * Character counter — cheap trust signal, doubles as a soft cap warning.
 * Turns amber inside the last 10% of the limit, red if somehow over.
 */
export function CharCounter({ value, max, min }: { value: string; max: number; min?: number }) {
  const len = value?.length ?? 0;
  const isOver  = len > max;
  const isNear  = !isOver && len >= max * 0.9;
  const isUnder = !!min && len > 0 && len < min;

  const color = isOver
    ? 'text-red-500'
    : isNear
      ? 'text-amber-600'
      : isUnder
        ? 'text-gray-400'
        : 'text-gray-400';

  return (
    <div className="flex justify-end mt-1">
      <span className={`text-[10px] font-bold tabular-nums ${color}`}>
        {isUnder ? `${min - len} more needed` : `${len} / ${max}`}
      </span>
    </div>
  );
}