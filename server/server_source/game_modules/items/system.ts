import { ItemData } from "../../../../shared/inventory";
import { damage_type } from "../types";
import { attack_affixes_effects, damage_affixes_effects, get_power, protection_affixes_effects } from "../base_game_classes/affix";
import { DmgOps } from "../damage_types";
import { Damage } from "../Damage";
import { Item, ItemJson, Itemlette } from "./item";
import { ELODINO_FLESH, GRACI_HAIR, materials, MaterialsManager } from "../manager_classes/materials_manager";
import { Status } from "../types";
import { AttackObj } from "../attack/class";

const empty_resists = new Damage()
const empty_status : Status = {
    fatigue: 0,
    stress: 0,
    hp: 0,
    rage: 0,
    blood: 0
}

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
        let modifier = 0
        for (let affix of item.affixes) {
            if (affix.tag == 'heavy') {
                modifier += 5
            }
        } 
        return item.material.density * size(item) + modifier
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

        if (materials.index_to_material(ELODINO_FLESH).string_tag == (item.material.string_tag)) {
            result += 5
        }
        if (materials.index_to_material(GRACI_HAIR).string_tag == (item.material.string_tag)) {
            result += 5
        }

        return result;
    }

    export function melee_damage(item: Item, type: damage_type) {
        // summing up all affixes
        let affix_damage = new Damage()
        for (let i = 0; i < item.affixes.length; i++) {
            let affix = item.affixes[i];
            let effect = damage_affixes_effects[affix.tag]
            if (effect == undefined) continue
            affix_damage = effect(affix_damage);
        }

        // calculating base damage of item and adding affix
        let damage = new Damage()
        switch(type) {
            case 'blunt': {damage.blunt = ItemSystem.weight(item) * item.damage.blunt + affix_damage.blunt; break}
            case 'pierce': {
                damage.pierce = ItemSystem.weight(item) * item.damage.pierce + affix_damage.pierce;
                damage.blunt = Math.floor(ItemSystem.weight(item) * item.damage.blunt + affix_damage.blunt) / 10; break
            }
            case 'slice': {damage.slice = ItemSystem.weight(item) * item.damage.slice + affix_damage.slice; break}
        }

        const durability_mod = 0.3 + 0.7 * item.durability / 100
        DmgOps.mult_ip(damage, durability_mod)

        // fire damage is alwasys added
        damage.fire = item.damage.fire + affix_damage.fire

        // console.log(damage)
        return damage
    }

    export function ranged_damage(weapon: Item): Damage {
        // summing up all affixes
        let affix_damage = new Damage()
        for (let i = 0; i < weapon.affixes.length; i++) {
            let affix = weapon.affixes[i];
            let effect = damage_affixes_effects[affix.tag]
            if (effect == undefined) continue
            affix_damage = (affix_damage);
        }

        let damage = new Damage()
        if (weapon?.weapon_tag == 'ranged') {
            damage.pierce = Math.floor(50 * weapon.durability / 100)
            damage = DmgOps.add(damage, affix_damage)
            return damage
        }

        return damage

        damage.blunt = weight(weapon) * weapon.damage.blunt
        damage.pierce = weight(weapon) * weapon.damage.pierce
        damage.slice = weight(weapon) * weapon.damage.slice
        return damage
    }

    export function damage_breakdown(item: Item): Damage {
        let damage = DmgOps.copy(item.damage)

        DmgOps.mult_ip(damage, ItemSystem.weight(item))
        damage.fire = item.damage.fire

        for (let aff of item.affixes) {
            let effect = damage_affixes_effects[aff.tag]
            if (effect == undefined) continue
            damage = effect(damage)
        }

        let tmp = damage.fire

        const durability_mod = 0.3 + 0.7 * item.durability / 100
        DmgOps.mult_ip(damage, durability_mod)

        damage.fire = tmp

        return damage
    }

    export function resists(item:Item|undefined) {
        if (item == undefined) {return empty_resists}

        let result = DmgOps.copy(item.resists)     
        for (let i = 0; i < item.affixes.length; i++) {
            let affix = item.affixes[i];
            let f = protection_affixes_effects[affix.tag];
            if (f != undefined) {
                result = f(result);
            }
        }

        const durability_mod = 0.2 + 0.8 * item.durability / 100
        DmgOps.mult_ip(result, durability_mod)

        return result;
    }

    export function modify_attack(item: Item|undefined, attack: AttackObj) {
        if (item == undefined) return attack

        for (let i = 0; i < item.affixes.length; i++) {
            let affix = item.affixes[i];
            let f = attack_affixes_effects[affix.tag];
            if (f == undefined) continue
            
            f(attack);
        }

        return attack
    }

    export function item_data(item: Item):ItemData 
    export function item_data(item: undefined):undefined 
    export function item_data(item: Item|undefined):ItemData|undefined 
    export function item_data(item: Item|undefined):ItemData|undefined 
    {
        if (item == undefined) return undefined
        return {
            name: item.tag(),
            affixes: item.affixes.length, 
            affixes_list: item.affixes, 
            durability: item.durability,
            item_type: item.slot,
            damage: damage_breakdown(item),
            ranged_damage: DmgOps.total(ranged_damage(item)),
            resists: resists(item),
            // ranged_damage: ranged_damage(item)
            is_weapon: item.is_weapon()
        }
    }
}