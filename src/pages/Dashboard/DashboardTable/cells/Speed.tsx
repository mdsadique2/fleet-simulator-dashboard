import { SpeedHigh, SpeedLow} from '../../../../icons/icons';
import {getSpeedLevel, type SpeedLevel} from '../../../../appUtils/utils';
import { HIGH, NORMAL } from '../../../../appUtils/consts';
export function Speed({speed}: {speed: number}) {
    const status: SpeedLevel|null = getSpeedLevel(speed)
    let Icon = SpeedLow;
    let statusClass = 'iconGreen';

    if(status === HIGH) {
        Icon = SpeedHigh;
        statusClass = 'iconRed';
    } else if(status === NORMAL) {
        Icon = SpeedLow;
        statusClass = 'iconOrange';
    }

    return (
        <div className={`iconRow ${statusClass}`}>
            <span><Icon /></span>
            <span>{speed} km/h</span>
        </div>
    )
}