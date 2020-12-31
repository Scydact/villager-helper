
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
    stringify = () => this.value.toString();
    static parse = (str) => findAppropiateTagType(str).parse(str);
}

class TagNumber extends TagType {
    SUFFIX = 'n';
    constructor(v, validator, RANGE) {
        super(null, (v) => (validator(v) && (RANGE[0] <= v) && (v <= RANGE[1])));
        this.RANGE = RANGE;
        this.set(v);
    };
    stringify = () => this.value.toString() + this.SUFFIX;
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
const RANGES = {
    TagByte: [-(2 ** 7), 2 ** 7 - 1],
    TagShort: [-(2 ** 15), 2 ** 15 - 1],
    TagInt: [-(2 ** 31), 2 ** 31 - 1],
    TagLong: [-(2n ** 63n), 2n ** 63n - 1n],
}
export class TagByte extends TagNumber {
    SUFFIX = 'b';
    constructor(v) { super(v, intValidator, RANGES.TagByte) }
    static parse = (str) => TagNumber.parse(str, TagByte, intParser(Number.parseInt, RANGES.TagByte));
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
    stringify = () => JSON.stringify(this.value);
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
        return this.value[index];
    }
    indexOf = (value) => this.value.indexOf(value);
    stringify = () => `[${this.value.map(x => x.stringify()).join(', ')}]`;
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
    constructor(value) {
        super(null, TagByte);
        this.set(value);
    }
    stringify = () => `[B;${this.value.map(x => x.stringify()).join(', ')}]`;
    static parse = TagList.specialTypeParser(TagByteArray, TagByte);
}
export class TagIntArray extends TagList {
    constructor(value) {
        super(null, TagInt);
        this.set(value);
    }
    stringify = () => `[I;${this.value.map(x => x.stringify()).join(', ')}]`;
    static parse = TagList.specialTypeParser(TagIntArray, TagInt);
}
export class TagLongArray extends TagList {
    constructor(value) {
        super(null, TagLong);
        this.set(value);
    }
    stringify = () => `[L;${this.value.map(x => x.stringify()).join(', ')}]`;
    static parse = TagList.specialTypeParser(TagLongArray, TagLong);
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
    get = (index) => {
        if (index === undefined) return this.value;
        return this.value[index];
    }
    keys = () => Object.keys(this.value);
    values = () => Object.values(this.value);
    stringify = () => `{${Object.entries(this.value).map(x => x[0] + ': ' + x[1].stringify()).join(', ')}}`;
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
    if (element instanceof TagType) return element.stringify(opts);
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
    if (s.Length === 0){
        console.log(`NONE: ${s}`);
        return null;
}
    // Compound tags
    if (s[0] === '{' && s[s.length - 1] === '}'){
        console.log(`COMPOUND: ${s}`);
        return TagCompound;
}
    // List tags
    if (s[0] === '[' && s[s.length - 1] === ']') {
        switch (s.substring(1, 3)) {
            case 'B;':
                console.log(`BYTELIST: ${s}`);
                return TagByteArray;
            case 'I;':
                console.log(`INTLIST: ${s}`);
                return TagIntArray;
            case 'L;':
                console.log(`LONG LIST: ${s}`);
                return TagLongArray;
            default:
                console.log(`LIST: ${s}`);
                return TagList;
        }
    }

    // Numbers
    let isCharDigit = (c) => (c >= '0' && c <= '9');
    if (isCharDigit(s[0]) || s[0] === '-' || s[0] === '+') {
        let su = s.toUpperCase();
        let suLastChar = su[su.length - 1];
        if (suLastChar === 'D' || s.includes('.')){
            console.log(`DOUBLE: ${s}`);
            return TagDouble;
        }else if (suLastChar === 'F'){
            console.log(`FLOAT: ${s}`);
            return TagFloat;
        }else if (suLastChar === 'B'){
            console.log(`BYTE: ${s}`);
            return TagByte;
        }else if (suLastChar === 'L'){
            console.log(`LONG: ${s}`);
            return TagLong;
        }else {
            if (isCharDigit(suLastChar)) su = su.substring(0, su.length - 1);
            try {
                let x = BigInt(su);
                if (intParser(BigInt, RANGES.TagInt)(x) === x){
                    console.log(`INT: ${s}`);
                    return TagInt;
                }else if (intParser(BigInt, RANGES.TagLong)(x) === x){
                    console.log(`LONG: ${s}`);
                    return TagLong;
                }// Number too large for 2**63? let it be a string.
            }
            catch (error) { } // BigInt cant parse it? Let it be a string.
        }
        // Anything else will be parsed as an unquoted string
    }

    // Everything else: string.
    console.log(`STRING: ${s}`);
    return TagString;
}

function parseValue(s) {
    let appropiateTagType = findAppropiateTagType(s);
    return (appropiateTagType == null) ? null : appropiateTagType.parse(s);
}

export function parse(str) {
    /**
     * Trim unnecesary spaces.
     * Determine main strin type
     * Separate keys and values
     * For each value, determine its value.
     */

    let trimmed = removeWhiteSpaces(str);
    return parseValue(trimmed);
}

//#endregion

