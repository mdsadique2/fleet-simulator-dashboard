import { SpeedHigh, SpeedLow} from '../../../icons/icons';
import {getSpeedLevel, type SpeedLevel} from '../../../appUtils/utils';

export function Speed({speed}) {
    const status: SpeedLevel = getSpeedLevel(speed)
    let Icon = SpeedLow;

    if(status === 'high') {
        Icon = SpeedHigh;
    } else if(status === 'normal') {
        Icon = SpeedLow;
    }

    return (
        <div className="iconRow">
            <Icon /> {speed} km/h
        </div>
    )
}