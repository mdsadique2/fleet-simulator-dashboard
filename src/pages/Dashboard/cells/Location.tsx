import {Location as LocationIcon} from '../../../icons/icons';

export function Location({long, lat}) {
    return (
        <div className="iconRow">
            <LocationIcon /> {long}, {lat}
        </div>
    )
}