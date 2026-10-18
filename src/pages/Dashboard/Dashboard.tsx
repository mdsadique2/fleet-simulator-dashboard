import './style.css';
import {
  LoadingOutlined,
} from '@ant-design/icons';
import { useDashboard } from './useDashboard';
import { Checkbox } from 'antd';
import { DashboardTable } from './DashboardTable';
const CheckboxGroup = Checkbox.Group;

export function Dashboard() {
  const { pending, database, loading, rows, error, rowsToShow, filterOption, onFilterUpdate } = useDashboard();
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
      <DashboardTable rows={rows} />
    </main>
  );
}
