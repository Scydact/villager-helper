export function parseJsonText(obj) {
    if (typeof (obj) === 'string') return createNode('span', obj);
    if (obj instanceof Array) {
        let x = createNode('span');
        for (let y of obj)
            x.appendChild(parseJsonText(y));
        return x;
    }
    if (typeof (obj) !== 'object') return;

    let {
        // extra tag
        extra,

        // formatting
        color,

        // interactivity
        insertion,
        clickEvent,
        hoverEvent,

        // content
        text,
        translate,
        'with': withList,
        score,
        selector,
        keybind,

        // nbt content
        nbt,
        // interpret,
        block,
        entity,
        storage,
    } = obj;

    let outtag = createNode('span');
    if (color) {
        if (color[0] === '#') outtag.style.color = color;
        else { outtag.classList.add(color) }
    }
    for (let x of ['bold', 'italic', 'underlined', 'strikethrough', 'obfuscated']) {
        if (obj[x]) outtag.classList.add(x);
    }

    let tooltip = '';
    if (insertion) tooltip += insertion;
    if (clickEvent) tooltip += `[CLICK: ${clickEvent.action}] = ${clickEvent.value}`;
    if (hoverEvent) tooltip += `[HOVER: ${hoverEvent.action}]`;

    if (tooltip !== '') outtag.title = tooltip;

    if (text)
        outtag.appendChild(textNode(text));
    else if (translate) {
        let x = createNode('span', translate, 'translate');
        if (withList)
            x.title = '[PARAMS]: ' + withList.join(', ');
        outtag.appendChild(x);
    }
    else if (score) {
        if (score.value !== undefined) {
            outtag.appendChild(createNode('span', score.value, 'score'));
        } else {
            let x = createNode('span', null, 'score');
            x.appendChild(textNode('[SCORE]: '));
            x.appendChild(createNode('span', score.name, 'selector'));
            x.appendChild(textNode(' / '));
            x.appendChild(createNode('span', score.objective, 'score-objective'));
            outtag.appendChild(x);
        }
    } else if (selector)
        outtag.appendChild(createNode('span', selector, 'selector'));
    else if (keybind)
        outtag.appendChild(createNode('span', keybind, 'keybind'));
    else if (nbt) {
        let t = block || entity || storage || 'NO PATH SPECIFIED!';
        let x = '[NBT]: ' + nbt + ' @ ' + t ;
        outtag.appendChild('span', x, 'nbt');
    }

    if (extra) outtag.appendChild(parseJsonText(extra));
    return outtag;
}

function isNode(o) {
    return (
        typeof Node === "object" ? o instanceof Node :
            o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string"
    );
}

function textNode(content) {
    return document.createTextNode(content.toString());
}

function createNode(tagName, content, classes, attributes) {
    let x = document.createElement(tagName);

    if (content !== undefined && content !== null) {
        if (isNode(content)) x.appendChild(content);
        else x.appendChild(textNode(content));
    }

    if (typeof (classes) === 'string') classes = classes.split(' ');
    if (classes instanceof Array) classes.forEach(y => x.classList.add(y));

    if (attributes) {
        for (let x in attributes) {
            let val = attributes[x];
            x.setAttribute(x, val);
        }
    }

    return x;
}