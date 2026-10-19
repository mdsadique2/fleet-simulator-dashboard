import {  ThermometerAlert,
  Thermometer,} from '../../../../icons/icons';
import {getTempLevel, type TempLevel} from '../../../../appUtils/utils';

export function BatteryTemp({temp}) {
    const status: TempLevel = getTempLevel(temp)
    let Icon = Thermometer;
    let statusClass = 'iconGreen';
    if(status === 'normal') {
        Icon = Thermometer;
    } else if(status === 'critical') {
        Icon = ThermometerAlert;
        statusClass = 'iconRed';
    }

    return (
        <div className={`iconRow ${statusClass}`}>
            <span><Icon /></span>
            <span>{temp}°C</span>
        </div>
    )
}