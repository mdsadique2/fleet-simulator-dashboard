import { Progress } from 'antd';
import { Range as RangeIcon} from '../../../icons/icons';

export function Range({totalRange = 1, rangeLeft = 0}) {
    const percent = Math.abs(((rangeLeft / totalRange) * 100)).toFixed(0);
    let stroke= "#306317";
    let statusClass = 'iconGreen';
    

    if(percent < 30) {
        stroke = "#a61d24";
        status = "exception";
        statusClass = 'iconRed';
    } else if(percent > 30 && percent < 60) {
        status = "normal";
        stroke = "#1769dd";
        statusClass = 'iconBlue';
    } else {
        status = "success";
        stroke = "#306317";
        statusClass = 'iconGreen';
    }
   
    return (
        <div className={`rangeRow`}>
            <div className={`iconRow ${statusClass}`}>
                <div style={{width: '250px', marginLeft: '2px'}}>
                    <Progress
                        percent={percent}
                        percentPosition={{ align: 'end', type: 'outer' }}
                        strokeColor={stroke}
                        size="small"
                    />
                </div>
            </div>
            <div className={`${statusClass}`}>{rangeLeft} of {totalRange} km</div>
        </div>
    )
}