import {Location as LocationIcon} from '../../../../icons/icons';

export function Location({long, lat}) {
    return (
        <div className="iconRow">
            <span><LocationIcon /></span>
            <span>{long}, {lat}</span>
        </div>
    )
}