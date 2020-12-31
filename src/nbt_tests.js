// NBT TESTS
import * as NBT from './sNBT';

export function test() {
    window.NBT = NBT;
    window.a = new NBT.TagCompound({
        a: new NBT.TagString('lol'),
        b: new NBT.TagString('lolax'),
    });
    window.b = new NBT.TagList([
        new NBT.TagString('lol'),
        new NBT.TagString('lolax'),
    ]);
    window.x = '{VillagerData:{level:5,profession:"minecraft:farmer",type:"minecraft:snow"},Offers:{Recipes:[{rewardExp:1b,maxUses:2147483647,buy:{id:"emerald",Count:1b},sell:{id:"paper",Count:10b}},{rewardExp:1b,maxUses:2147483647,buy:{id:"paper",Count:15b},sell:{id:"emerald",Count:1b}}]},CustomName:"\\"Voldemort\\"",Invulnerable:1b,NoAI:1b,NoGravity:1b}';
}