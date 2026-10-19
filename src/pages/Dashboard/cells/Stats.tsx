import {Speed} from './Speed';
import {Battery} from './Battery';
import {BatteryTemp} from './BatteryTemp';
import {Location} from './Location';
import {Range} from './Range';

export function Stats({row}) {
    const {
        battery_temp,
        latitude,
        longitude,
        range_remaining_km,
        soc,
        speed,
        total_range_km
    } = row.payload.signals;

    return (
        <div className='stats'>
            <div>
                <Battery soc={soc} />
                <BatteryTemp temp={battery_temp} />
                <Speed speed={speed} />
            </div>
            <Range totalRange={total_range_km} rangeLeft={range_remaining_km} />
            {/* <Location long={longitude} lat={latitude} /> */}
        </div>
    )
}