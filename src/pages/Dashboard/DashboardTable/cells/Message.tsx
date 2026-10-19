import { Tag } from 'antd';

export function Message({message, row}) {
    let color = 'green'
    if (row.status === 'moderate'){
        color = 'orange'
    } else if(row.status === 'critical') {
        color = 'red'
    }
    const messages = message.split(";")
    // console.log(message, "-----", message.constructor);
    return (<>{
        messages.map((elm,i) => {
            return(
            <Tag color={color} key={row.vehicle_id+i}>
              {elm.toUpperCase()}
            </Tag>
        )})
    }</>)
}