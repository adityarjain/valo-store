// A fast, deterministic 32-bit pseudo-random number generator (Mulberry32)
export function createRng(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getNextUtcMidnight(): { expiresAt: string; remainingSeconds: number; rotationDate: string } {
  const now = new Date();
  const nextUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0)
  );
  const remainingSeconds = Math.max(0, Math.floor((nextUtc.getTime() - now.getTime()) / 1000));
  const rotationDate = now.toISOString().split('T')[0];
  return {
    expiresAt: nextUtc.toISOString(),
    remainingSeconds,
    rotationDate,
  };
}
