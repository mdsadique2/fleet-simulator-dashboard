import type { FleetDatabase } from '../db';
import type { CommittedPacket } from './FleetTelemetrySimulator';

export type VehicleDetails = Record<string, string | number | boolean | null>;

export type VehicleWithPackets = {
  vehicle: VehicleDetails;
  packets: CommittedPacket[];
};

export type PacketQueryOptions = {
  /** ISO string, inclusive lower bound on event_time */
  from?: string;
  /** ISO string, inclusive upper bound on event_time */
  to?: string;
  /** Max packets to return */
  limit?: number;
  /** Sort by event_time. Defaults to 'desc' (newest first) */
  order?: 'asc' | 'desc';
};

export class VehicleDetailsService {
  private conn: FleetDatabase['conn'];

  constructor(database: FleetDatabase) {
    this.conn = database.conn;
  }

  private sqlString(value: string) {
    return `'${String(value).replace(/'/g, "''")}'`;
  }

  // Arrow can return BigInt for integer columns; make them JSON/React friendly.
  private normalize(value: unknown) {
    return typeof value === 'bigint' ? Number(value) : value;
  }

  private rowToObject(row: any): VehicleDetails {
    const raw = typeof row.toJSON === 'function' ? row.toJSON() : row;
    const out: VehicleDetails = {};
    for (const [key, value] of Object.entries(raw)) {
      out[key] = this.normalize(value) as VehicleDetails[string];
    }
    return out;
  }

  // DuckDB renders TIMESTAMP as "YYYY-MM-DD HH:MM:SS[.fff]" (UTC here).
  private toIso(value: string) {
    return new Date(value.replace(' ', 'T') + 'Z').toISOString();
  }

  /** All details of a single vehicle, or null if the id doesn't exist. */
  async getVehicle(vehicleId: string): Promise<VehicleDetails | null> {
    const result = await this.conn.query(`
      SELECT *
      FROM vehicles
      WHERE vehicle_id = ${this.sqlString(vehicleId)}
      LIMIT 1
    `);

    const rows = result.toArray();
    return rows.length ? this.rowToObject(rows[0]) : null;
  }

  /** All telemetry packets received for a vehicle. */
  async getPackets(
    vehicleId: string,
    { from, to, limit, order = 'desc' }: PacketQueryOptions = {}
  ): Promise<CommittedPacket[]> {
    const conditions = [`vehicle_id = ${this.sqlString(vehicleId)}`];

    if (from) {
      conditions.push(`event_time >= CAST(${this.sqlString(from)} AS TIMESTAMP)`);
    }
    if (to) {
      conditions.push(`event_time <= CAST(${this.sqlString(to)} AS TIMESTAMP)`);
    }

    const direction = order === 'asc' ? 'ASC' : 'DESC';
    const limitClause =
      limit && limit > 0 ? `LIMIT ${Math.floor(limit)}` : '';

    const result = await this.conn.query(`
      SELECT
        packet_id,
        payload_json,
        CAST(received_at AS VARCHAR) AS received_at
      FROM telemetry_packets
      WHERE ${conditions.join(' AND ')}
      ORDER BY event_time ${direction}, received_at ${direction}
      ${limitClause}
    `);

    return result.toArray().map((row: any) => {
      const packet = JSON.parse(String(row.payload_json));
      return {
        ...packet,
        receivedAt: this.toIso(String(row.received_at)),
      } as CommittedPacket;
    });
  }

  /** Vehicle details + all its packets in one call. Returns null if the vehicle doesn't exist. */
  async getVehicleWithPackets(
    vehicleId: string,
    options?: PacketQueryOptions
  ): Promise<VehicleWithPackets | null> {
    const [vehicle, packets] = await Promise.all([
      this.getVehicle(vehicleId),
      this.getPackets(vehicleId, options),
    ]);

    if (!vehicle) return null;
    return { vehicle, packets };
  }
}