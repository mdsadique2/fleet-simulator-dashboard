export const createTable = {
  telemetryPackets: `
  CREATE TABLE IF NOT EXISTS telemetry_packets (
    packet_id VARCHAR PRIMARY KEY,
    vehicle_id VARCHAR NOT NULL,
    event_time TIMESTAMP NOT NULL,
    received_at TIMESTAMP NOT NULL,
    payload_json VARCHAR NOT NULL
  )
`,
  vehicles: `
CREATE TABLE IF NOT EXISTS vehicles (
  vehicle_id VARCHAR PRIMARY KEY,
  type VARCHAR NOT NULL,
  make VARCHAR NOT NULL,
  color VARCHAR NOT NULL,
  year INTEGER NOT NULL,
  vin VARCHAR NOT NULL,
  chassis_number VARCHAR NOT NULL,
  registration_number VARCHAR NOT NULL,
  nominal_battery_kwh DECIMAL(6,2) NOT NULL,
  current_max_battery_kwh DECIMAL(6,2) NOT NULL,
  odometer_km INTEGER NOT NULL,
  max_charge_kw INTEGER NOT NULL,
  dealerName VARCHAR NOT NULL,
  dealerPhone VARCHAR NOT NULL,
  driverName VARCHAR NOT NULL,
  driverContact VARCHAR NOT NULL,
  s_no VARCHAR NOT NULL
)
`,
};

export const query = {
  vehiclesCount: `SELECT COUNT(*) as cnt FROM vehicles`,
  insertVehicleValues: `INSERT INTO vehicles VALUES `,
};
