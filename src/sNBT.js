
/**
 * (OK) End - (none)
 * (OK) Byte - (-128b to 127B)
 * (OK) Short - (-32768s to 32767S)
 * (OK) Int - (-2^31 to 2^31-1)
 * (OK) Long - (2^63l to 2^63-1L) (store as ints here).
 * (OK) Float - ((n)f or (n)F)
 * (OK) Double - ((n), (n)d or (n)D)
 * (OK) ByteArray - [B;n,n,n,...]
 * (OK) String - ""
 * (OK) List - [a,b,c,d...]
 * (OK) Compound - {a:b, c:[d,e,f...]}
 * (OK) IntArray - [I;n,n,n,...]
 * (OK) LongArray - [L;n,n,n...]
 */

//#region Tag definitions
export class TagType {
    value = null;

    constructor(value, validator) {
        this._valueValidator = validator;
        if (value != null) this.set(value);
    }
    toString = () => `[${this.constructor.name}: ${this.stringify()}]`;
    get() { return this.value; }
    set(v) {
        if (this._valueValidator(v)) {
            this.value = v;
            return v;
        }
        throw new TypeError('Input not valid!');
    };
    clone() {
        return parse(this.stringify());
    }
    stringify() { return this.value.toString(); }
    console = (name) => {
        if (this.value instanceof TagType)
            return this.value.console(name);
        let n = (name) ? `${name} - ` : '';
        console.log(`[ ${n}(${this.constructor.name}): ${this.stringify()} ]`);
    }
    static parse = (str) => findAppropiateTagType(str).parse(str);
}

class TagNumber extends TagType {
    SUFFIX = 'n';
    constructor(v, validator, RANGE) {
        super(null, (v) => (validator(v) && (RANGE[0] <= v) && (v <= RANGE[1])));
        this.RANGE = RANGE;
        this.set(v);
    };
    stringify(options = STRINGIFY_PROFILES.default) {
        let suffixCases = {
            default: this.SUFFIX,
            uppercase: this.SUFFIX.toUpperCase(),
            lowercase: this.SUFFIX.toLowerCase(),
            ommit: '',
        }
        return this.value.toString() + suffixCases[options.number_suffix];
    }
    static parse = (str, Type, parser) => new Type(parser(str));
}
let intValidator = (v) => Number.isInteger(v);
let intParser = (parser, range) => {
    return (v) => {
        let x = parser(v);
        x = (x <= range[0]) ? range[0] : x;
        x = (x <= range[1]) ? x : range[1];
        return x;
    }
}
let byteParser = (v) => {
    if (v.toLowerCase() === 'true')
        return 1;
    if (v.toLowerCase() === 'false')
        return 0;
    return intParser(Number.parseInt, RANGES.TagByte)(v);
}
const RANGES = {
    TagByte: [-(2 ** 7), 2 ** 7 - 1],
    TagShort: [-(2 ** 15), 2 ** 15 - 1],
    TagInt: [-(2 ** 31), 2 ** 31 - 1],
    TagLong: [-(2n ** 63n), 2n ** 63n - 1n],
}
export class TagByte extends TagNumber {
    SUFFIX = 'b';
    isBoolean = false; /** Is true, will be stringified as true/false */
    constructor(v, isBoolean = false) {
        super(v, intValidator, RANGES.TagByte);
        this.isBoolean = isBoolean;
    }
    stringify(options = STRINGIFY_PROFILES.default) {
        if (this.isBoolean && (this.value === 0 || this.value === 1)) {
            let cases = {
                default: (this.value) ? 'true' : 'false',
                uppercase: (this.value) ? 'TRUE' : 'FALSE',
                lowercase: (this.value) ? 'true' : 'false',
                ommit: (this.value) ? '1' : '0',
            }
            return cases[options.number_suffix];
        }
        return super.stringify(options);
    }
    static parse(str) {
        let isBool = (str.toLowerCase() === 'true' || str.toLowerCase() === 'false');
        return new TagByte(byteParser(str), isBool);
    }
}
export class TagShort extends TagNumber {
    SUFFIX = 's';
    constructor(v) { super(v, intValidator, RANGES.TagShort) }
    static parse = (str) => TagNumber.parse(str, TagShort, intParser(Number.parseInt, RANGES.TagShort));
}
export class TagInt extends TagNumber {
    SUFFIX = '';
    constructor(v) { super(v, intValidator, RANGES.TagInt) }
    static parse = (str) => TagNumber.parse(str, TagInt, intParser(Number.parseInt, RANGES.TagInt));
}
export class TagLong extends TagNumber {
    SUFFIX = 'L';
    constructor(v) { super(v, (v) => typeof v === 'bigint', RANGES.TagLong) }
    static parse = (str) => TagNumber.parse(str, TagLong, intParser(BigInt, RANGES.TagLong));
}
export class TagFloat extends TagNumber {
    /* Too lazy too add validation, this is mainly for sNBT format, so it doesnt need to be precise. */
    SUFFIX = 'f';
    constructor(v) { super(v, (v) => (typeof v === 'number' && Number.isFinite(v)), [-Infinity, Infinity]) }
    static parse = (str) => TagNumber.parse(str, TagFloat, Number.parseFloat);
}
export class TagDouble extends TagNumber {
    SUFFIX = 'd';
    constructor(v) { super(v, (v) => (typeof v === 'number' && Number.isFinite(v)), [-Infinity, Infinity]) }
    static parse = (str) => TagNumber.parse(str, TagDouble, Number.parseFloat);
}

