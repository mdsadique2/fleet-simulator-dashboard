import {Location as LocationIcon} from '../../../../icons/icons';

export function Location({long, lat}:{
    lat: string,
    long: string
}) {
    return (
        <div className="iconRow">
            <span><LocationIcon /></span>
            <span>{long}, {lat}</span>
        </div>
    )
}