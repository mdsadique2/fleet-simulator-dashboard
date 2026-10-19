import { Progress } from 'antd';

export function Range({totalRange = 1, rangeLeft = 0}) {
    const percent = Math.round(Math.abs((rangeLeft / totalRange) * 100));
    let stroke= "#306317";
    let statusClass = 'iconGreen';
    let status: 'exception' | 'normal' | 'success' = 'success';
    

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
                    <Progress
                        percent={percent}
                        percentPosition={{ align: 'end', type: 'outer' }}
                        strokeColor={stroke}
                        status={status}
                        size="small"
                        type="circle"
                    />
            </div>
            <div className={`${statusClass}`}>Range: {rangeLeft} of {totalRange} km</div>
        </div>
    )
}