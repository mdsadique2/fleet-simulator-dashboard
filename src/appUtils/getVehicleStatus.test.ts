import { describe, expect, it } from 'vitest';
import { getVehicleStatus } from './getVehicleStatus';

describe('getVehicleStatus', () => {
  it('returns unknown when both battery signals are unavailable', () => {
    expect(getVehicleStatus()).toMatchObject({
      status: 'unknown',
      reason: null,
      reasons: [],
    });
  });

  it('marks state critical when charge is below 10 percent', () => {
    expect(getVehicleStatus(9, 30)).toMatchObject({
      status: 'critical',
      reason: 'batteryLow',
      reasons: ['batteryLow'],
    });
  });

  it('marks state moderate from 10 up to but excluding 20 percent', () => {
    expect(getVehicleStatus(10, 45)).toMatchObject({
      status: 'moderate',
      reason: 'batteryLow',
      reasons: ['batteryLow'],
    });
    expect(getVehicleStatus(19, 45).status).toBe('moderate');
  });

  it('marks state critical when battery temperature is above 45 degrees', () => {
    expect(getVehicleStatus(70, 46)).toMatchObject({
      status: 'critical',
      reason: 'batteryOverheat',
      reasons: ['batteryOverheat'],
    });
  });

  it('reports both causes when charge is low and battery is overheating', () => {
    expect(getVehicleStatus(5, 50)).toMatchObject({
      status: 'critical',
      reason: 'batteryOverheat',
      reasons: ['batteryOverheat', 'batteryLow'],
    });
  });

  it('considers exactly 20 percent and 45 degrees normal', () => {
    expect(getVehicleStatus(20, 45)).toMatchObject({
      status: 'normal',
      reason: null,
      reasons: [],
    });
  });

  it('ignores non-finite signal values and returns unknown if both are invalid', () => {
    expect(getVehicleStatus(Number.NaN, Number.NaN).status).toBe('unknown');
  });
});
