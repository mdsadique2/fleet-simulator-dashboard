import { useState, useEffect, useRef } from 'react';
import { initializeDatabase, type FleetDatabase } from '../../db';
import { useVehicleState } from './useVehicleState';
import { FleetTelemetrySimulator } from '../../classes/FleetTelemetrySimulator';

export function useDashboard() {
  const [database, setDatabase] = useState<FleetDatabase | null>(null);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const simulator = useRef(null);

  const BATCH_SIZE = 20; // configurable
  const { rows, ingest, pending } = useVehicleState(BATCH_SIZE);

  // 1. Initialize DuckDB and start the simulator.
  useEffect(() => {
    let cancelled = false;
    // let simulator: FleetTelemetrySimulator | undefined;

    async function start() {
      try {
        const db = await initializeDatabase();

        if (cancelled) return;

        setDatabase(db);

        simulator.current = new FleetTelemetrySimulator(db, {
          vehicleCount: 50,
          intervalMs: 1000,

          // 2. This runs after a batch has been committed.
          onCommitted: (batch) => {
            console.log('Committed packet count:', batch.length);
            setRevision((current) => current + 1);
          },
        });

        await simulator.current.start();
      } catch (err) {
        throw err;
        // if (!cancelled) {
        //   setError(err instanceof Error ? err.message : String(err));
        // }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void start();

    return () => {
      cancelled = true;
      simulator.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (!database) return;
    let cancelled = false;

    async function loadPackets() {
      try {
        const result = await database.conn.query(`
          SELECT packet_id, vehicle_id, event_time, received_at, payload_json
          FROM telemetry_packets
          ORDER BY received_at DESC
          LIMIT 100
        `);
        if (cancelled) return;

        ingest(
          result.toArray().map((row: any) => ({
            packet_id: String(row.packet_id),
            vehicle_id: String(row.vehicle_id),
            event_time: row.event_time, // raw value, don't String() it
            received_at: row.received_at,
            payload_json: String(row.payload_json),
          }))
        );
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : String(err));
      }
    }

    void loadPackets();
    return () => {
      cancelled = true;
    };
  }, [database, revision, ingest]);

  console.log('rows', rows);

  return {
    database,
    loading,
    rows,
    pending,
    stop,
    error,
  };
}
