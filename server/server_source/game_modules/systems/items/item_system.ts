import { melee_attack_type } from "@custom_types/common";
import { attack_affixes_effects, damage_affixes_effects, get_power, protection_affixes_effects } from "../../base_game_classes/affix";
import { DmgOps } from "../../damage_types";
import { Damage } from "../../Damage";
import { Armour, EquipmentPiece, Item, Weapon } from "../../data/entities/item";
import { Status } from "../../types";
import { AttackObj } from "../../attack/class";
import { EQUIP_SLOT, ImpactStorage, MATERIAL, MaterialStorage } from "@content/content";
import { is_armour, is_weapon } from "../../../content_wrappers/item";
import { ItemData } from "@custom_types/inventory";

const empty_resists = new Damage()

export namespace ItemSystem {
    export function range(item: Weapon): number {
        return item.prototype.length
    }

    export function slot(item: EquipmentPiece): EQUIP_SLOT {
        if (is_weapon(item)) {
            return EQUIP_SLOT.WEAPON
        }
        if (is_armour(item)) {
            return item.prototype.slot
        }
        return EQUIP_SLOT.NONE
    }


    export function weight(item: EquipmentPiece) {
        let modifier = 0
        for (let affix of item.affixes) {
            if (affix.tag == 'heavy') {
                modifier += 0.5
            }
        }

        if (is_weapon(item)) {
            const material_impact = MaterialStorage.get(item.prototype.material)
            const material_handle = MaterialStorage.get(item.prototype.secondary_material)
            const weapon_type = ImpactStorage.get(item.prototype.impact)
            const ratio = weapon_type.handle_ratio

            return item.prototype.size * (material_handle.density * ratio + material_impact.density * (1 - ratio))
        }

        if (is_armour(item)) {
            const main_material = MaterialStorage.get(item.prototype.material)
            const secondary_material = MaterialStorage.get(item.prototype.secondary_material)

            return main_material.density * item.prototype.size + secondary_material.density * item.prototype.secondary_size
        }

        return 0
    }

    export function power(item:EquipmentPiece|undefined) {
        if (item == undefined) return 0;

        let result = 0
        for (let i = 0; i < item.affixes.length; i++) {
            let affix = item.affixes[i];
            let f = get_power[affix.tag];
            if (f != undefined) {
                result = f(result);
            }
        }

        result += item.prototype.magic_power

        if (is_weapon(item)) {
            const material_impact = MaterialStorage.get(item.prototype.material)
            const material_handle = MaterialStorage.get(item.prototype.secondary_material)
            const weapon_type = ImpactStorage.get(item.prototype.impact)
            const ratio = weapon_type.handle_ratio

            result += item.prototype.size * (material_handle.magic_power * ratio + material_impact.magic_power * (1 - ratio))
        }

        if (is_armour(item)) {
            const main_material = MaterialStorage.get(item.prototype.material)
            const secondary_material = MaterialStorage.get(item.prototype.secondary_material)

            result += main_material.magic_power * item.prototype.size + secondary_material.magic_power * item.prototype.secondary_size
        }

        return result;
    }

    export function melee_damage(item: Weapon, type: melee_attack_type) {
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

        const weight_item = weight(item)
        const impact = ImpactStorage.get(item.prototype.impact)
        const material = MaterialStorage.get(item.prototype.material)

        switch(type) {
            case 'blunt': {
                damage.blunt = weight_item * impact.blunt * 2 + affix_damage.blunt;
                damage.slice = material.cutting_power * weight_item * impact.slice + affix_damage.slice;
                break;
            } case 'pierce': {
                damage.pierce = material.cutting_power * 10 *  impact.pierce + affix_damage.pierce;
                damage.blunt = (weight_item * impact.blunt + affix_damage.blunt) * 0.1;
                break;
            } case 'slice': {
                damage.blunt = weight_item * impact.blunt * 0.1 + affix_damage.blunt;
                damage.slice = material.cutting_power * weight_item * impact.slice + affix_damage.slice;
                break;
            }
        }

        const durability_mod = 0.5 + 0.5 * item.durability / 100
        DmgOps.mult_ip(damage, durability_mod)

        // fire damage is always added
        damage.fire = power(item) + affix_damage.fire

        // console.log(damage)
        return damage
    }

    export function ranged_damage(weapon: Weapon, ammo: MATERIAL): Damage {
        // summing up all affixes
        let affix_damage = new Damage()
        for (let i = 0; i < weapon.affixes.length; i++) {
            let affix = weapon.affixes[i];
            let effect = damage_affixes_effects[affix.tag]
            if (effect == undefined) continue
            affix_damage = (affix_damage);
        }

        const damage = new Damage()
        const ammo_data = MaterialStorage.get(ammo)

        damage.pierce = weapon.prototype.bow_power * ammo_data.cutting_power + ammo_data.magic_power
        DmgOps.add_ip(damage, affix_damage)

        return damage
    }

    export function damage_breakdown(item: Weapon): Damage {
        const damage = new Damage()

        damage.slice = DmgOps.total(melee_damage(item, "slice"))
        damage.blunt = DmgOps.total(melee_damage(item, "blunt"))
        damage.pierce = DmgOps.total(melee_damage(item, "pierce"))
        damage.fire = power(item)

        return damage
    }

    export function resists(item:Armour|undefined) {
        if (item == undefined) {return DmgOps.copy(empty_resists)}

        let result = new Damage()

        const material = MaterialStorage.get(item.prototype.material)
        const material_secondary = MaterialStorage.get(item.prototype.secondary_material)

        result.blunt = material.blunt_protection * item.prototype.size + material_secondary.blunt_protection * item.prototype.secondary_material
        result.pierce = material.penentration_protection * item.prototype.size + material_secondary.penentration_protection * item.prototype.secondary_material
        result.slice = material.cutting_protection * item.prototype.size + material_secondary.cutting_protection * item.prototype.secondary_material
        result.fire = material.magic_power * item.prototype.size + material_secondary.magic_power * item.prototype.secondary_material

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

    export function weapon_data(item: Weapon):ItemData
    {
        return {
            id: item.id,
            name: item.prototype.name,
            prototype_id: item.prototype.id_string,
            affixes: item.affixes.length,
            affixes_list: item.affixes,
            durability: item.durability,
            item_type: EQUIP_SLOT.WEAPON,
            damage: damage_breakdown(item),
            ranged_damage: DmgOps.total(ranged_damage(item, MATERIAL.ARROW_BONE)),
            resists: empty_resists,
            price: item.price,
            is_weapon: true,
        }
    }

    export function armour_data(item: Armour):ItemData
    {
        return {
            id: item.id,
            name: item.prototype.name,
            prototype_id: item.prototype.id_string,
            affixes: item.affixes.length,
            affixes_list: item.affixes,
            durability: item.durability,
            item_type: EQUIP_SLOT.WEAPON,
            damage: empty_resists,
            ranged_damage: 0,
            resists: resists(item),
            price: item.price,
            is_weapon: true,
        }
    }

    export function data(item: EquipmentPiece):ItemData
    export function data(item: undefined):undefined
    export function data(item: EquipmentPiece|undefined):ItemData|undefined
    export function data(item: EquipmentPiece|undefined):ItemData|undefined
    {
        if (item == undefined) return undefined

        if (is_armour(item)) {
            return armour_data(item)
        }

        if (is_weapon(item)) {
            return weapon_data(item)
        }
    }

}