import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardTable } from './DashboardTable';

type TableColumn = {
  title: string;
  key: string;
  dataIndex?: string;
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
};

vi.mock('antd', () => ({
  Table: ({
    columns,
    dataSource,
    loading,
  }: {
    columns: TableColumn[];
    dataSource: Record<string, unknown>[];
    loading: boolean;
  }) => (
    <div
      aria-busy={loading}
      className={loading ? 'ant-spin-spinning' : undefined}
    >
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataSource.length ? (
            dataSource.map((row) => (
              <tr key={String(row.vehicleId)}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render
                      ? column.render(
                          column.dataIndex
                            ? row[column.dataIndex]
                            : undefined,
                          row
                        )
                      : column.dataIndex
                        ? String(row[column.dataIndex] ?? '')
                        : null}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length}>No data</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  ),
}));

vi.mock('./cells/Title', () => ({
  Title: ({ vehicleData }: { vehicleData: { make: string; vehicle_id: string } }) => (
    <div data-testid="vehicle-title">
      {vehicleData.make} {vehicleData.vehicle_id}
    </div>
  ),
}));

vi.mock('./cells/DateTime', () => ({
  DateTime: ({ row }: { row: { eventTime: string } }) => (
    <div data-testid="vehicle-datetime">{row.eventTime}</div>
  ),
}));

vi.mock('./cells/Status', () => ({
  Status: ({ status }: { status: string }) => (
    <div data-testid="vehicle-status">{status}</div>
  ),
}));

vi.mock('./cells/Message', () => ({
  Message: ({ message }: { message: string }) => (
    <div data-testid="vehicle-message">{message}</div>
  ),
}));

vi.mock('./cells/Stats', () => ({
  Stats: ({ row }: { row: { vehicleId: string } }) => (
    <div data-testid="vehicle-stats">{row.vehicleId}</div>
  ),
}));

const rows = [
  {
    vehicleId: 'vehicle-1',
    eventTime: '2026-10-19T09:30:00.000Z',
    status: 'critical',
    message: 'Battery overheating',
    payload: { signals: { soc: 8 } },
    vehicleDetails: { make: 'Tesla', vehicle_id: 'vehicle-1' },
  },
  {
    vehicleId: 'vehicle-2',
    eventTime: '2026-10-19T09:31:00.000Z',
    status: 'normal',
    message: 'No battery alert',
    payload: { signals: { soc: 80 } },
    vehicleDetails: { make: 'Volvo', vehicle_id: 'vehicle-2' },
  },
];

describe('DashboardTable', () => {
  it('renders the expected columns and delegates row rendering to cell components', () => {
    render(<DashboardTable rows={rows} loading={false} />);

    for (const column of ['Vehicle ID', 'Events Time', 'Status', 'Message', 'Stats']) {
      expect(
        screen.getByRole('columnheader', { name: column })
      ).toBeInTheDocument();
    }

    expect(screen.getByText('Tesla vehicle-1')).toBeInTheDocument();
    expect(screen.getByText('Volvo vehicle-2')).toBeInTheDocument();
    expect(
      screen.getByText('2026-10-19T09:30:00.000Z')
    ).toBeInTheDocument();
    expect(screen.getByText('critical')).toBeInTheDocument();
    expect(screen.getByText('Battery overheating')).toBeInTheDocument();
    expect(screen.getAllByTestId('vehicle-stats')).toHaveLength(2);
  });

  it('shows an empty table when there are no rows', () => {
    render(<DashboardTable rows={[]} loading={false} />);

    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('shows the loading indicator while data is loading', () => {
    const { container } = render(<DashboardTable rows={[]} loading />);

    expect(container.querySelector('.ant-spin-spinning')).toBeInTheDocument();
  });
});
