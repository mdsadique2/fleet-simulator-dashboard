import { useEffect, useState, useRef } from 'react';
import { initializeDatabase, type FleetDatabase } from './db';
import { FleetTelemetrySimulator } from './FleetTelemetrySimulator';
import './App.css';
import { useVehicleState } from './useVehicleState';
import { Button } from 'antd';

type PacketRow = {
  packet_id: string;
  vehicle_id: string;
  event_time: string;
  received_at: string;
  payload_json: string;
};

export function AppRunner() {
  const [database, setDatabase] = useState<FleetDatabase | null>(null);
  const [revision, setRevision] = useState(0);
  const [packets, setPackets] = useState<PacketRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const BATCH_SIZE = 20; // configurable
  const { rows, ingest, pending } = useVehicleState(BATCH_SIZE);

  const simulator = useRef(null);

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

  const stop = () => {
    simulator.current?.stop();
  };

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

  // 3. Re-query persistent storage after each committed batch.
  // useEffect(() => {
  //   if (!database) return;

  //   let cancelled = false;

  //   async function loadPackets() {
  //     try {
  //       const result = await database.conn.query(`
  //         SELECT packet_id, vehicle_id, event_time,
  //                received_at, payload_json
  //         FROM telemetry_packets
  //         ORDER BY received_at DESC
  //         LIMIT 100
  //       `);

  //       if (!cancelled) {
  //         setPackets(
  //           result.toArray().map((row) => ({
  //             packet_id: String(row.packet_id),
  //             vehicle_id: String(row.vehicle_id),
  //             event_time: String(row.event_time),
  //             received_at: String(row.received_at),
  //             payload_json: String(row.payload_json),
  //           }))
  //         );
  //       }
  //     } catch (err) {
  //       if (!cancelled) {
  //         setError(err instanceof Error ? err.message : String(err));
  //       }
  //     }
  //   }

  //   void loadPackets();

  //   return () => {
  //     cancelled = true;
  //   };
  // }, [database, revision]);

  if (error) {
    return (
      <main>
        <h1>Fleet Console</h1>
        <p role="alert">{error}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <Button onClick={() => {}}>Strart</Button>
      <button
        onClick={() => {
          stop();
        }}
      >
        stop
      </button>

      <h1>Fleet Console</h1>
      <p>
        Database: {database ? 'Connected' : 'Initializing'}
        {' · '}
        Simulator: {loading ? 'Starting...' : 'Running'}
      </p>
      <p>Latest stored packets shown: {packets.length}</p>

      <table>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Event time</th>
            <th>Received at</th>
            <th>Signals</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const payload = row.payload;
            return (
              <tr key={row.vehicleId}>
                <td>{row.vehicleId}</td>
                <td>{row.eventTime}</td>
                <td>{row.signalReceived}</td>

                <td>
                  {Object.entries(payload.signals)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
