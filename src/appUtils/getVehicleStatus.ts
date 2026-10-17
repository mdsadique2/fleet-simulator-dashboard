export type Status = 'normal' | 'moderate' | 'critical' | 'unknown';
export type Reason = 'batteryLow' | 'batteryOverheat' | null;

export type StatusResult = {
  status: Status;
  reason: Reason; // primary reason
  reasons: Reason[]; // every reason that applies (both can be true at once)
  message: string;
};

export function getVehicleStatus(
  soc?: number | null,
  batteryTemp?: number | null
): StatusResult {
  const hasSoc = typeof soc === 'number' && !Number.isNaN(soc);
  const hasTemp = typeof batteryTemp === 'number' && !Number.isNaN(batteryTemp);

  // No data received yet for either signal
  if (!hasSoc && !hasTemp) {
    return {
      status: 'unknown',
      reason: null,
      reasons: [],
      message: 'No battery data received',
    };
  }

  const criticalLow = hasSoc && soc! < 10;
  const overheating = hasTemp && batteryTemp! > 45;

  // Critical: very low battery and/or overheating
  if (criticalLow || overheating) {
    const reasons: Reason[] = [];
    if (overheating) reasons.push('batteryOverheat');
    if (criticalLow) reasons.push('batteryLow');

    return {
      status: 'critical',
      reason: reasons[0],
      reasons,
      message: overheating
        ? 'Battery overheating; urgent attention'
        : 'Very low battery; urgent attention',
    };
  }

  // Moderate: 10% <= SOC < 20%
  if (hasSoc && soc! < 20) {
    return {
      status: 'moderate',
      reason: 'batteryLow',
      reasons: ['batteryLow'],
      message: 'Low battery; attention required',
    };
  }

  // Normal: SOC >= 20% and temp <= 45
  return {
    status: 'normal',
    reason: null,
    reasons: [],
    message: 'No battery threshold alert',
  };
}
