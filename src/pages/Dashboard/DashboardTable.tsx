import { Flex, Space, Table, Tag } from 'antd';
import { Stats } from './cells/Stats';

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
    render: (text, record) => {
      console.log('===========llll', record);
      return <a> {text}</a>;
    },
  },
  {
    title: 'Event Time',
    dataIndex: 'eventTime',
    key: 'eventTime',
  },
  {
    title: 'Recieved At',
    dataIndex: 'signalReceived',
    key: 'signalReceived',
  },
  {
    title: 'Status',
    key: 'status',
    dataIndex: 'status',
  },
  {
    title: 'Message',
    key: 'message',
    dataIndex: 'message',
  },
  {
    title: 'Stats',
    dataIndex: 'payload',
    key: 'payload',
    render: (_text, record) => {
      return <Stats row={record} />;
    },
  },
];

export function DashboardTable({ rows }) {
  return (
    <div>
      <Table columns={columns} dataSource={rows} />
    </div>
  );
}
