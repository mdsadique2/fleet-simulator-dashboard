import {BatteryAlert, BatteryFull, BatteryHalf, Battery20, Battery40, Battery60, Battery80} from '../../../../icons/icons';
import {getBatteryLevel, type BatteryLevel} from '../../../../appUtils/utils';
import { CRITICAL, FULL } from '../../../../appUtils/consts';
import './style.css'


export function Battery({soc}: {soc: number}) {
    const status: BatteryLevel | null = getBatteryLevel(soc)
    let Icon = BatteryHalf;
    let statusClass = 'iconGreen';

    if(status === FULL) {
        Icon = BatteryFull;
        statusClass = 'iconGreen';
    } else if(status === CRITICAL) {
        Icon = BatteryAlert;
        statusClass = 'iconRed';
    } else if(status === '20') {
        Icon = Battery20;
        statusClass = 'iconRed';
    } else if(status === '40') {
        Icon = Battery40;
        statusClass = 'iconOrange';
    } else if(status === '60') {
        Icon = Battery60;
        statusClass = 'iconGreen';
    } else if(status === '80') {
        Icon = Battery80;
        statusClass = 'iconGreen';
    }

    return (
        <div className={`iconRow ${statusClass}`}>
            <span><Icon /></span>
            <span>{soc}%</span>
        </div>
    )
}