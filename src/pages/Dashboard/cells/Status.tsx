import { CheckCircleFilled, ExclamationCircleFilled, WarningFilled } from '@ant-design/icons';
export function Status({status}) {
    let Icon = CheckCircleFilled;
    let statusClass = 'iconGreen';
    if(status === 'critical') {
        Icon = WarningFilled;
        statusClass = 'iconRed';
    } else if(status === 'moderate') {
        Icon = ExclamationCircleFilled;
        statusClass = 'iconOrange';
    }
    return ( <div className={`statusCell ${statusClass}`}><Icon /></div>)
}