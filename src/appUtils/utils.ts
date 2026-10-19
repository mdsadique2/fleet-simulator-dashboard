import { CRITICAL, AVERAGE, FULL, NORMAL, HIGH } from "./consts";

export type BatteryLevel = 'critical' | 'average' | 'full'| '20' | '40' | '60' | '80';
export type TempLevel = 'normal' | 'average' | 'critical';
export type SpeedLevel = 'normal' | 'high';


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

  if (p < criticalBelow) return CRITICAL;
  if (p >= fullFrom) return FULL;
  if (p>=20 && p<30) return '20';
  if (p>=30 && p<40) return '40';
  if (p>=40 && p<60) return '60';
  if (p>=60 && p<80) return '80';
  return 'average';
}

// Battery temperature in °C
export function getTempLevel(temp?: number | null): TempLevel | null {
  if (!isNum(temp)) return null; // no data yet

  if (temp <= 45) return NORMAL; // up to 45
  if (temp <= 60) return AVERAGE; // 46-60
  return CRITICAL; // above 60
}

export function getSpeedLevel(
  speed?: number | null,
  highAbove = 70   // km/h
): SpeedLevel | null {
  if (typeof speed !== 'number' || Number.isNaN(speed)) return null; // no data yet

  return speed > highAbove ? HIGH : NORMAL;
}