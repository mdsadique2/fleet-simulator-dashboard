import type { CommittedPacket } from '../classes/FleetTelemetrySimulator';

export const MAX_TELEMETRY_PACKETS = 10_000;

const DATABASE_NAME = 'fleet-console-storage';
const STORE_NAME = 'telemetry_packets';

let databasePromise: Promise<IDBDatabase> | undefined;

function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, { keyPath: 'packetId' });
    };
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => database.close();
      resolve(database);
    };
    request.onerror = () => reject(request.error);
  }).catch((error) => {
    databasePromise = undefined;
    throw error;
  });

  return databasePromise;
}

export async function getStoredTelemetryPackets(): Promise<CommittedPacket[]> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).getAll();

    request.onsuccess = () => {
      resolve(
        (request.result as CommittedPacket[]).sort(
          (a, b) =>
            new Date(b.receivedAt).getTime() -
              new Date(a.receivedAt).getTime() ||
            a.packetId.localeCompare(b.packetId)
        )
      );
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveTelemetryPackets(
  packets: CommittedPacket[]
): Promise<void> {
  if (!packets.length) return;

  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    for (const packet of packets) store.put(packet);

    const countRequest = store.count();
    countRequest.onsuccess = () => {
      const excess = countRequest.result - MAX_TELEMETRY_PACKETS;
      if (excess <= 0) return;

      const packetsRequest = store.getAll();
      packetsRequest.onsuccess = () => {
        const oldestPackets = (packetsRequest.result as CommittedPacket[])
          .sort(
            (a, b) =>
              new Date(a.receivedAt).getTime() -
                new Date(b.receivedAt).getTime() ||
              a.packetId.localeCompare(b.packetId)
          )
          .slice(0, excess);

        for (const packet of oldestPackets) store.delete(packet.packetId);
      };
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () =>
      reject(transaction.error ?? new Error('Packet storage transaction aborted'));
  });
}

export async function clearStoredTelemetryPackets(): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).clear();

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () =>
      reject(transaction.error ?? new Error('Packet storage transaction aborted'));
  });
}
