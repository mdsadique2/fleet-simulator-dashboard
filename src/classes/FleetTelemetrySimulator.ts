import type { FleetDatabase } from '../db';

export type TelemetryPacket = {
  packetId: string;
  vehicleId: string;
  eventTime: string;
  signals: Record<string, number | boolean>;
};

export type CommittedPacket = TelemetryPacket & {
  receivedAt: string;
};

type SimulatorOptions = {
  vehicleCount?: number;
  intervalMs?: number;
  onCommitted: (batch: CommittedPacket[]) => void;
};

export class FleetTelemetrySimulator {
  private conn: FleetDatabase['conn'];
  private vehicleCount: number;
  private intervalMs: number;
  private onCommitted: SimulatorOptions['onCommitted'];

  private timer: ReturnType<typeof setInterval> | undefined;
  private sequence = 0;
  private runningTick = false;
  private stopped = new Set<number>();
  private backlog: TelemetryPacket[] = [];
  private vehicleIds: string[] = [];

  constructor(
    database: FleetDatabase,
    { vehicleCount = 50, intervalMs = 1000, onCommitted }: SimulatorOptions
  ) {
    this.conn = database.conn;
    this.vehicleCount = vehicleCount;
    this.intervalMs = intervalMs;
    this.onCommitted = onCommitted;

    // A few trucks stop reporting, to exercise stale-data handling.
    for (let i = 16; i < vehicleCount; i += 17) {
      this.stopped.add(i);
    }
  }

  private async getAllVehicleIds() {
    const result = await this.conn.query(`SELECT vehicle_id FROM vehicles`);
    console.log('-----', result);
    this.vehicleIds = result.toArray().map((row) => row.vehicle_id);
  }

  private async vehicleId(index: number) {
    if (this.vehicleIds.length === 0) {
      await this.getAllVehicleIds();
    }

    return this.vehicleIds[index];
  }

  private sqlString(value: string) {
    return `'${value?.replace(/'/g, "''")}'`;
  }

  private makePacket(
    vehicleId: string,
    eventTime = Date.now()
  ): TelemetryPacket {
    const variants: Array<() => Record<string, number | boolean>> = [
      // Battery charge percentage
      () => ({
        soc: Math.round(5 + Math.random() * 95),
      }),

      // Vehicle speed in km/h
      () => ({
        speed: Math.round(Math.random() * 90),
      }),

      // Battery temperature in Celsius
      () => ({
        battery_temp: Number((20 + Math.random() * 32).toFixed(1)),
      }),

      // Battery percentage and estimated range
      () => {
        const soc = Math.round(5 + Math.random() * 95);
        const totalRange = 300 + Math.round(Math.random() * 100);

        return {
          soc,
          total_range_km: totalRange,
          range_remaining_km: Math.round((totalRange * soc) / 100),
        };
      },

      // GPS coordinates
      () => ({
        latitude: Number((12.8 + Math.random() * 0.3).toFixed(6)),
        longitude: Number((77.4 + Math.random() * 0.4).toFixed(6)),
      }),

      // Multiple signals in a partial packet
      () => ({
        soc: Math.round(5 + Math.random() * 95),
        battery_temp: Number((20 + Math.random() * 32).toFixed(1)),
      }),
    ];

    const signals = variants[Math.floor(Math.random() * variants.length)]();

    return {
      packetId: `pkt-${++this.sequence}`,
      vehicleId,
      eventTime: new Date(eventTime).toISOString(),
      signals,
    };
  }

  private async commit(packets: TelemetryPacket[]): Promise<CommittedPacket[]> {
    if (!packets.length) return [];

    const receivedAt = new Date().toISOString();

    // Check both existing DB records and duplicates within this batch.
    const unique = new Map<string, TelemetryPacket>();
    for (const packet of packets) {
      if (!unique.has(packet.packetId)) {
        unique.set(packet.packetId, packet);
      }
    }

    const batch = [...unique.values()];
    const ids = batch.map((p) => this.sqlString(p.packetId)).join(', ');

    await this.conn.query('BEGIN TRANSACTION');

    let inserted: CommittedPacket[] = [];

    try {
      const existing = await this.conn.query(`
        SELECT packet_id
        FROM telemetry_packets
        WHERE packet_id IN (${ids})
      `);

      const existingIds = new Set(
        existing.toArray().map((row) => String(row.packet_id))
      );

      inserted = batch
        .filter((packet) => !existingIds.has(packet.packetId))
        .map((packet) => ({ ...packet, receivedAt }));

      // Use a single INSERT statement for the newly accepted batch.
      if (inserted.length) {
        const values = inserted
          .map(
            (packet) => `
          (
            ${this.sqlString(packet.packetId)},
            ${this.sqlString(packet.vehicleId)},
            CAST(${this.sqlString(packet.eventTime)} AS TIMESTAMP),
            CAST(${this.sqlString(packet.receivedAt)} AS TIMESTAMP),
            ${this.sqlString(JSON.stringify(packet))}
          )
        `
          )
          .join(',');

        await this.conn.query(`
          INSERT INTO telemetry_packets
          (packet_id, vehicle_id, event_time, received_at, payload_json)
          VALUES ${values}
        `);
      }

      await this.conn.query('COMMIT');
    } catch (error) {
      await this.conn.query('ROLLBACK');
      throw error;
    }

    // Notify React only after a successful commit.
    if (inserted.length) {
      this.onCommitted(inserted);
    }

    return inserted;
  }

  async tick() {
    if (this.runningTick) return;
    this.runningTick = true;

    try {
      const packets: TelemetryPacket[] = [];
      const now = Date.now();

      // Release a portion of the backlog on later ticks.
      if (this.backlog.length && Math.random() < 0.5) {
        packets.push(...this.backlog.splice(0, 10));
      }

      for (let i = 0; i < this.vehicleCount; i++) {
        if (this.stopped.has(i)) continue;

        // Simulate missing reporting intervals.
        if (Math.random() < 0.08) continue;

        const vehicleId = await this.vehicleId(i);
        const packet = this.makePacket(vehicleId, now);

        // Simulate disconnection: hold packets for later delivery.
        if (Math.random() < 0.05) {
          this.backlog.push(packet);
          continue;
        }

        packets.push(packet);

        // Occasionally add an older, late-arriving reading.
        if (Math.random() < 0.05) {
          packets.push(this.makePacket(vehicleId, now - 60_000));
        }

        // Occasionally replay the same packet identity.
        if (Math.random() < 0.03) {
          packets.push(packet);
        }
      }

      for (let i = 0; i < packets.length; i += 100) {
        await this.commit(packets.slice(i, i + 100));
      }
    } finally {
      this.runningTick = false;
    }
  }

  async start() {
    if (this.timer) return;

    await this.tick();

    this.timer = setInterval(() => {
      void this.tick().catch((error) => {
        console.error('Telemetry tick failed', error);
      });
    }, this.intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
