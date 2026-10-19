import { useState, useEffect, useRef } from 'react';
import { initializeDatabase, type FleetDatabase } from '../../db';
import { useVehicleState } from './useVehicleState';
import { FleetTelemetrySimulator } from '../../classes/FleetTelemetrySimulator';

const filterOption = ['critical', 'moderate', 'normal']

export function useDashboard() {
  const [database, setDatabase] = useState<FleetDatabase | null>(null);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rowsToShow, setRowsToShow] = useState(filterOption);

  const simulator = useRef(null);

  const BATCH_SIZE = 100; // configurable
  const { rows, ingest, flush, pending, clearRows } = useVehicleState(BATCH_SIZE, rowsToShow);

  // 1. Initialize DuckDB and start the simulator.
  useEffect(() => {
    let cancelled = false;
    // let simulator: FleetTelemetrySimulator | undefined;

    async function start() {
      try {
        const db = await initializeDatabase();
        if (cancelled) return;

        const packetCountResult = await db.conn.query(`
          SELECT COUNT(*) AS packet_count
          FROM telemetry_packets
        `);
        setDatabase(db);

        simulator.current = new FleetTelemetrySimulator(db, {
          vehicleCount: 500,
          intervalMs: 1000,

          // 2. This runs after a batch has been committed.
          onCommitted: (batch) => {
            console.log('Committed packet count:', batch.length);
            setRevision((current) => current + 1);
          },
        });

        await simulator.current.start();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
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
        `);
        if (cancelled) return;

        const allVehiclesData = simulator.current.getAlleVehiclesMap();
        ingest(
          result.toArray().map((row: any) => ({
            packet_id: String(row.packet_id),
            vehicle_id: String(row.vehicle_id),
            event_time: row.event_time, // raw value, don't String() it
            received_at: row.received_at,
            payload_json: String(row.payload_json),
          })),
          allVehiclesData
        );
        flush(allVehiclesData);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : String(err));
      }
    }

    void loadPackets();
    return () => {
      cancelled = true;
    };
  }, [database, revision, ingest, flush]);


  const onFilterUpdate = (val) => {
    clearRows();
    setRowsToShow(val);
  }

  return {
    database,
    loading,
    rows,
    pending,
    stop,
    error,
    rowsToShow,
    onFilterUpdate,
    filterOption,
  };
}
