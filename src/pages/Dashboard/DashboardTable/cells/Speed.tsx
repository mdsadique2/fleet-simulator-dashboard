import { SpeedHigh, SpeedLow} from '../../../../icons/icons';
import {getSpeedLevel, type SpeedLevel} from '../../../../appUtils/utils';

export function Speed({speed}) {
    const status: SpeedLevel = getSpeedLevel(speed)
    let Icon = SpeedLow;
    let statusClass = 'iconGreen';

    if(status === 'high') {
        Icon = SpeedHigh;
        statusClass = 'iconRed';
    } else if(status === 'normal') {
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