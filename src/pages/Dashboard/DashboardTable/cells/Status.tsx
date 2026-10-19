import { CheckCircleFilled, ExclamationCircleFilled, WarningFilled } from '@ant-design/icons';
import { CRITICAL, MODERATE } from '../../../../appUtils/consts';

export function Status({status}: {status: string}) {
    let Icon = CheckCircleFilled;
    let statusClass = 'iconGreen';
    if(status === CRITICAL) {
        Icon = WarningFilled;
        statusClass = 'iconRed';
    } else if(status === MODERATE) {
        Icon = ExclamationCircleFilled;
        statusClass = 'iconOrange';
    }
    return ( <div className={`statusCell ${statusClass}`}><Icon /></div>)
}