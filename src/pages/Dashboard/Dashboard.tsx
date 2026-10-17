import './style.css';
import { useDashboard } from './useDashboard';
import { Button } from 'antd';

import { DashboardTable } from './DashboardTable';

export function Dashboard() {
  const { database, loading, rows, pending, simulator, stop, error } =
    useDashboard();

  if (error) {
    return (
      <main>
        <h1>Fleet Console</h1>
        <p role="alert">{error}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <Button onClick={() => {}}>Strart</Button>
      <button
        onClick={() => {
          stop();
        }}
      >
        stop
      </button>

      <h1>Fleet Console</h1>
      <p>
        Database: {database ? 'Connected' : 'Initializing'}
        {' · '}
        Simulator: {loading ? 'Starting...' : 'Running'}
      </p>

      <DashboardTable rows={rows} />

      <table>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Event time</th>
            <th>Received at</th>
            <th>Status</th>
            <th>Message</th>
            <th>Reason</th>
            <th>Signals</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const payload = row.payload;
            return (
              <tr key={row.vehicleId}>
                <td>{row.vehicleId}</td>
                <td>{row.eventTime}</td>
                <td>{row.signalReceived}</td>
                <td>{row.status}</td>
                <td>{row.message}</td>
                <td>{row.signalReceived}</td>

                <td>
                  {Object.entries(payload.signals)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