export class TagString extends TagType {
    constructor(v) { super(v, (v) => typeof v === 'string', (x) => x.toString()); };
    stringify = (options = STRINGIFY_PROFILES.default) => {
        if (options.allow_unquoted_strings && isAllowedInUnquotedString(this.value))
            return this.value;
        if (options.allow_single_quote_strings) {
            let single_quote = (this.value.match(/'/g) || []).length;
            let double_quote = (this.value.match(/"/g) || []).length;
            if (single_quote < double_quote || options.allow_single_quote_strings === 'always')
                return "'" + JSON
                    .stringify(this.value)
                    .slice(1, -1)
                    .replaceAll('\\"', '"')
                    .replaceAll("'", "\\'")
                    + "'";
        }
        return JSON.stringify(this.value);
    }
    static parse = (str) => {
        if ((str[0] === '"' && str[str.length - 1] === '"') || (str[0] === '\'' && str[str.length - 1] === '\'')) {
            str = str.substring(1, str.length - 1);
            return new TagString(str.replaceAll('\\', ''));
        }
        if (isAllowedInUnquotedString(str)) return new TagString(str.replaceAll('\\', ''));
        else throw SyntaxError('Unquoted string "' + str + '" contains invalid characters.');
    }
}

let checkArraySingleType = function ([head, ...tail]) {
    if (head == null || tail.length === 0) return true;
    let headType = head.constructor.name;
    for (let x of tail) {
        if (x == null || x.constructor.name !== headType)
            return false;
    }
    return true;
}
export class TagList extends TagType {
    STRINGIFY_TYPE_PREFIX = '';
    constructor(value, listType = TagType) {
        super();
        this._valueValidator = (v) => (v instanceof Array) && (v.length === 0 || v[0] instanceof this.listType) && checkArraySingleType(v);
        this._singleValueValidator = (v) => (v instanceof this.listType) && (this.value.length === 0 || this.value[0].constructor.name === v.constructor.name);
        this._indexCondition = (index) => (Number.isInteger(index) && index >= 0 && this.value.length > index)
        this.listType = listType;
        this.value = [];
        if (value != null)
            this.set(value);
    }

    /* PARSING */
    _findListType() {
        if (this.value.length) return this.value[0].constructor;
        return this.listType;
    }



    /* OPERATIONS */
    add(value) {
        if (this._singleValueValidator(value)) {
            this.value.push(value);
            if (this.listType === TagType)
                this.listType = value.constructor;
            return true;
        }
        return false;
    }
    addParse(value) { return this.add(this.listType.parse(value)) }
    set(index, value) {
        if (value === undefined) return super.set(index);
        if (this._indexCondition(index) && this._singleValueValidator(value)) {
            this.value[index] = value;
            return true;
        }
        return false;
    }
    remove(index) {
        if (this._indexCondition(index)) {
            delete this.value[index];
            return true;
        }
        return false;
    }
    get = (index) => {
        if (index === undefined) return this.value;
        if (index === '') return this;
        return this.value[index];
    }
    navigate(path) {
        let dir = pathDeconstruct(path);
        if (dir[0][0] !== '[' || dir[0][dir[0].length - 1] !== ']') return null; // this is a list
        dir[0] = dir[0].slice(1,-1);

        if (dir.length > 1) {
            let x = this.get(parseInt(dir[0]));
            if (x instanceof TagCompound || (x instanceof TagList && dir[1][0] === '[')) return x.navigate(dir.splice(1));
        }
        else if (dir.length === 1) return this.get(parseInt(dir[0]));
        return null;
    }
    indexOf = (value) => this.value.indexOf(value);
    stringify = (options = STRINGIFY_PROFILES.default) => {
        let [firstPad, currentPad, lastPad] = paddingAdjust(options);
        let newOptions = depthPlus(options);
        let mapLamda = x => currentPad + x.stringify(newOptions);
        return '[' + this.STRINGIFY_TYPE_PREFIX
            + firstPad
            + this.value
                .map(mapLamda)
                .join(options.entry_separator + firstPad)
            + lastPad + ']';
    }
    console = (name) => {
        let n = (name) ? `${name} - ` : '';
        console.groupCollapsed(`[ ${n}(${this.constructor.name}): [] ]`);
        for (let x of this.value)
            x.console();
        console.groupEnd();
    }
    static parse(s) {
        let out = new TagList();

        if (s[0] === '[' && s[s.length - 1] === ']') {
            let items = split(s);

            // Empty list
            if (items.length === 0) return out;

            // Find proper prefix
            let firstItem = items[0];
            let listType = findAppropiateTagType(firstItem);
            if (listType == null) return out;

            out.listType = listType;
            for (let item of items)
                out.add(listType.parse(item));
        }

        return out;
    }
    static specialTypeParser(ListConstructor, listType) {
        return (s) => {
            let out = new ListConstructor();

            if (s[0] === '[' && s[s.length - 1] !== ']') {
                let items = split(s);

                // Empty list
                if (items.length === 0) return out;

                // Remove first item prefix
                items[0] = items[0].substring(2);
                for (let item of items)
                    out.addParse(listType.parse(item));
            }

            return out;
        }
    }
}

export class TagByteArray extends TagList {
    STRINGIFY_TYPE_PREFIX = 'B;';
    constructor(value) {
        super(null, TagByte);
        this.set(value);
    }
    static parse = TagList.specialTypeParser(TagByteArray, TagByte);
}
export class TagIntArray extends TagList {
    STRINGIFY_TYPE_PREFIX = 'I;';
    constructor(value) {
        super(null, TagInt);
        this.set(value);
    }
    static parse = TagList.specialTypeParser(TagIntArray, TagInt);
}
export class TagLongArray extends TagList {
    STRINGIFY_TYPE_PREFIX = 'L;';
    constructor(value) {
        super(null, TagLong);
        this.set(value);
    }
    static parse = TagList.specialTypeParser(TagLongArray, TagLong);
}

function pathDeconstruct(path) {
    if (path instanceof Array) return path;
    if (typeof (path) === 'string') {
        let out = [];
        let currentPath = '';
        for (let i = 0; i < path.length; ++i) {
            const c = path[i];
            if (c === '[') {
                out.push(currentPath);
                currentPath = '';

                let j = findNextStr(i + 1, path, ']');
                out.push(path.substring(i, j + 1));
                i = j;
                continue;
            }
            if (c === '.') {
                out.push(currentPath);
                currentPath = '';
                continue;
            }
            currentPath += c;
        }
        out.push(currentPath);
        return out.filter(x => x); // remove any stray '';
    }
    return [];
}

export class TagCompound extends TagType {
    constructor(v) {
        super();
        this._valueValidator = (v) => {
            if (!(v instanceof Object)) return false;
            let values = Object.values(v)
            return (values.length === 0 || values[0] instanceof TagType) && checkArraySingleType(values);
        }
        this._singleValueValidator = (v) => (v instanceof TagType);
        this.value = {};
        if (v != null)
            this.set(v);
    }
    set(key, value) {
        if (value === undefined) return super.set(key);
        if (typeof key !== 'string') return false;
        if (this._singleValueValidator(value)) {
            this.value[key] = value;
            return true;
        }
        return false;
    }
    remove(key) {
        if (typeof key === 'string' && Object.keys(this.value).contains(key)) {
            delete this.value[key];
            return true;
        }
        return false;
    }
    get(index) {
        if (index === undefined) return this.value;
        if (index === '') return this;
        return this.value[index];
    }
    navigate(path) {
        let dir = pathDeconstruct(path);
        if (dir.length > 1) {
            if (dir[0][0] === '[') return null; // this is not a list
            let x = this.get(dir[0]);
            if (x instanceof TagCompound || (x instanceof TagList && dir[1][0] === '[')) return x.navigate(dir.splice(1));
        }
        else if (dir.length === 1) return this.get(dir[0]);
        return null;
    }
    keys = () => Object.keys(this.value);
    values = () => Object.values(this.value);
    entries = () => Object.entries(this.value);
    stringify = (options = STRINGIFY_PROFILES.default) => {
        let [firstPad, currentPad, lastPad] = paddingAdjust(options);
        let newOptions = depthPlus(options);
        let mapLamda = x => currentPad + x[0] + options.compound_separator + x[1].stringify(newOptions);
        return '{'
            + firstPad
            + Object.entries(this.value)
                .map(mapLamda)
                .join(options.entry_separator + firstPad)
            + lastPad + '}';
    }
    console = (name) => {
        let n = (name) ? `${name} - ` : '';
        console.groupCollapsed(`[ ${n}(${this.constructor.name}): {} ]`);
        for (let x of this.entries()) {
            x[1].console(x[0]);
        }
        console.groupEnd();
    }
    static parse(s) {
        let out = new TagCompound();
        if (s[0] === '{' && s[s.length - 1] === '}') {
            let pairs = split(s);
            if (pairs.length % 2 !== 0)
                throw SyntaxError('Number of key-value pairs is odd.\n' + s);
            for (let i = 0; i < pairs.length; i += 2) {
                let key = pairs[i];
                let value = parseValue(pairs[i + 1])
                out.set(key, value);
            }
        }
        return out;
    }
}
//#endregion

//#region Stringifier
export function stringify(element, opts = {}) {
    let options = { ...STRINGIFY_PROFILES.default, ...opts };
    if (element instanceof TagType) return element.stringify(options);
    return element.toString();
}

//#endregion

//#region Parser Helpers
/** Finds the next quote */
// TODO: Try to optimize using indexOf??
function findNextStr(startIndex, str, find) {
    for (let i = startIndex; i < str.length; ++i) {
        const c = str[i];
        if (c === '\\') ++i;
        else if (c === find) return i;
    }
    return str.length;
}

/** Removes whitespace, taking into account strings. */
function removeWhiteSpaces(str) {
    let out = '';
    for (let i = 0; i < str.length; ++i) {
        const c = str[i];
        if (c === '"') {
            let j = findNextStr(i + 1, str, '"');
            out += str.substring(i, j + 1);
            i = j;
            continue;
        }
        if (c === '\'') {
            let j = findNextStr(i + 1, str, '\'');
            out += str.substring(i, j + 1);
            i = j;
            continue;
        }
        if (c.charCodeAt(0) <= 32)
            continue;
        out += c;
    }
    return out;
}

/** Separates every valid Tag or Key/Value pair */
function split(str) {
    let out = [];

    if (str.length === 2) // case '[]' or '{}'
        return out;

    let parseDepth = 0;
    let t = '';

    for (let i = 1, j = 0; i < str.length - 1; i++) {
        switch (str[i]) {
            case '[':
            case '{':
                ++parseDepth;
                break;
            case ']':
            case '}':
                --parseDepth;
                break;
            case '"':
                j = findNextStr(i + 1, str, '"');
                t += str.substring(i, j + 1);
                i = j;
                continue;
            case '\'':
                j = findNextStr(i + 1, str, '\'');
                t += str.substring(i, j + 1);
                i = j;
                continue;
            case ',':
            case ':':
                if (parseDepth === 0) {
                    out.push(t);
                    t = '';
                    continue;
                }
                break;
            default:
                break;
        }
        t += str[i];
    }

    out.push(t);
    return out;
}

function isCharAllowedInUnquotedString(c) {
    // taken from brigadier/StringReader.java
    return (c >= '0' && c <= '9')
        || (c >= 'A' && c <= 'Z')
        || (c >= 'a' && c <= 'z')
        || c === '_' || c === '-'
        || c === '.' || c === '+';
}

function isAllowedInUnquotedString(str) {
    return str.split('').every(isCharAllowedInUnquotedString);
}

//#endregion

//#region Parser
function findAppropiateTagType(s) {
    let DEBUG = false;
    if (s.Length === 0) {
        if (DEBUG) console.log(`NONE: ${s}`);
        return null;
    }
    // Compound tags
    if (s[0] === '{' && s[s.length - 1] === '}') {
        if (DEBUG) console.log(`COMPOUND: ${s}`);
        return TagCompound;
    }
    // List tags
    if (s[0] === '[' && s[s.length - 1] === ']') {
        switch (s.substring(1, 3)) {
            case 'B;':
                if (DEBUG) console.log(`BYTELIST: ${s}`);
                return TagByteArray;
            case 'I;':
                if (DEBUG) console.log(`INTLIST: ${s}`);
                return TagIntArray;
            case 'L;':
                if (DEBUG) console.log(`LONG LIST: ${s}`);
                return TagLongArray;
            default:
                if (DEBUG) console.log(`LIST: ${s}`);
                return TagList;
        }
    }

    // Boolean
    if (s.toLowerCase() === 'true' || s.toLowerCase() === 'false') {
        if (DEBUG) console.log(`BYTE: ${s}`);
        return TagByte;
    }


    // Numbers
    let isCharDigit = (c) => (c >= '0' && c <= '9');
    if (isCharDigit(s[0]) || s[0] === '-' || s[0] === '+') {
        let su = s.toUpperCase();
        let suLastChar = su[su.length - 1];
        if (suLastChar === 'D' || s.includes('.')) {
            if (DEBUG) console.log(`DOUBLE: ${s}`);
            return TagDouble;
        } else if (suLastChar === 'F') {
            if (DEBUG) console.log(`FLOAT: ${s}`);
            return TagFloat;
        } else if (suLastChar === 'B') {
            if (DEBUG) console.log(`BYTE: ${s}`);
            return TagByte;
        } else if (suLastChar === 'L') {
            if (DEBUG) console.log(`LONG: ${s}`);
            return TagLong;
        } else {
            if (isCharDigit(suLastChar)) su = su.substring(0, su.length - 1);
            try {
                let x = BigInt(su);
                if (intParser(BigInt, RANGES.TagInt)(x) === x) {
                    if (DEBUG) console.log(`INT: ${s}`);
                    return TagInt;
                } else if (intParser(BigInt, RANGES.TagLong)(x) === x) {
                    if (DEBUG) console.log(`LONG: ${s}`);
                    return TagLong;
                }// Number too large for 2**63? let it be a string.
            }
            catch (error) { } // BigInt cant parse it? Let it be a string.
        }
        // Anything else will be parsed as an unquoted string
    }

    // Everything else: string.
    if (DEBUG) console.log(`STRING: ${s}`);
    return TagString;
}

function parseValue(s) {
    let appropiateTagType = findAppropiateTagType(s);
    return (appropiateTagType == null) ? null : appropiateTagType.parse(s);
}

export function parse(str) {
    /**
     * Trim unnecesary spaces.
     * Determine main string type
     * Separate keys and values
     * For each value, determine its value.
     */

    let trimmed = removeWhiteSpaces(str);
    return parseValue(trimmed);
}

//#endregion

//#region Options and Profiles
/**
 * Basic profiles:
 * - default (2 space padding)
 * - expanded (4 space padding)
 * - lineal (no new lines)
 * - compact (no padding or spaces).
 * 
 * Values:
 * - compound_separator: Goes between key-value pairs (':').
 * - entry_separator: Goes between list elements (', ').
 * - depth_padding: If false, does not pad. 
 * If a string (like ' ' or even ''), will apply newlines and pad each level.
 * - number_suffix: Format of number suffixes (default, lower, upper, ommit).
 * - current_depth: Initial pad depth (0).
 * - allow_unquoted_strings: If a string is safe, quotes will be ommited.
 * - allow_single_quote_strings: 
 *   - If false, double quotes will always be used.
 *   - If true, will check amount of single vs double quotes and, 
 *     if there are more double quotes than single quotes, will use single quotes 
 *     for that particular string.
 *   - If 'always', will always use single quotes instead of double quotes.
 */
export let STRINGIFY_PROFILES = {
    default: {
        compound_separator: ': ',
        entry_separator: ', ',
        depth_padding: '  ',
        number_suffix: 'default', // default, lower, upper, ommit
        current_depth: 0,
        allow_unquoted_strings: false,
        allow_single_quote_strings: false, // true, false, 'always'
    },
}
STRINGIFY_PROFILES.expanded = {
    ...STRINGIFY_PROFILES.default,
    depth_padding: '    ',
}
STRINGIFY_PROFILES.lineal = {
    ...STRINGIFY_PROFILES.default,
    depth_padding: false,
}
STRINGIFY_PROFILES.compact = {
    ...STRINGIFY_PROFILES.default,
    depth_padding: false,
    compound_separator: ':',
    entry_separator: ',',
    number_suffix: 'ommit',
    allow_unquoted_strings: true,
    allow_single_quote_strings: true,
}

const paddingAdjust = (options) => {
    let isPad = (options.depth_padding !== false);
    let currentPad = (isPad) ? options.depth_padding.repeat(options.current_depth) : '';
    let firstPad = (isPad) ? '\n' : '';
    let lastPad = (isPad) ? firstPad + options.depth_padding.repeat(Math.max(options.current_depth - 1, 0)) : '';
    return [firstPad, currentPad, lastPad];
}
const depthPlus = (options) => { return { ...options, current_depth: options.current_depth + 1 }; }

//#endregion