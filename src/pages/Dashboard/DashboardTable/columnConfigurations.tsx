import { Stats } from './cells/Stats';
import {DateTime} from './cells/DateTime';
import {Status} from './cells/Status';
import {Title} from './cells/Title';
import {Message} from './cells/Message'

export const columns = [
  {
    title: 'Vehicle ID',
    dataIndex: 'vehicleId',
    key: 'vehicleId',
    render: (_id, row) => {
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
    render: (message, row) => <Message message={message} row={row}/>,
    
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