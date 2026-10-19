import { Tag } from 'antd';
import { CRITICAL, MODERATE } from '../../../../appUtils/consts';


export function Message({message, row}) {
    let color = 'green'
    if (row.status === MODERATE){
        color = 'orange'
    } else if(row.status === CRITICAL) {
        color = 'red'
    }
    const messages = message.split(";")
    return (<>{
        messages.map((elm,i) => {
            return(
            <Tag color={color} key={row.vehicle_id+i}>
              {elm.toUpperCase()}
            </Tag>
        )})
    }</>)
}