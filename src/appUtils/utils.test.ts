import { describe, expect, it } from 'vitest';
import {
  getBatteryLevel,
  getSpeedLevel,
  getTempLevel,
} from './utils';

describe('getBatteryLevel', () => {
  it.each([
    [19, 'critical'],
    [20, '20'],
    [30, '40'],
    [40, '60'],
    [60, '80'],
    [80, 'full'],
    [-5, 'critical'],
    [105, 'full'],
  ])('classifies battery level %i as %s', (percent, expected) => {
    expect(getBatteryLevel(percent)).toBe(expected);
  });

  it.each([undefined, null, Number.NaN])(
    'returns null when battery level is missing or invalid: %s',
    (percent) => {
      expect(getBatteryLevel(percent)).toBeNull();
    }
  );
});

describe('getTempLevel', () => {
  it.each([
    [45, 'normal'],
    [45.1, 'average'],
    [60, 'average'],
    [60.1, 'critical'],
  ])('classifies temperature %i as %s', (temperature, expected) => {
    expect(getTempLevel(temperature)).toBe(expected);
  });

  it('returns null when temperature is unavailable', () => {
    expect(getTempLevel(null)).toBeNull();
  });
});

describe('getSpeedLevel', () => {
  it('classifies values over the configured threshold as high', () => {
    expect(getSpeedLevel(71)).toBe('high');
    expect(getSpeedLevel(81, 80)).toBe('high');
  });

  it('classifies values at or below the threshold as normal', () => {
    expect(getSpeedLevel(70)).toBe('normal');
    expect(getSpeedLevel(80, 80)).toBe('normal');
  });

  it('returns null when speed is unavailable', () => {
    expect(getSpeedLevel(undefined)).toBeNull();
  });
});
