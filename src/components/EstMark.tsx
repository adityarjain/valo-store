import type { PriceStatus } from '@/types/store';

const DEFAULT_NOTE = 'Estimated from the tier price bracket; not a Riot store price.';

/** Small "est." tag shown next to prices that are estimates rather than verified. */
export function EstMark({ status = 'estimated', note }: { status?: PriceStatus; note?: string }) {
  if (status !== 'estimated') return null;
  return (
    <span
      title={note ?? DEFAULT_NOTE}
      className="ml-1 text-[9px] font-mono font-normal uppercase tracking-wider text-[#FAD663]/80 cursor-help"
    >
      est.
    </span>
  );
}
