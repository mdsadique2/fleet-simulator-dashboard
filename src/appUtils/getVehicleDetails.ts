import {
    Hyundai,
    Mitsubishi,
    Nissan,
    Tesla,
    Volkswagen,
    Volvo,
    Saab
} from '../icons/icons'

export const iconComponentMap = {
    Hyundai,
    Mitsubishi,
    Nissan,
    Tesla,
    Volkswagen,
    Volvo,
    Saab
}

export function getVehicleDetails(vehicleObj) {
    if(vehicleObj === null) {
        return {}
    }
    const {vehicle_id, color, make, type, year, 
        vin, chassis_number, registration_number, 
        nominal_battery_kwh, current_max_battery_kwh, 
        odometer_km, max_charge_kw, dealerName, dealerPhone, 
        driverName, driverContact, s_no} = vehicleObj || {};

    const vehicleItems = [
        { key: '17', label: 'S. no', children: s_no },
        { key: '1', label: 'Vehicle id', children: vehicle_id },
        { key: '2', label: 'Color', children: color },
        { key: '3', label: 'Make', children: make },
        { key: '4', label: 'Type', children: type },
        { key: '5', label: 'Year', children: year },
        { key: '6', label: 'VIN', children: vin },
        { key: '7', label: 'Chassis number', children: chassis_number },
        { key: '8', label: 'Registration number', children: registration_number },
        { key: '9', label: 'Nominal battery (kWh)', children: nominal_battery_kwh },
        { key: '10', label: 'Current max battery (kWh)', children: current_max_battery_kwh },
        { key: '11', label: 'Odometer (km)', children: odometer_km },
        { key: '12', label: 'Max charge (kW)', children: max_charge_kw },
    ]

    const driverDetails = [
        { key: '15', label: 'Driver name', children: driverName },
        { key: '16', label: 'Driver contact', children: driverContact },
    ]

    const dealerDetails: DescriptionsProps['items'] = [
        { key: '13', label: 'Dealer name', children: dealerName },
        { key: '14', label: 'Dealer phone', children: dealerPhone },
    ];

    return {
        vehicleItems,
        driverDetails,
        dealerDetails,
    }
}