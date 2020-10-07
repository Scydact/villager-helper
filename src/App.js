import React, { useState } from 'react';
import logo, { ReactComponent } from './logo.svg';
import './App.css';
import * as vo from './VillagerObject';
import * as mi from 'minecraft-items';
import { toTitleCase } from './Utils';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.villager = new vo.Villager();
        this.state = {
            entity: this.villager.entity,
            offers: this.villager.offers,
        }
        window.app = this;
    }

    handleChangeVillager = (event) => {
        let key = event.target.name;
        let value = event.target.value;
        if (event.target.type == 'number')
            value = parseInt(value);
        this.setState({ entity: { ...this.state['entity'], [key]: value}});
        this.villager.entity = this.state.entity;
    }

    render() {
        return (
            <div className="app">
                <MenuBar />
                <VillagerInfo data={this.state.entity} onChange={this.handleChangeVillager} />
                <OffersInfo />
                <RecipeInfo />
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
            <div className="villager">
                <img
                    className="villager-image"
                    src={vo.VILLAGER.getVillagerImagePath(data.type, data.profession)} />

                <div className="villager-form">

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

function OffersInfo() {
    return <div className="offers">Offers information</div>
}

function RecipeInfo() {
    return <div className="recipe">Recipe information</div>
}

window.vo = vo;
window.mi = mi;
/**
 * To insert image from data:
 * <img src="data:image/png;base64, DATAHEREFROM.icon"/>
*/