import { Table } from 'antd';
import {columns} from './columnConfigurations'
import '../style.css'

export function DashboardTable({ rows, loading }) {
  return (
    <div>
      <Table columns={columns} dataSource={rows} className="table" pagination={false}
        loading={loading} 
      />
    </div>
  );
}
