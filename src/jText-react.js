import React from 'react';

export function parseJsonText(obj) {
    if (typeof (obj) === 'string') return (<span>{obj}</span>);
    if (obj instanceof Array) {
        let x = [];
        for (let y of obj)
            x.push(parseJsonText(y));
        return (<span>{x}</span>)
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

    let classList = [];
    let opts = {
        className: '',
        children: [],
    }
    if (color) {
        if (color[0] === '#') opts['style'] = 'color: ' + color;
        else { classList.push(color) }
    }
    for (let x of ['bold', 'italic', 'underlined', 'strikethrough', 'obfuscated']) {
        if (obj[x]) classList.push(x);
    }

    let tooltip = '';
    if (insertion) tooltip += insertion;
    if (clickEvent) tooltip += `[CLICK: ${clickEvent.action}] = ${clickEvent.value}`;
    if (hoverEvent) tooltip += `[HOVER: ${hoverEvent.action}]`;

    if (tooltip !== '') opts['title'] = tooltip;

    if (text)
        opts.children.push(text);
    else if (translate) {
        let x = { className: 'translate', children: translate };
        if (withList) x['title'] = '[PARAMS]: ' + withList.join(', ');
        opts.children.push(React.createElement('span', x));
    }
    else if (score) {
        if (score.value !== undefined) {
            opts.children.push(React.createElement('span', { className: 'score' }, score.value));
        } else {
            let x = { className: 'score', children: [] };
            x.children.push('[SCORE]: ');
            x.children.push(<span className='selector'>{score.name}</span>);
            x.children.push(' / ');
            x.children.push(<span className='score-objective'>{score.objective}</span>);
            opts.children.push(React.createElement('span', x));
        }
    } else if (selector)
        opts.children.push(<span className='selector'>{selector}</span>);
    else if (keybind)
        opts.children.push(<span className='keybind'>{keybind}</span>);
    else if (nbt) {
        let t = block || entity || storage || 'NO PATH SPECIFIED!';
        let x = '[NBT]: ' + nbt + ' @ ' + t;
        opts.children.push(<span className='nbt'>{x}</span>);
    }

    if (extra) opts.children.appendChild(parseJsonText(extra));
    opts['className'] = classList.join(' ');
    return React.createElement('span', opts);
}