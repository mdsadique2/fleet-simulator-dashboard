import { useParams } from 'react-router-dom';
import { useVehicle } from './useVehicle';
import { Typography, Descriptions} from 'antd';
import {getVehicleDetails, iconComponentMap} from '../../appUtils/getVehicleDetails'
import {getVehicleStatus} from '../../appUtils/getVehicleStatus'
import './style.css'

const { Title } = Typography;

const getSignalObject = (str: string) => {
    const obj = Object.fromEntries(
    str.split(', ').map(item => {
        const [key, value] = item.split('=');
        return [key, Number(value)]; // Converts the numbers from strings to actual numbers
    }));
    return obj;
}

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
        <main className="vehicle">
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
                <Title level={4}>Logs</Title>
                <table>
                    <tbody>
                        {logRows.map((r) => {
                            const obj = getSignalObject(r.signals)
                            const {battery_temp, soc} = obj;
                            const statusObj = getVehicleStatus(battery_temp, soc)
                            return(
                                <tr className={`${statusObj.status === 'critical' ? 'critical': ''}`} key={r.packetId}>
                                    <td>{r.eventTime}</td><td>{r.receivedAt}</td>
                                    <td>{r.packetId}</td><td style={{width: '500px'}}>{r.signals}</td>
                                </tr>
                        )})}
                    </tbody>
                </table>
            </div>
        </main>
    );
}