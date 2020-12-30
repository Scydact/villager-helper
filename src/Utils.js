import * as mi from 'minecraft-items';
import MinecraftData from 'minecraft-data';

export function createId() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    // Source: https://gist.github.com/gordonbrander/2230317
    return '_' + Math.random().toString(36).substr(2, 9);
};

export const CONSTANTS = {
    MAX_VALUE: {
        BYTE: (2 ** 7) - 1,
        SHORT: (2 ** 15) - 1,
        INT: (2 ** 31) - 1,
        LONG: (2 ** 63) - 1,
    },
    MIN_VALUE: {
        BYTE: -(2 ** 7),
        SHORT: -(2 ** 15),
        INT: -(2 ** 31),
        LONG: -(2 ** 63),
    }
}

export function toTitleCase(s) {
    if (typeof s !== 'string') return '';
    return s.split(' ')
        .map(x => x.charAt(0).toUpperCase() + x.slice(1))
        .join(' ');
}

let versions = MinecraftData.supportedVersions.pc;
let mdlast = MinecraftData(versions[versions.length-1]);

/** Finds item data from minecraft-data module. */
export function findItemInfo(str) {
    let id = str.split(':').splice(-1);
    return mdlast.findItemOrBlockByName(id);
}
/** Finds an item icon by its display name */
export function findItemIcon(name, isDisplayName = false) {
    if (!isDisplayName) {
        let x = findItemInfo(name);
        name = x ? x.displayName : name;
    }
    let x = mi.get(name);
    return (x) ? x['icon'] : null;
}
export function findDisplayName(str) {

}
window.mdlast = mdlast;