import {  Truck, Van, Car,} from '../../../../icons/icons';
import { Link } from 'react-router-dom';
import './style.css'

export function Title({vehicleData}) {
    const {vehicle_id, make, type} = vehicleData
    let Icon = Truck;

    if(type === 'car') {
        Icon = Car;
    } else if(type === 'van') {
        Icon = Van;
    }

    return (
        <div>
            <Link to={`/vehicle/${vehicle_id}`} className='title'>
                <div className='icon'><Icon /></div>
                <div className='text'>{make}</div>
                <div className='text'>{vehicle_id}</div>
            </Link>
        </div>
    )
}