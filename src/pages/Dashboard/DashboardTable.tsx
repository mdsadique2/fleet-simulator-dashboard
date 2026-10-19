import { Table } from 'antd';
import { Stats } from './cells/Stats';
import {DateTime} from './cells/DateTime';
import {Status} from './cells/Status';
import {Title} from './cells/Title';

import './style.css'
import { Link } from 'react-router-dom';

const columns = [
  {
    title: 'Vehicle ID',
    dataIndex: 'vehicleId',
    key: 'vehicleId',
    render: (id, row) => {
      return  (<Title vehicleData={row.vehicleDetails}/>);
    },
  },
  {
    title: 'Events Time',
    dataIndex: 'eventTime',
    key: 'eventTime',
    width: 250,
    render: (_date, row) => <DateTime row={row} />,
  },
  {
    title: 'Status',
    key: 'status',
    dataIndex: 'status',
    width: 150,
    render: (status) => <Status status={status} />,
  },
  {
    title: 'Message',
    key: 'message',
    dataIndex: 'message',
    width: 250,
  },
  {
    title: 'Stats',
    dataIndex: 'payload',
    key: 'payload',
    width: 350,
    render: (_text, record) => {
      return <Stats row={record} />;
    },
  },
];

export function DashboardTable({ rows, loading }) {
  return (
    <div>
      <Table columns={columns} dataSource={rows} className="table" pagination={false}
        loading={loading} 
      />
    </div>
  );
}
