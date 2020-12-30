import React from 'react';
import ReactTooltip from 'react-tooltip';
import { CONSTANTS } from './Utils';
import { ItemInfo } from './ItemInfo';

export function RecipeInfo(props) {
    if (props.data == null)
        return (
            <div className="recipe card">
                <h1>Trade</h1>
                <p>No trade selected.</p>
            </div>
        )

    return (
        <div className="recipe card">
            <h1>Trade</h1>
            {/* <p>Trade {props.data.uuid} selected.</p> */}

            <div className="item-wrapper card">
                <h2>Buy</h2>
                <ItemInfo
                    data={props.data.trades.buy}
                    onChange={props.functionCollection.buyChangeHandler}
                />
            </div>
            <div className="item-wrapper card">
                <h2>Buy B</h2>
                <ItemInfo
                    data={props.data.trades.buyB}
                    onChange={props.functionCollection.buyBChangeHandler}
                />
            </div>
            <div className="item-wrapper card">
                <h2>Sell</h2>
                <ItemInfo
                    data={props.data.trades.sell}
                    onChange={props.functionCollection.sellChangeHandler}
                />
            </div>

            <div className="form card">
                <h2 className="form-2header">Extra data</h2>
                <label data-tip data-for="tip-maxuses">Max Uses: </label>
                <input
                    type="number"
                    value={props.data.extraData.maxUses}
                    name="maxUses"
                    onChange={props.functionCollection.extraDataChangeHandler} />
                <ReactTooltip id="tip-maxuses">
                    The maximum number of times this trade can be used before it is disabled.<br />
                    Increases by a random amount from 2 to 12 when offers are refreshed.<br />
                    Set to {CONSTANTS.MAX_VALUE.INT.toString()} (or any other large number) to disable.
                </ReactTooltip>

                <label data-tip data-for="tip-rewardexp">Reward player XP: </label>
                <input
                    type="checkbox"
                    checked={props.data.extraData.rewardExp}
                    name="rewardExp"
                    onChange={props.functionCollection.extraDataChangeHandler} />
                <ReactTooltip id="tip-rewardexp">
                    Whether this trade provides XP orb drops.
                </ReactTooltip>

                <label data-tip data-for="tip-xp">Villager XP: </label>
                <input
                    type="number"
                    value={props.data.extraData.xp}
                    name="xp"
                    onChange={props.functionCollection.extraDataChangeHandler} />
                <ReactTooltip id="tip-xp">
                    How much experience the villager gets from this trade.
                </ReactTooltip>

                <label data-tip data-for="tip-pricemultiplier">Price Multiplier: </label>
                <input
                    type="number"
                    value={props.data.extraData.priceMultiplier}
                    name="priceMultiplier"
                    onChange={props.functionCollection.extraDataChangeHandler} />
                <ReactTooltip id="tip-pricemultiplier">
                    The multiplier on the  demand price adjuster;
                    the final adjusted price is added to the first 'cost' item's price.
                </ReactTooltip>

                <label data-tip data-for="tip-specialprice">Special price: </label>
                <input
                    type="number"
                    value={props.data.extraData.specialPrice}
                    name="specialPrice"
                    onChange={props.functionCollection.extraDataChangeHandler} />
                <ReactTooltip id="tip-specialprice">
                    A modifier added to the original price of the first 'cost' item.
                </ReactTooltip>

                <label data-tip data-for="tip-demand">Price Multiplier: </label>
                <input
                    type="number"
                    value={props.data.extraData.demand}
                    name="demand"
                    onChange={props.functionCollection.extraDataChangeHandler} />
                <ReactTooltip id="tip-demand">
                    The price adjuster of the first 'cost' item based on demand. <br />
                    Updated when a villager resupply.
                </ReactTooltip>
            </div>
        </div>
    )
}