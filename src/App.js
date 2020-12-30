import React, { useState } from 'react';
import logo, { ReactComponent } from './logo.svg';
import './App.css';
import * as vo from './VillagerObject';
import { CONSTANTS, findItemIcon, findItemInfo, toTitleCase } from './Utils';
import ReactTooltip from 'react-tooltip';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.villager = new vo.Villager();
        // this.villager.addRecipe(new vo.Recipe());
        this.state = {
            entity: this.villager.entity,
            offers: this.villager.offers,
            selectedRecipe: null,
        }
        window.app = this;
    }

    handleChangeVillager = (event) => {
        let key = event.target.name;
        let value = event.target.value;
        if (event.target.type === 'number')
            value = parseInt(value);
        this.setState({ entity: { ...this.state['entity'], [key]: value } });
        this.villager.entity = this.state.entity;

    }

    refreshRecipe(newSelect) {
        this.setState({ selectedRecipe: newSelect, offers: [...this.villager.offers] });
    }

    offersFunctionCollection = {
        addRecipe: () => {
            let i = (this.state.selectedRecipe) ? this.state.offers.indexOf(this.state.selectedRecipe) + 1 : undefined;
            let newSelect = this.villager.addRecipe(new vo.Recipe(), i);
            this.refreshRecipe(newSelect);
        },
        cloneRecipe: () => {
            let sr = this.state.selectedRecipe;
            if (sr == null) return;
            let i = this.state.offers.indexOf(this.state.selectedRecipe) + 1;
            let newSelect = this.villager.addRecipe(sr.clone(), i);
            this.refreshRecipe(newSelect);
        },
        setSelectedRecipe: (recipe) => {
            this.setState({ selectedRecipe: recipe });
        },
        moveRecipe: (recipe, direction) => {
            let i = this.villager.offers.indexOf(recipe);
            this.villager.moveRecipe(recipe, i + direction);
            this.setState({ offers: [...this.villager.offers] });
        },
        moveRecipeUp: () => {
            this.offersFunctionCollection.moveRecipe(this.state.selectedRecipe, -1);
        },
        moveRecipeDown: () => {
            this.offersFunctionCollection.moveRecipe(this.state.selectedRecipe, 1);
        },
        removeRecipe: () => {
            let oldIndex = this.villager.offers.indexOf(this.state.selectedRecipe);
            this.villager.removeRecipe(this.state.selectedRecipe);
            let newSelect = this.villager.offers[oldIndex - 1] || this.villager.offers[oldIndex] || null;
            this.refreshRecipe(newSelect);
        },
    }

    recipeFunctionCollection = {
        extraDataChangeHandler: (event) => {
            let key = event.target.name;
            let value = event.target.value;
            console.log(event.target.checked);
            if (event.target.type === 'number')
                value = (event.target.name === 'priceMultiplier') ? parseFloat(value) : parseInt(value);
            if (event.target.type === 'checkbox')
                value = event.target.checked;

            let originalRecipe = this.state['selectedRecipe'];

            let modifiedRecipe = originalRecipe.clone();
            modifiedRecipe.extraData[key] = value;

            this.villager.updateRecipe(originalRecipe, modifiedRecipe);
            this.refreshRecipe(modifiedRecipe);
        },
        itemChangeHandler: (event, propName) => {
            let key = event.target.name;
            let value = event.target.value;
            if (event.target.type === 'number')
                value = parseInt(value);

            let originalRecipe = this.state['selectedRecipe'];

            let modifiedRecipe = originalRecipe.clone();
            modifiedRecipe.trades[propName][key] = value;

            this.villager.updateRecipe(originalRecipe, modifiedRecipe);
            this.refreshRecipe(modifiedRecipe);
        },
        buyChangeHandler: (event) => this.recipeFunctionCollection.itemChangeHandler(event, 'buy'),
        buyBChangeHandler: (event) => this.recipeFunctionCollection.itemChangeHandler(event, 'buyB'),
        sellChangeHandler: (event) => this.recipeFunctionCollection.itemChangeHandler(event, 'sell'),
        
    }

    render() {
        return (
            <div className="app">
                <MenuBar />
                <div className="main">
                    <VillagerInfo
                        data={this.state.entity}
                        onChange={this.handleChangeVillager}
                    />
                    <OffersInfo
                        data={this.state.offers}
                        villager={this.villager}
                        functionCollection={this.offersFunctionCollection}
                        selectedItem={this.state.selectedRecipe}
                    />
                    <RecipeInfo
                        data={this.state.selectedRecipe}
                        functionCollection={this.recipeFunctionCollection}
                    />
                </div>
            </div>
        );
    }
}

