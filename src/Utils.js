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