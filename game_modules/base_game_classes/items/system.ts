import { damage_affixes_effects, get_power, protection_affixes_effects } from "../affix";
import { Damage, damage_type } from "../misc/damage_types";
import { Item, ItemJson, Itemlette } from "./item";

const empty_resists = new Damage()

export namespace ItemSystem {
    export function size (item: Itemlette): number {
        if (item.slot == 'weapon') {
            switch(item.weapon_tag) {
                case 'onehand':
                    return 1
                case 'polearms':
                    return 2
                case 'ranged':
                    return 1
                case 'twohanded':
                    return 3
            }
        }
        
        switch(item.slot) {
            case 'arms': return 1
            case 'foot': return 1
            case 'head': return 1
            case 'legs': return 3
            case 'body': return 5
        }

        // return 1
    }

    export function create (item_desc: ItemJson) {
        let item = new Item(item_desc.durability, [], item_desc.slot, item_desc.range, item_desc.material, item_desc.weapon_tag, item_desc.model_tag, item_desc.resists, item_desc.damage)
        for (let aff of item_desc.affixes) {
            item.affixes.push(aff)
        }
        return item
    }

    export function weight(item: Item) {
        return item.material.density * size(item)
    }

    export function power(item:Item|undefined) {
        if (item == undefined) return 0;

        let result = 0
        for (let i = 0; i < item.affixes.length; i++) {
            let affix = item.affixes[i];
            let f = get_power[affix.tag];
            if (f != undefined) {
                result = f(result);
            }
        }
        return result;
    }

    export function melee_damage(item: Item, type: damage_type) {
        // calculating base damage of item
        let damage = new Damage()
        switch(type) {
            case 'blunt': {damage.blunt = ItemSystem.weight(item) * item.damage.blunt; break}
            case 'pierce': {damage.pierce = ItemSystem.weight(item) * item.damage.pierce; break}
            case 'slice': {damage.slice = ItemSystem.weight(item) * item.damage.slice; break}
        }
        damage.fire = item.damage.fire

        // summing up all affixes
        for (let i = 0; i < item.affixes.length; i++) {
            let affix = item.affixes[i];
            damage = damage_affixes_effects[affix.tag](damage);
        }

        return damage
    }

    export function ranged_damage(weapon: Item): Damage {
        const damage = new Damage()
        if (weapon?.weapon_tag == 'ranged') {
            damage.pierce = 10
            return damage
        }

        damage.blunt = weight(weapon) * weapon.damage.blunt
        damage.pierce = weight(weapon) * weapon.damage.pierce
        damage.slice = weight(weapon) * weapon.damage.slice
        return damage
    }

    export function resists(item:Item|undefined) {
        if (item == undefined) {return empty_resists}

        let result = item.resists        
        for (let i = 0; i < item.affixes.length; i++) {
            let affix = item.affixes[i];
            let f = protection_affixes_effects[affix.tag];
            if (f != undefined) {
                result = f(result);
            }
        }
        return result;
    }
}