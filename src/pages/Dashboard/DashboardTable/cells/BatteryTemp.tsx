import {  ThermometerAlert, Thermometer} from '../../../../icons/icons';
import {getTempLevel, type TempLevel} from '../../../../appUtils/utils';
import { CRITICAL } from '../../../../appUtils/consts';

export function BatteryTemp({temp}: {temp: number}) {
    const status: TempLevel|null = getTempLevel(temp)
    let Icon = Thermometer;
    let statusClass = 'iconGreen';
    if(status === 'normal') {
        Icon = Thermometer;
    } else if(status === CRITICAL) {
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