import { CONSTANTS, createId, toTitleCase } from "./Utils";

export const VILLAGER = {
    professions: [
        'armorer',
        'butcher',
        'cartographer',
        'cleric',
        'farmer',
        'fisherman',
        'fletcher',
        'leatherworker',
        'librarian',
        'nitwit',
        'none',
        'mason',
        'shepherd',
        'toolsmith',
        'weaponsmith',
    ],
    biomes: [
        'desert',
        'jungle',
        'plains',
        'savanna',
        'snow',
        'swamp',
        'taiga',
    ],
    getVillagerImagePath: (biome, profession) => {
        let b = (biome === 'snow') ? 'Snowy' : toTitleCase(biome);
        let p = (profession === 'none') ? 'Villager_Base' : toTitleCase(profession);
        return `./assets/villager_pics/${b}_${p}.png`
    },
}

export class Villager {
    entity = {
        customName: '',
        level: 5,
        xp: 1000,
        isXpRelatedToLevel: true,
        profession: 'none',
        type: 'plains',
    }
    offers = [];

    /** Adds the given recipe to the offer list. 
     * 
     * If an index is given, will insert at that position. */
    addRecipe(recipe, index = this.offers.length) {
        let newOffers = [...this.offers];
        newOffers.splice(index, 0, recipe);
        this.offers = newOffers;
        return recipe;
    }
    /** Removes the given recipe from the offer list. 
     * 
     * To remove by index, just do RemoveRecipe(offers[idx]) */
    removeRecipe(recipe) {
        this.offers = this.offers.filter((x) => x !== recipe);
        return this.offers;
    }
    /** Moves the given recipe to the given index. 
     * 
     * Returns true if successful, otherwise false.*/
    moveRecipe(recipe, index) {
        let oldIdx = this.offers.indexOf(recipe);
        if (oldIdx === -1) return false;

        // index wraparound
        index = (index + this.offers.length) % this.offers.length;

        let newOffers = this.offers.filter((x) => x !== recipe);
        newOffers.splice(index, 0, recipe);
        this.offers = newOffers;
        return true;
    }
    /** Finds and returns the recipe with the given uuid 
     * 
     * To find the index, just do offers.indexOf(findRecipe(uuid)) */
    findRecipe(uuid) {
        for (let recipe in this.offers) {
            if (recipe['uuid'] === uuid) return recipe;
        }
        return null;
    }
    /** Updates the old recipe with a new one */
    updateRecipe(oldRecipe, newRecipe) {
        let oldIdx = this.offers.indexOf(oldRecipe);
        if (oldIdx === -1) return false;

        let newOffers = [...this.offers];
        newOffers[oldIdx] = newRecipe;
        this.offers = newOffers;
        return true;
    }



}

export class Item {
    uuid = createId(); // used as the key for React lists

    constructor(count = 1, id = "stone", tag = "") {
        this.count = count;
        this.id = id;
        this.tag = tag;
    }
    clone() {
        return new Item(this.count, this.id, this.tag);
    }
}

export class Recipe {
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
        buy: new Item(1,'emerald'),
        buyB: new Item(0,'air'),
        sell: new Item(1,'paper'),
    }
    clone() {
        let x = new Recipe();

        x.extraData = Object.assign({},this.extraData);
        x.trades = {
            buy: this.trades.buy.clone(),
            buyB: this.trades.buyB.clone(),
            sell: this.trades.sell.clone()
        };

        return x;
    }
}

