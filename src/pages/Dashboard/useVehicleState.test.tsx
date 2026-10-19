import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  flattenPayload,
  useVehicleState,
  type Packet,
} from './useVehicleState';

const vehicles = {
  'vehicle-1': { make: 'Tesla' },
  'vehicle-2': { make: 'Volvo' },
};

function packet(
  packetId: string,
  vehicleId: string,
  eventTime: string,
  signals: Record<string, number | boolean>,
  receivedAt = eventTime
): Packet {
  return {
    packet_id: packetId,
    vehicle_id: vehicleId,
    event_time: eventTime,
    received_at: receivedAt,
    payload_json: JSON.stringify({ signals }),
  };
}

describe('useVehicleState', () => {
  it('waits for a full batch, then creates aggregated vehicle rows', () => {
    const { result } = renderHook(() => useVehicleState(2, []));

    act(() => {
      result.current.ingest(
        [packet('packet-1', 'vehicle-1', '2026-01-01T00:00:00.000Z', { soc: 40 })],
        vehicles
      );
    });
    expect(result.current.rows).toHaveLength(0);

    act(() => {
      result.current.ingest(
        [packet('packet-2', 'vehicle-2', '2026-01-01T00:00:01.000Z', { soc: 75 })],
        vehicles
      );
    });

    expect(result.current.rows).toHaveLength(2);
    expect(result.current.rows[0]).toMatchObject({
      vehicleId: 'vehicle-1',
      payload: { signals: { soc: 40 } },
      vehicleDetails: vehicles['vehicle-1'],
    });
  });

  it('flushes a partial batch so the last packets can be displayed', () => {
    const { result } = renderHook(() => useVehicleState(10, []));
    const reading = packet(
      'packet-1',
      'vehicle-1',
      '2026-01-01T00:00:00.000Z',
      { soc: 60 }
    );

    act(() => {
      result.current.ingest([reading], vehicles);
      result.current.flush(vehicles);
    });

    expect(result.current.rows).toHaveLength(1);
    expect(result.current.rows[0].payload.signals.soc).toBe(60);
  });

  it('filters aggregated rows by vehicle status', () => {
    const { result } = renderHook(() =>
      useVehicleState(1, ['critical'])
    );

    act(() => {
      result.current.ingest(
        [packet('packet-1', 'vehicle-1', '2026-01-01T00:00:00.000Z', { soc: 5 })],
        vehicles
      );
    });

    expect(result.current.rows).toHaveLength(1);
    expect(result.current.rows[0].status).toBe('critical');
  });

  it('skips duplicate packet IDs', () => {
    const { result } = renderHook(() => useVehicleState(10, []));
    const reading = packet(
      'packet-1',
      'vehicle-1',
      '2026-01-01T00:00:00.000Z',
      { soc: 60 }
    );

    act(() => {
      result.current.ingest([reading, reading], vehicles);
      result.current.flush(vehicles);
    });

    expect(result.current.rows).toHaveLength(1);
  });

  it('updates each signal only from a packet with a newer event time', () => {
    const { result } = renderHook(() => useVehicleState(2, []));

    act(() => {
      result.current.ingest(
        [
          packet('new', 'vehicle-1', '2026-01-01T00:00:02.000Z', { soc: 80 }),
          packet('old', 'vehicle-1', '2026-01-01T00:00:01.000Z', { soc: 10, speed: 20 }),
        ],
        vehicles
      );
    });

    expect(result.current.rows[0].payload.signals).toEqual({
      soc: 80,
      speed: 20,
    });
    expect(result.current.rows[0].eventTime).toBe(
      '2026-01-01T00:00:02.000Z'
    );
  });

  it('clears displayed rows', () => {
    const { result } = renderHook(() => useVehicleState(1, []));

    act(() => {
      result.current.ingest(
        [packet('packet-1', 'vehicle-1', '2026-01-01T00:00:00.000Z', { soc: 60 })],
        vehicles
      );
    });
    act(() => result.current.clearRows());

    expect(result.current.rows).toEqual([]);
  });
});

describe('flattenPayload', () => {
  it('flattens nested signal values into dotted paths', () => {
    expect(
      flattenPayload({ signals: { soc: 50, location: { latitude: 1.2 } } })
    ).toEqual({
      'signals.soc': 50,
      'signals.location.latitude': 1.2,
    });
  });
});
