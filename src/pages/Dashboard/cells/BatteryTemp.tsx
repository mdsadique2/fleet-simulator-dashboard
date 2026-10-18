import {  ThermometerAlert,
  Thermometer,} from '../../../icons/icons';
import {getTempLevel, type TempLevel} from '../../../appUtils/utils';

export function BatteryTemp({temp}) {
    const status: TempLevel = getTempLevel(temp)
    let Icon = Thermometer;
    if(status === 'normal') {
        Icon = Thermometer;
    } else if(status === 'critical') {
        Icon = ThermometerAlert;
    }

    return (
        <div className="iconRow">
            <Icon /> {temp}°C
        </div>
    )
}