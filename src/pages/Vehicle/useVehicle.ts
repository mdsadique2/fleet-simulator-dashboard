import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { initializeDatabase, type FleetDatabase } from '../../db';
import type { CommittedPacket } from '../../classes//FleetTelemetrySimulator';
import {
  VehicleDetailsService,
  type PacketQueryOptions,
  type VehicleDetails,
} from '../../classes/VehicleDetails';

export type VehicleLogRow = {
  packetId: string;
  eventTime: string;
  receivedAt: string;
  /** Flattened signals, e.g. "soc=54, battery_temp=31.2" */
  signals: string;
};

type UseVehicleResult = {
  vehicle: VehicleDetails | null;
  packets: CommittedPacket[];
  /** Same packets, shaped for rendering in a log table */
  logRows: VehicleLogRow[];
  loading: boolean;
  error: Error | null;
  /** Re-query vehicle + packets from the database */
  refetch: () => Promise<void>;
  /**
   * Feed live batches (e.g. from the simulator's onCommitted) into the hook.
   * Packets for other vehicles are ignored; duplicates are skipped.
   */
  addCommittedPackets: (batch: CommittedPacket[]) => void;
};

export function useVehicle(
  vehicleId: string | null | undefined,
  options?: PacketQueryOptions
): UseVehicleResult {
  const [vehicle, setVehicle] = useState<VehicleDetails | null>(null);
  const [packets, setPackets] = useState<CommittedPacket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Database + service live in refs: created once, never trigger re-renders.
  const dbRef = useRef<FleetDatabase | null>(null);
  const serviceRef = useRef<VehicleDetailsService | null>(null);
  const initRef = useRef<Promise<VehicleDetailsService> | null>(null);

  // Keep options in a ref so an inline object doesn't retrigger the fetch.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Guards against stale responses when vehicleId changes quickly.
  const requestId = useRef(0);

  // Initialise the database once (shared promise avoids double-init in StrictMode).
  const getService = useCallback((): Promise<VehicleDetailsService> => {
    if (serviceRef.current) return Promise.resolve(serviceRef.current);

    if (!initRef.current) {
      initRef.current = (async () => {
        const db = await initializeDatabase();
        dbRef.current = db;
        serviceRef.current = new VehicleDetailsService(db);
        return serviceRef.current;
      })().catch((err) => {
        initRef.current = null; // allow retry after a failed init
        throw err;
      });
    }

    return initRef.current;
  }, []);

  const load = useCallback(async () => {
    if (!vehicleId) {
      requestId.current++;
      setVehicle(null);
      setPackets([]);
      setError(null);
      setLoading(false);
      return;
    }

    const current = ++requestId.current;
    setLoading(true);
    setError(null);

    try {
      const service = await getService();
      const data = await service.getVehicleWithPackets(
        vehicleId,
        optionsRef.current
      );
      if (current !== requestId.current) return;
      setVehicle(data?.vehicle ?? null);
      setPackets(data?.packets ?? []);
    } catch (err) {
      if (current !== requestId.current) return;
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  }, [vehicleId, getService]);

  useEffect(() => {
    void load();
    return () => {
      // Invalidate any in-flight request on unmount / id change.
      requestId.current++;
    };
  }, [load]);

  const addCommittedPackets = useCallback(
    (batch: CommittedPacket[]) => {
      if (!vehicleId) return;
      const mine = batch.filter((p) => p.vehicleId === vehicleId);
      if (!mine.length) return;

      setPackets((prev) => {
        const seen = new Set(prev.map((p) => p.packetId));
        const fresh = mine.filter((p) => !seen.has(p.packetId));
        if (!fresh.length) return prev;

        // Newest event first, matching the default query order.
        return [...fresh, ...prev].sort(
          (a, b) =>
            new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime()
        );
      });
    },
    [vehicleId]
  );

  const logRows = useMemo<VehicleLogRow[]>(
    () =>
      packets.map((p) => ({
        packetId: p.packetId,
        eventTime: p.eventTime,
        receivedAt: p.receivedAt,
        signals: Object.entries(p.signals)
          .map(([key, value]) => `${key}=${value}`)
          .join(', '),
      })),
    [packets]
  );

  return {
    vehicle,
    packets,
    logRows,
    loading,
    error,
    refetch: load,
    addCommittedPackets,
  };
}