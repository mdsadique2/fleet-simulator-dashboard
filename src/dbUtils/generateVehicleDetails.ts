import {
  vehicleTypes as types,
  carMakes as makes,
  colors,
  dealers,
} from './dbConst';

function getDealer(brand) {
  const matches = dealers.filter(
    (d) => d.brand.toLowerCase() === brand.toLowerCase()
  );

  if (matches.length === 0) return null;
  return matches[Math.floor(Math.random() * matches.length)];
}

export function generateVehicleDetails(i) {
  const sNo = i;
  const vehicleId = `VEH-${String(i).padStart(3, '0')}`;
  const type = types[Math.floor(Math.random() * types.length)];
  const typeMakes = makes[type];
  const make = typeMakes[Math.floor(Math.random() * typeMakes.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const year = Math.floor(Math.random() * 5) + 2021; // 2021 to 2025
  const dealer = getDealer(make);

  // Generate realistic VIN and Chassis numbers
  const vin = `5YJ3E1EB${i.toString(16).toUpperCase().padStart(8, '0')}`;
  const chassisNo = `CHS-${year}-${String(i).padStart(5, '0')}`;
  const regNo = `EV-${Math.floor(100 + Math.random() * 900)}-${String(
    i
  ).padStart(2, '0')}`;

  // Battery Specs
  let nominalCapacity = 75; // kWh
  if (type === 'truck') nominalCapacity = 135;
  if (type === 'van') nominalCapacity = 105;
  if (type === 'car' && make === 'Tesla') nominalCapacity = 82;

  // State of Health (SOH) worn out percentage (e.g., operating at 85% to 99% max capacity)
  const healthPercentage = parseFloat((0.85 + Math.random() * 0.14).toFixed(2));
  const currentMaxCapacity = parseFloat(
    (nominalCapacity * healthPercentage).toFixed(1)
  );

  // Additional useful stats
  const odometerKm = Math.floor(5000 + Math.random() * 85000);
  const maxChargeKw = type === 'truck' ? 250 : 170;

  return {
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
  };
}
