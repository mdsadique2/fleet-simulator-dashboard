import * as duckdb from '@duckdb/duckdb-wasm';
import mvpWasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url';
import mvpWorker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url';
import ehWasm from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url';
import ehWorker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url';
import { createTable, query } from './dbUtils/queryConst';
import { generateVehicleSeeds } from './dbUtils/generateVehicleSeeds';

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

let databasePromise: Promise<FleetDatabase> | undefined;

export function initializeDatabase(): Promise<FleetDatabase> {
  if (databasePromise) return databasePromise;

  databasePromise = (async () => {
    const bundle = await duckdb.selectBundle(bundles);
    const worker = new Worker(bundle.mainWorker!);

    const db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker);

    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

    // OPFS stores the database file across page reloads/sessions.
    await db.open({
      path: 'opfs://fleet-console.db',
      accessMode: duckdb.DuckDBAccessMode.READ_WRITE,
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

    return { db, conn };
  })().catch((error) => {
    // Allow a retry if initialization failed.
    databasePromise = undefined;
    throw error;
  });

  return databasePromise;
}
