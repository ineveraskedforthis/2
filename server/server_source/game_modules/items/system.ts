import { ItemData, affix } from "../../../../shared/inventory";
import { damage_type } from "@custom_types/common";
import { attack_affixes_effects, damage_affixes_effects, get_power, protection_affixes_effects } from "../base_game_classes/affix";
import { DmgOps } from "../damage_types";
import { Damage } from "../Damage";
import { Item } from "./item";
import { ItemJson } from "@custom_types/inventory";
import { ELODINO_FLESH, GRACI_HAIR, materials, MaterialsManager } from "../manager_classes/materials_manager";
import { Status } from "../types";
import { AttackObj } from "../attack/class";
import { BaseDamage, BaseRange, BaseResist, ModelToEquipSlot, ModelToMaterial, ModelToWeaponTag, item_size } from "./base_values";
import { item_model_tag } from "./model_tags";

const empty_resists = new Damage()
const empty_status : Status = {
    fatigue: 0,
    stress: 0,
    hp: 0,
    rage: 0,
    blood: 0
}

export namespace ItemSystem {
    export function create (item_desc: item_model_tag, affixes: affix[], durability: number) {
        let item = new Item(durability, [], item_desc)
        for (let aff of affixes) {
            item.affixes.push(aff)
        }
        return item
    }

    export function range(item: {model_tag: item_model_tag}) {
        return BaseRange[item.model_tag] || 1
    }

    export function material(item: {model_tag: item_model_tag}) {
        return ModelToMaterial[item.model_tag]
    }

    export function slot(item: {model_tag: item_model_tag}) {
        return ModelToEquipSlot[item.model_tag]
    }

    export function weapon_tag(item: Item) {
        return ModelToWeaponTag[item.model_tag]||'noweapon'
    }

    export function size(item: Item) {
        return item_size({slot: ModelToEquipSlot[item.model_tag], weapon_tag: ModelToWeaponTag[item.model_tag]})
    }

    export function weight(item: Item) {
        let modifier = 0
        for (let affix of item.affixes) {
            if (affix.tag == 'heavy') {
                modifier += 0.5
            }
        }
        return material(item).density * size(item) + modifier
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

        if (materials.index_to_material(ELODINO_FLESH).string_tag == (material(item).string_tag)) {
            result += 5
        }
        if (materials.index_to_material(GRACI_HAIR).string_tag == (material(item).string_tag)) {
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
        let base_damage = BaseDamage[item.model_tag]
        if (base_damage == undefined) {
            base_damage = new Damage()
        }
        switch(type) {
            case 'blunt': {damage.blunt = ItemSystem.weight(item) * base_damage.blunt + affix_damage.blunt; break}
            case 'pierce': {
                damage.pierce = ItemSystem.weight(item) * base_damage.pierce + affix_damage.pierce;
                damage.blunt = Math.floor(ItemSystem.weight(item) * base_damage.blunt + affix_damage.blunt) / 10; break
            }
            case 'slice': {damage.slice = ItemSystem.weight(item) * base_damage.slice + affix_damage.slice; break}
        }

        const durability_mod = 0.5 + 0.5 * item.durability / 100
        DmgOps.mult_ip(damage, durability_mod)

        // fire damage is always added
        damage.fire = base_damage.fire + affix_damage.fire

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
        let tag = ModelToWeaponTag[weapon.model_tag]
        if (tag == 'ranged') {
            damage.pierce = Math.floor(20 + weapon.durability / 10)
            damage = DmgOps.add(damage, affix_damage)
            return damage
        }
        return damage
    }

    export function damage_breakdown(item: Item): Damage {
        let base = BaseDamage[item.model_tag]
        if (base == undefined) {
            base = new Damage()
        }
        let damage = DmgOps.copy(base)

        DmgOps.mult_ip(damage, ItemSystem.weight(item))
        damage.fire = base.fire

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
        let base = BaseResist[item.model_tag]
        if (base == undefined) {
            base = new Damage()
        }
        let result = DmgOps.copy(base)
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

    export function is_weapon(item: Item) {
        return slot(item) == 'weapon'
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
            name: item.model_tag,
            affixes: item.affixes.length,
            affixes_list: item.affixes,
            durability: item.durability,
            item_type: ModelToEquipSlot[item.model_tag],
            damage: damage_breakdown(item),
            ranged_damage: DmgOps.total(ranged_damage(item)),
            resists: resists(item),
            price: item.price,
            // ranged_damage: ranged_damage(item)
            is_weapon: slot(item) == 'weapon',
        }
    }
}