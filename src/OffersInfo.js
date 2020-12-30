import React from 'react';
import { RecipeThumb } from './RecipeThumb';

export class OffersInfo extends React.Component {

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