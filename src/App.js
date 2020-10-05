import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  // let oldReturn = (
  //   <div className="App">
  //     <header className="App-header">
  //       <img src={logo} className="App-logo" alt="logo" />
  //       <p>
  //         Edit <code>src/App.js</code> and save to reload.
  //       </p>
  //       <a
  //         className="App-link"
  //         href="https://reactjs.org"
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         Learn React
  //       </a>
  //     </header>
  //   </div>
  // );
  return (
    <div className="app">
      <MenuBar/>
      <VillagerInfo/>
      <OffersInfo/>
      <RecipeInfo/>
    </div>
  );
}

export default App;

function MenuBar() {
  return <div className="menu-bar">{'<Something something>'}</div>
}

function VillagerInfo() {
  return <div className="villager">Villager information</div>
}

function OffersInfo() {
  return <div className="offers">Offers information</div>
}

function RecipeInfo() {
  return <div className="recipe">Recipe information</div>
}

let villagerObject = {
  entity: {
    customName: '',
    level: 3,
    xp: 250,
    isXpRelatedToLevel: true,
    profession: 'minecraft:something',
    type: 'minecraft:something_else',
  },
  offers: [
    {
      // a trade option
      rewardExp: true,
      maxUses: 39029302,
      uses: 0,
      buy: {Count: 64, id:"diamond", tag:{}},
      buyB: null,
      sell: {Count: 1, id:"dirt", tag:{}},

      xp: 892, //xp that the villager gets
      priceMultiplier: 0, //multiplier of 'demand'
      specialPrice: 0, //special modifier
      demand: 0, // maybe ignore all these values if 0.
    }
  ]
}