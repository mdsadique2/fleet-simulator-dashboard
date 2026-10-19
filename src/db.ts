import * as duckdb from '@duckdb/duckdb-wasm';
import mvpWasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvpWorker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import ehWasm from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import ehWorker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import { createTable, query } from './dbUtils/queryConst';
import { generateVehicleSeeds } from './dbUtils/generateVehicleSeeds';
import {
  getStoredTelemetryPackets,
  MAX_TELEMETRY_PACKETS,
  clearStoredTelemetryPackets,
  saveTelemetryPackets,
} from './dbUtils/telemetryPacketStore';

const bundles: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: mvpWasm,
    mainWorker: mvpWorker,
  },
  eh: {
    mainModule: ehWasm,
    mainWorker: ehWorker,
  },
};

export type FleetDatabase = {
  db: duckdb.AsyncDuckDB;
  conn: duckdb.AsyncDuckDBConnection;
};

/** Clears all stored telemetry; stop the simulator first to prevent new packets. */
export async function clearTelemetryData(
  database: FleetDatabase
): Promise<void> {
  await database.conn.query('DELETE FROM telemetry_packets');
  await database.conn.query('CHECKPOINT');
  await database.db.flushFiles();
  await clearStoredTelemetryPackets();
}

let databasePromise: Promise<FleetDatabase> | undefined;

export function initializeDatabase(): Promise<FleetDatabase> {
  if (databasePromise) return databasePromise;

  databasePromise = (async () => {
    const persistentStorage = await navigator.storage?.persist?.();
    if (persistentStorage === false) {
      console.warn(
        'Browser storage is not protected from automatic eviction for this origin.'
      );
    }

    const bundle = await duckdb.selectBundle(bundles);
    const worker = new Worker(bundle.mainWorker!);

    const db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker);

    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

    // OPFS stores the database file across page reloads/sessions.
    await db.open({
      path: 'opfs://fleet-console.db',
      accessMode: duckdb.DuckDBAccessMode.READ_WRITE,
      opfs: { fileHandling: 'auto' },
    });

    const conn = await db.connect();

    // 1. Telemetry Packets Table
    await conn.query(createTable.telemetryPackets);

    // 2. Vehicles Table
    await conn.query(createTable.vehicles);

    // 3. Seed 500 vehicles if table is empty
    const countResult = await conn.query(query.vehiclesCount);
    // DuckDB query result objects can be converted or iterated; checking count safely:
    const totalVehicles = Number(countResult.toArray()[0].cnt);

    if (totalVehicles === 0) {
      // const seedValues = generateVehicleSpecsQuery(); // or inline generator
      // To prevent massive SQL string limits, we can batch or insert directly:
      const insertQuery = `
        ${query.insertVehicleValues} 
        ${generateVehicleSeeds()}
      `;

      await conn.query(insertQuery);
    }

    const databasePacketsResult = await conn.query(`
      SELECT
        payload_json,
        CAST(received_at AS VARCHAR) AS received_at
      FROM telemetry_packets
      ORDER BY received_at DESC
      LIMIT ${MAX_TELEMETRY_PACKETS}
    `);
    const databasePackets = databasePacketsResult.toArray().map((row) => {
      const packet = JSON.parse(String(row.payload_json));
      const receivedAt = String(row.received_at);
      return {
        ...packet,
        receivedAt: new Date(
          `${receivedAt.replace(' ', 'T')}Z`
        ).toISOString(),
      };
    });
    await saveTelemetryPackets(databasePackets);

    const storedPackets = await getStoredTelemetryPackets();
    for (let i = 0; i < storedPackets.length; i += 250) {
      const batch = storedPackets.slice(i, i + 250);
      const values = batch
        .map(
          (packet) => `
          (
            '${packet.packetId.replace(/'/g, "''")}',
            '${packet.vehicleId.replace(/'/g, "''")}',
            CAST('${packet.eventTime.replace(/'/g, "''")}' AS TIMESTAMP),
            CAST('${packet.receivedAt.replace(/'/g, "''")}' AS TIMESTAMP),
            '${JSON.stringify(packet).replace(/'/g, "''")}'
          )
        `
        )
        .join(',');

      await conn.query(`
        INSERT INTO telemetry_packets
        (packet_id, vehicle_id, event_time, received_at, payload_json)
        VALUES ${values}
        ON CONFLICT (packet_id) DO NOTHING
      `);
    }

    const packetCountResult = await conn.query(`
      SELECT COUNT(*) AS packet_count
      FROM telemetry_packets
    `);
    const packetsToDelete =
      Number(packetCountResult.toArray()[0]?.packet_count ?? 0) -
      MAX_TELEMETRY_PACKETS;
    if (packetsToDelete > 0) {
      await conn.query(`
        DELETE FROM telemetry_packets
        WHERE packet_id IN (
          SELECT packet_id
          FROM telemetry_packets
          ORDER BY received_at ASC, packet_id ASC
          LIMIT ${packetsToDelete}
        )
      `);
    }
    await db.flushFiles();

    return { db, conn };
  })().catch((error) => {
    // Allow a retry if initialization failed.
    databasePromise = undefined;
    throw error;
  });

  return databasePromise;
}
