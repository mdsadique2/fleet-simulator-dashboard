import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Title } from '../Title';

vi.mock('../../../../../icons/icons', () => import('./mockIcons'));

const vehicle = {
  vehicle_id: 'vehicle-1',
  make: 'Tesla',
  type: 'car',
  color: 'blue',
  year: 2025,
  vin: 'vin-1',
  chassis_number: 'chassis-1',
  registration_number: 'registration-1',
  nominal_battery_kwh: 75,
  current_max_battery_kwh: 70,
  odometer_km: 1000,
  max_charge_kw: 150,
  dealerName: 'Dealer',
  dealerPhone: '123',
  driverName: 'Driver',
  driverContact: '456',
  s_no: '1',
};

describe('Title', () => {
  it('renders the vehicle make and ID in a link to its details page', () => {
    render(
      <MemoryRouter>
        <Title vehicleData={vehicle} />
      </MemoryRouter>
    );

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/vehicle/vehicle-1'
    );
    expect(screen.getByText('Tesla')).toBeInTheDocument();
    expect(screen.getByText('vehicle-1')).toBeInTheDocument();
    expect(screen.getByTestId('icon-car')).toBeInTheDocument();
  });

  it('renders the truck icon for a truck vehicle', () => {
    render(
      <MemoryRouter>
        <Title vehicleData={{ ...vehicle, type: 'truck' }} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('icon-truck')).toBeInTheDocument();
  });
});
