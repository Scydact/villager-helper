import React from 'react';
import { findItemIcon } from './Utils';

export function ItemIcon(props) {
    let item_icon = findItemIcon(props.itemId);
    let item_elem = item_icon && props.itemCount !== 0 ? <img src={`data:image/png;base64, ${item_icon}`} alt="item-img"/> : null;

    let item_count = null;
    if (props.itemCount) {
        if (props.itemCount > 1) item_count = <div className="item-icon-count mc-font">{props.itemCount}</div>
        else if (props.itemCount < 0) item_count = <div className="item-icon-count item-icon-count-negative mc-font">{props.itemCount}</div>
    }

    return (
        <div className="item-icon">{item_elem}{item_count}</div>
    )
}