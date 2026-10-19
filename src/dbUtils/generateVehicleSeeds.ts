import { generateDrivers } from './generateDrivers';
import { generateVehicleDetails } from './generateVehicleDetails';

// Helper to generate 500 realistic EV mock records
export function generateVehicleSeeds(): string {
  const rows: string[] = [];
  const drivers = generateDrivers(500);

  for (let i = 1; i <= 500; i++) {
    const {
      sNo,
      vehicleId,
      type,
      typeMakes,
      make,
      color,
      year,
      dealer,
      vin,
      chassisNo,
      regNo,
      nominalCapacity,
      healthPercentage,
      currentMaxCapacity,
      odometerKm,
      maxChargeKw,
    } = generateVehicleDetails(i);

    const currentDriver = drivers[i];
    const driverName = currentDriver?.name;
    const drivercontact = currentDriver?.phone;

    rows.push(`(
      '${vehicleId}',
      '${type}',
      '${make}',
      '${color}',
      ${year},
      '${vin}',
      '${chassisNo}',
      '${regNo}',
      ${nominalCapacity},
      ${currentMaxCapacity},
      ${odometerKm},
      ${maxChargeKw},
      '${dealer?.name}',
      '${dealer?.phone}',
      '${driverName}',
      '${drivercontact}',
      '${sNo}'
    )`);
  }
  return rows.join(',\n');
}
