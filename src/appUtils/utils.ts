export type BatteryLevel = 'critical' | 'average' | 'full';
export type TempLevel = 'normal' | 'average' | 'critical';

const isNum = (v: unknown): v is number =>
  typeof v === 'number' && !Number.isNaN(v);

// Battery percent (0-100)
export function getBatteryLevel(
  percent?: number | null,
  criticalBelow = 20, // < 20      -> critical
  fullFrom = 80 // >= 80     -> full
): BatteryLevel | null {
  if (!isNum(percent)) return null; // no data yet

  const p = Math.min(100, Math.max(0, percent)); // clamp to 0-100

  if (p < criticalBelow) return 'critical';
  if (p >= fullFrom) return 'full';
  return 'average';
}

// Battery temperature in °C
export function getTempLevel(temp?: number | null): TempLevel | null {
  if (!isNum(temp)) return null; // no data yet

  if (temp <= 45) return 'normal'; // up to 45
  if (temp <= 60) return 'average'; // 46-60
  return 'critical'; // above 60
}
