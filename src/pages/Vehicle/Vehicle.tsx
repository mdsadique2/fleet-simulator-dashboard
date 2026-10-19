import { useParams } from 'react-router-dom';
import { useVehicle } from './useVehicle';
import { Typography, Descriptions} from 'antd';
import {getVehicleDetails, iconComponentMap} from '../../appUtils/getVehicleDetails'
import './style.css'


const { Title } = Typography;

export function Vehicle() {
    // The key name matches the ':userId' defined in the Route
    const { vehicleId } = useParams();
    const { vehicle, logRows, loading, error } = useVehicle(vehicleId);
    const vehicleData = vehicle ? getVehicleDetails(vehicle) : undefined;

    const make = vehicle?.make;
    const Icon =
        typeof make === 'string'
            ? iconComponentMap[make as keyof typeof iconComponentMap]
            : undefined;


  if (loading) return <p>Loading…</p>;
  if (error) return <p>{error.message}</p>;
  if (!vehicle) return <p>Vehicle not found</p>;

  return (
    <main>
    <div className="vehicle">
        <Title className='pageTitle'> 
            <span className="brandIcon">{Icon && <Icon />}</span>
            {vehicleId}-{vehicle.make}
        </Title>
        <div className='container'>
            <Descriptions title="Vehicle Info" items={vehicleData?.vehicleItems ?? []} />
        </div>

        <div className='container'>
            <Descriptions title="Driver Info" items={vehicleData?.driverDetails ?? []} />
        </div>

        <div className='container'>
            <Descriptions title="Dealer Info" items={vehicleData?.dealerDetails ?? []} />
        </div>


        <div className='container logs'>
            <table>
            <thead>
                <tr><th>Logs</th></tr>
            </thead>
            <tbody>
                {logRows.map((r) => (
                <tr key={r.packetId}>
                    <td>{r.eventTime}</td><td>{r.receivedAt}</td>
                    <td>{r.packetId}</td><td style={{width: '500px'}}>{r.signals}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
    </div>
    </main>
  );
}