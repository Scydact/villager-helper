import React from 'react';
import ReactTooltip from 'react-tooltip';
import { createId } from './Utils';
import { Item } from './VillagerObject';

export function ItemIcon(props) {
    let item = (props.item) ? props.item : new Item(props.itemCount, props.itemId, props.itemTag);
    if (item.count === 0) return <div className="item-icon"></div>

    let item_icon = item.getIcon();
    let item_elem = item_icon ? <img src={`data:image/png;base64, ${item_icon}`} alt="item-img" /> : null;

    let item_count = null;
    if (item.count) {
        if (item.count > 1) item_count = <div className="item-icon-count mc-font">{item.count}</div>
        else if (item.count < 0) item_count = <div className="item-icon-count mc-font item-icon-count-negative">{item.count}</div>
    }

    let tooltip_id = "tip_" + createId(); //+ item.uuid;
    let lore = item.getLore();
    let item_lore = (lore) ? <div className="item-lore"><ul>{lore.map(x => <li key={createId()}>{x}</li>)}</ul></div> : null

    return (
        <div data-tip data-for={tooltip_id} className="item-icon">
            {item_elem}
            {item_count}
            <ReactTooltip id={tooltip_id}>
                <h4>{item.getDisplayName()}</h4>
                <pre>{item.getIdWithNamespace()}</pre>
                {item_lore}
            </ReactTooltip>
        </div>
    )
}