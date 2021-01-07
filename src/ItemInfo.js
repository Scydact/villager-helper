import React from 'react';
import { ItemIcon } from './ItemIcon';

export function ItemInfo(props) {
    return (
        <div className="item">
            <ItemIcon item={props.data}/>
            <div>
                <label>Id: </label>
                <input
                    type="text"
                    value={props.data.id}
                    name="id"
                    placeholder="Item ID (no spaces, lowercase)"
                    onChange={props.onChange} />

                <label>Count: </label>
                <input
                    type="number"
                    value={props.data.count}
                    name="count"
                    placeholder="Count"
                    onChange={props.onChange} />

                <label>Tag: </label>
                <input
                    type="text"
                    value={props.data.tag}
                    name="tag"
                    placeholder="{itemtag: false}"
                    onChange={props.onChange} />
            </div>

        </div>
    )
}