import { Progress } from 'antd';

export function Range({totalRange, rangeLeft}) {
    const status = Math.abs(((rangeLeft / totalRange) * 100)).toFixed(1);

    return (
        <div className="iconRow">
            <Progress type="circle" percent={Number(status)} />
        </div>
    )
}