import {
    ArrowOut,
} from '../../../icons/icons';
import './style.css'
export function DateTime({row}) {
    const eventDate = new Date(row.eventTime);
    const receivedDate = new Date(row.signalReceived);

    return (
        <div className="cell">
            <div className="dateTime">
                <span className="sent"><ArrowOut /></span>
                <span>{eventDate.toLocaleString()}</span>
            </div>
            <div className="dateTime">
                <span className="received rotate180 receivedIcon"><ArrowOut /></span>
                <span>{receivedDate.toLocaleString()}</span>
            </div>
        </div>
    )
}