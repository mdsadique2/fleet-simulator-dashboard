import {BatteryAlert,BatteryFull,BatteryHalf,} from '../../../icons/icons';
import {getBatteryLevel, type BatteryLevel} from '../../../appUtils/utils';

export function Battery({soc}) {
    const status: BatteryLevel = getBatteryLevel(soc)
    let Icon = BatteryHalf;

    if(status === 'full') {
        Icon = BatteryFull;
    } else if(status === 'critical') {
        Icon = BatteryAlert;
    }

    return (
        <div className="iconRow">
            <Icon /> {soc}%
        </div>
    )
}