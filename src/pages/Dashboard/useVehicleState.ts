import { useCallback, useRef, useState } from 'react';
import { getVehicleStatus } from '../../appUtils/getVehicleStatus';
export type Packet = {
  packet_id: string;
  vehicle_id: string;
  event_time: unknown; // raw value from DuckDB (number | bigint | Date | string)
  received_at: unknown;
  payload_json: string;
};

export type VehicleRow = {
  vehicleId: string;
  eventTime: string; // latest event time for this vehicle
  signalReceived: string; // latest received_at for this vehicle
  payload: Record<string, any>; // nested, e.g. { signals: { soc, lat, long, ... } }
};

type Entry = {
  row: VehicleRow;
  fieldTs: Record<string, number>; // event time (ms) per leaf path, e.g. "signals.soc"
  eventMs: number;
  receivedMs: number;
};

const toMs = (v: unknown): number => {
  if (v instanceof Date) return v.getTime();
  if (typeof v === 'number' || typeof v === 'bigint') return Number(v);
  const t = Date.parse(String(v));
  return Number.isNaN(t) ? 0 : t;
};

const isObject = (v: unknown): v is Record<string, any> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

// Walks the incoming object and sets each leaf value on the target,
// creating nested objects as needed and leaving everything else untouched.
function mergeDeep(
  target: Record<string, any>,
  incoming: Record<string, any>,
  fieldTs: Record<string, number>,
  ts: number,
  path = ''
) {
  for (const [key, value] of Object.entries(incoming)) {
    if (value === null || value === undefined) continue;
    const fullPath = path ? `${path}.${key}` : key;

    if (isObject(value)) {
      if (!isObject(target[key])) target[key] = {};
      mergeDeep(target[key], value, fieldTs, ts, fullPath);
    } else if (ts >= (fieldTs[fullPath] ?? -Infinity)) {
      // add if missing, update only if this packet is at least as new
      target[key] = value;
      fieldTs[fullPath] = ts;
    }
  }
}

// Merges one batch of packets into the accumulated store (mutates the store).
function mergePackets(store: Map<string, Entry>, batch: Packet[]) {
  // oldest first, so the newest value is written last
  const sorted = [...batch].sort(
    (a, b) => toMs(a.event_time) - toMs(b.event_time)
  );

  for (const p of sorted) {
    let incoming: Record<string, any>;
    try {
      incoming = JSON.parse(p.payload_json);
    } catch {
      continue; // skip malformed payloads
    }
    if (!isObject(incoming)) continue;

    // reuse the existing entry, or create one the first time we see this vehicle
    let entry = store.get(p.vehicle_id);

    if (!entry) {
      entry = {
        row: {
          vehicleId: p.vehicle_id,
          eventTime: '',
          signalReceived: '',
          payload: {},
          status: '',
          reason: '',
          reasons: [],
          message: '',
        },
        fieldTs: {},
        eventMs: 0,
        receivedMs: 0,
      };
      store.set(p.vehicle_id, entry);
    }

    const { battery_temp, soc } = entry.row.payload.signals || {};
    const { status, reason, reasons, message } = getVehicleStatus(
      soc,
      battery_temp
    );
    entry.status = status;
    entry.message = message;
    entry.reason = reason;
    entry.reasons = reasons;

    const ev = toMs(p.event_time);
    const rc = toMs(p.received_at);

    mergeDeep(entry.row.payload, incoming, entry.fieldTs, ev);

    if (ev > entry.eventMs) {
      entry.eventMs = ev;
      entry.row.eventTime = new Date(ev).toISOString();
    }
    if (rc > entry.receivedMs) {
      entry.receivedMs = rc;
      entry.row.signalReceived = new Date(rc).toISOString();
    }
  }
}

// Deep copy so React sees new objects at every level.
function snapshot(store: Map<string, Entry>): VehicleRow[] {
  return Array.from(store.values()).map((e) => {
    const { battery_temp, soc } = e.row.payload.signals;
    // console.log('-----------mmmm', signal);
    const { status, reason, reasons, message } = getVehicleStatus(
      soc,
      battery_temp
    );

    return {
      ...e.row,
      status,
      reason,
      reasons,
      message,
      payload: JSON.parse(JSON.stringify(e.row.payload)),
    };
  });
}

// For display only: { signals: { soc: 30 } } -> { "signals.soc": 30 }
export function flattenPayload(
  obj: Record<string, any>,
  prefix = '',
  out: Record<string, unknown> = {}
): Record<string, unknown> {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (isObject(v)) flattenPayload(v, key, out);
    else out[key] = v;
  }
  return out;
}

export function useVehicleState(batchSize = 20) {
  const storeRef = useRef(new Map<string, Entry>()); // accumulated state, survives re-renders
  const bufferRef = useRef<Packet[]>([]); // packets waiting for a full batch
  const seenRef = useRef(new Set<string>()); // packet_ids already buffered
  const [rows, setRows] = useState<VehicleRow[]>([]);

  const ingest = useCallback(
    (packets: Packet[]) => {
      for (const p of packets) {
        if (seenRef.current.has(p.packet_id)) continue;
        seenRef.current.add(p.packet_id);
        bufferRef.current.push(p);
      }

      if (bufferRef.current.length < batchSize) return;

      // process complete batches, oldest received first; the remainder stays buffered
      bufferRef.current.sort(
        (a, b) => toMs(a.received_at) - toMs(b.received_at)
      );
      while (bufferRef.current.length >= batchSize) {
        mergePackets(storeRef.current, bufferRef.current.splice(0, batchSize));
      }
      setRows(snapshot(storeRef.current));
    },
    [batchSize]
  );

  // apply whatever is left in the buffer (fewer than batchSize packets)
  const flush = useCallback(() => {
    if (!bufferRef.current.length) return;
    mergePackets(storeRef.current, bufferRef.current.splice(0));
    setRows(snapshot(storeRef.current));
  }, []);

  return { rows, ingest, flush };
}
