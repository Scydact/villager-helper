import React from 'react';
//import logo, { ReactComponent } from './logo.svg';
import './App.css';
import './mc-font-colors.css';
import { MenuBar } from './MenuBar';
import { VillagerInfo } from './VillagerInfo';
import { OffersInfo } from './OffersInfo';
import { RecipeInfo } from './RecipeInfo';
import * as vo from './VillagerObject';
import { test } from './nbt_tests';

// TODO Allow import/export from/to sNBT

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

window.vo = vo;
test();
/**
 * To insert image from data:
 * <img src="data:image/png;base64, DATAHEREFROM.icon"/>
*/