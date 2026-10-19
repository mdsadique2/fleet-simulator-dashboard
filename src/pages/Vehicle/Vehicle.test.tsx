import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Vehicle } from './Vehicle';

const { mockUseParams, mockUseVehicle } = vi.hoisted(() => ({
  mockUseParams: vi.fn(),
  mockUseVehicle: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useParams: mockUseParams,
}));

vi.mock('./useVehicle', () => ({
  useVehicle: mockUseVehicle,
}));

vi.mock('antd', () => ({
  Typography: {
    Title: ({ children }: { children: React.ReactNode }) => (
      <h1>{children}</h1>
    ),
  },
  Descriptions: ({
    title,
    items,
  }: {
    title: string;
    items: Array<{ key: string; label: string; children: React.ReactNode }>;
  }) => (
    <section aria-label={title}>
      <h2>{title}</h2>
      {items.map((item) => (
        <div key={item.key}>
          <span>{item.label}</span>: <span>{item.children}</span>
        </div>
      ))}
    </section>
  ),
}));

vi.mock('../../appUtils/getVehicleDetails', () => ({
  getVehicleDetails: vi.fn(() => ({
    vehicleItems: [{ key: 'id', label: 'Vehicle id', children: 'vehicle-1' }],
    driverDetails: [{ key: 'driver', label: 'Driver name', children: 'Ada' }],
    dealerDetails: [{ key: 'dealer', label: 'Dealer name', children: 'Fleet Auto' }],
  })),
  iconComponentMap: {
    Tesla: () => <span data-testid="vehicle-make-icon" />,
  },
}));

const vehicle = {
  vehicle_id: 'vehicle-1',
  make: 'Tesla',
};

const logRows = [
  {
    packetId: 'packet-1',
    eventTime: '2026-10-19T10:00:00.000Z',
    receivedAt: '2026-10-19T10:00:01.000Z',
    signals: 'soc=75, speed=40',
  },
];

function setVehicleState(
  state: {
    vehicle: typeof vehicle | null;
    logRows: typeof logRows;
    loading: boolean;
    error: Error | null;
  }
) {
  mockUseParams.mockReturnValue({ vehicleId: 'vehicle-1' });
  mockUseVehicle.mockReturnValue(state);
}

describe('Vehicle', () => {
  it('shows a loading state', () => {
    setVehicleState({
      vehicle: null,
      logRows: [],
      loading: true,
      error: null,
    });

    render(<Vehicle />);

    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows an error when vehicle details fail to load', () => {
    setVehicleState({
      vehicle: null,
      logRows: [],
      loading: false,
      error: new Error('Unable to load vehicle'),
    });

    render(<Vehicle />);

    expect(screen.getByText('Unable to load vehicle')).toBeInTheDocument();
  });

  it('shows a not-found state when there is no vehicle', () => {
    setVehicleState({
      vehicle: null,
      logRows: [],
      loading: false,
      error: null,
    });

    render(<Vehicle />);

    expect(screen.getByText('Vehicle not found')).toBeInTheDocument();
  });

  it('renders vehicle information, inner components, icon, and telemetry logs', () => {
    setVehicleState({
      vehicle,
      logRows,
      loading: false,
      error: null,
    });

    render(<Vehicle />);

    expect(
      screen.getByRole('heading', { name: 'vehicle-1-Tesla' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('vehicle-make-icon')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Vehicle Info' })).toHaveTextContent(
      'Vehicle id: vehicle-1'
    );
    expect(screen.getByRole('region', { name: 'Driver Info' })).toHaveTextContent(
      'Driver name: Ada'
    );
    expect(screen.getByRole('region', { name: 'Dealer Info' })).toHaveTextContent(
      'Dealer name: Fleet Auto'
    );

    expect(screen.getByText('packet-1')).toBeInTheDocument();
    expect(screen.getByText('soc=75, speed=40')).toBeInTheDocument();
  });

  it('renders the vehicle without an icon for an unsupported make', () => {
    setVehicleState({
      vehicle: { ...vehicle, make: 'Unknown make' },
      logRows: [],
      loading: false,
      error: null,
    });

    render(<Vehicle />);

    expect(
      screen.getByRole('heading', { name: 'vehicle-1-Unknown make' })
    ).toBeInTheDocument();
    expect(screen.queryByTestId('vehicle-make-icon')).not.toBeInTheDocument();
  });
});
