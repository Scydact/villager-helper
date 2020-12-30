import React from 'react';
import { ItemIcon } from './ItemIcon';

export function RecipeThumb(props) {
    /**
    uuid = createId(); // used as the key for React lists

    extraData = {
        rewardExp: false, // if this trade rewards exp to the player
        maxUses: CONSTANTS.MAX_VALUE.INT,
        uses: 0,

        xp: 0, //xp that the villager gets
        priceMultiplier: 0, //multiplier of 'demand'
        specialPrice: 0, //special modifier
        demand: 0, // maybe ignore all these values if 0.
    }

    trades = {
        buy: new Item(),
        buyB: new Item(0),
        sell: new Item(),
    }
     */
    return (
        <li onClick={() => props.onClick(props.data)} className={`item-thumb ${props.className}`}>
            <ItemIcon itemId={props.data.trades.buy.id} itemCount={props.data.trades.buy.count} />
            {props.data.trades.buyB.count ? (<span className="item-thumb-sign mc-font">+</span>) : null}
            {props.data.trades.buyB.count ? (<ItemIcon itemId={props.data.trades.buyB.id} itemCount={props.data.trades.buyB.count} />) : null}
            <span className="item-thumb-sign mc-font">=</span><ItemIcon itemId={props.data.trades.sell.id} itemCount={props.data.trades.sell.count} />
            {/* <span>R#{props.data.uuid}</span> */}
        </li>
    );
}