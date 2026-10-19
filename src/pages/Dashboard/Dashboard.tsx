import './style.css';
import { useDashboard } from './useDashboard';
import { Checkbox } from 'antd';
import { DashboardTable } from './DashboardTable/DashboardTable';
const CheckboxGroup = Checkbox.Group;

export function Dashboard() {
  const { pending, loading, rows, error, rowsToShow, filterOption, onFilterUpdate } = useDashboard();
  if (error) {
    return (
      <main>
        <h1>Fleet Console</h1>
        <p role="alert">{error}</p>
      </main>
    );
  }

  return (
    <main>
      <div className='filters'>
        <CheckboxGroup options={filterOption} value={rowsToShow} onChange={onFilterUpdate} />
      </div>
      <DashboardTable rows={rows} loading={pending || loading}/>
    </main>
  );
}
