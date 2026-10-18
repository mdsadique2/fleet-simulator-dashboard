import { Flex, Space, Table, Tag } from 'antd';
import { Stats } from './cells/Stats';
import {DateTime} from './cells/DateTime';
import {Status} from './cells/Status';
import './style.css'

const { Column, ColumnGroup } = Table;

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const columns = [
  {
    title: 'Vehicle ID',
    dataIndex: 'vehicleId',
    key: 'vehicleId',
    // render: (text) => {
    //   return <a> {text}</a>;
    // },
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
    width: 500,
    render: (_text, record) => {
      return <Stats row={record} />;
    },
  },
];

export function DashboardTable({ rows }) {
  return (
    <div>
      <Table columns={columns} dataSource={rows} className="table" pagination={false}/>
    </div>
  );
}