export default App;

function MenuBar() {
    return <div className="menu-bar">{'<Something something>'}</div>
}

class VillagerInfo extends React.Component {
    render() {
        let data = this.props.data;
        let onChange = this.props.onChange;
        return (
            <div className="villager card">
                <img
                    className="villager-image"
                    src={vo.VILLAGER.getVillagerImagePath(data.type, data.profession)}
                    alt={`Villager: ${data.type}_${data.profession}`} />

                <div className="villager-form form">

                    <label>Name: </label>
                    <input
                        type="text"
                        value={data.customName}
                        name="customName"
                        onChange={onChange} />

                    <label>Profession: </label>
                    <select
                        type="text"
                        value={data.profession}
                        name="profession"
                        onChange={onChange}>
                        {vo.VILLAGER.professions.map(
                            (x, y) => <option key={y} value={x}>{toTitleCase(x)}</option>
                        )}
                    </select>

                    <label>Biome: </label>
                    <select
                        type="option"
                        value={data.type}
                        name="type"
                        onChange={onChange}>
                        {vo.VILLAGER.biomes.map(
                            (x, y) => <option key={y} value={x}>{toTitleCase(x)}</option>
                        )}
                    </select>

                    <label>Level: </label>
                    <input
                        type="number"
                        value={data.level}
                        name="level"
                        onChange={onChange} />

                    <label>Xp: </label>
                    <input
                        type="number"
                        value={data.xp}
                        name="xp"
                        onChange={onChange} />

                </div>
            </div>
        );
    }
}

function RecipeThumb(props) {
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

class OffersInfo extends React.Component {

    createList = () => {
        return this.props.data.map(
            (x) => {
                let c = (x.uuid === this.props.selectedItem.uuid) ? "active" : "";
                return <RecipeThumb
                    key={x.uuid}
                    data={x}
                    className={c}
                    onClick={this.props.functionCollection.setSelectedRecipe}
                />
            }
        )
    }

    render() {
        return (
            <div className="offers card">
                <h1>Offers</h1>
                <div className="offers-list-wrapper">
                    <div className="offers-btn-wrapper">
                        <button onClick={this.props.functionCollection.addRecipe}>+</button>
                        <button onClick={this.props.functionCollection.cloneRecipe}>C</button>
                        <button onClick={this.props.functionCollection.removeRecipe}>-</button>
                        <button onClick={this.props.functionCollection.moveRecipeUp}>▲</button>
                        <button onClick={this.props.functionCollection.moveRecipeDown}>▼</button>
                    </div>
                    <ul className="offers-list">
                        {this.createList()}
                    </ul>
                </div>
            </div>
        );
    }
}

function RecipeInfo(props) {
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
                    onChange={props.onChange} />
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

function ItemIcon(props) {
    let item_icon = findItemIcon(props.itemId);
    let item_elem = item_icon && props.itemCount != 0 ? <img src={`data:image/png;base64, ${item_icon}`} /> : null;

    let item_count = null;
    if (props.itemCount) {
        if (props.itemCount > 1) item_count = <div className="item-icon-count mc-font">{props.itemCount}</div>
        else if (props.itemCount < 0) item_count = <div className="item-icon-count item-icon-count-negative mc-font">{props.itemCount}</div>
    }

    return (
        <div className="item-icon">{item_elem}{item_count}</div>
    )
}

function ItemInfo(props) {
    return (
        <div className="item">
            <ItemIcon itemId={props.data.id} itemCount={props.data.count} />
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

window.vo = vo;
/**
 * To insert image from data:
 * <img src="data:image/png;base64, DATAHEREFROM.icon"/>
*/