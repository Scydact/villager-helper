import React from 'react';
import * as vo from './VillagerObject';
import { toTitleCase } from './Utils';

export class VillagerInfo extends React.Component {
    render() {
        let data = this.props.data;
        let onChange = this.props.onChange;
        return (
            <div className="villager card">
                <img
                    className="villager-image"
                    src={vo.VILLAGER.getVillagerImagePath(data.type, data.profession)}
                    alt={`Villager: ${data.type}_${data.profession}`} />

                <div className="villager-form form">

                    <label>Name: </label>
                    <input
                        type="text"
                        value={data.customName}
                        name="customName"
                        onChange={onChange} />

                    <label>Profession: </label>
                    <select
                        type="text"
                        value={data.profession}
                        name="profession"
                        onChange={onChange}>
                        {vo.VILLAGER.professions.map(
                            (x, y) => <option key={y} value={x}>{toTitleCase(x)}</option>
                        )}
                    </select>

                    <label>Biome: </label>
                    <select
                        type="option"
                        value={data.type}
                        name="type"
                        onChange={onChange}>
                        {vo.VILLAGER.biomes.map(
                            (x, y) => <option key={y} value={x}>{toTitleCase(x)}</option>
                        )}
                    </select>

                    <label>Level: </label>
                    <input
                        type="number"
                        value={data.level}
                        name="level"
                        onChange={onChange} />

                    <label>Xp: </label>
                    <input
                        type="number"
                        value={data.xp}
                        name="xp"
                        onChange={onChange} />

                </div>
            </div>
        );
    }
}