"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemSystem = void 0;
const affix_1 = require("../../base_game_classes/affix");
const damage_types_1 = require("../../damage_types");
const Damage_1 = require("../../Damage");
const content_1 = require("@content/content");
const item_1 = require("../../../content_wrappers/item");
const empty_resists = new Damage_1.Damage();
var ItemSystem;
(function (ItemSystem) {
    function range(item) {
        return item.prototype.length;
    }
    ItemSystem.range = range;
    function slot(item) {
        if ((0, item_1.is_weapon)(item)) {
            return 0 /* EQUIP_SLOT.WEAPON */;
        }
        if ((0, item_1.is_armour)(item)) {
            return item.prototype.slot;
        }
        return 16 /* EQUIP_SLOT.NONE */;
    }
    ItemSystem.slot = slot;
    function weight(item) {
        let modifier = 0;
        for (let affix of item.affixes) {
            if (affix.tag == 'heavy') {
                modifier += 0.5;
            }
        }
        if ((0, item_1.is_weapon)(item)) {
            const material_impact = content_1.MaterialStorage.get(item.prototype.material);
            const material_handle = content_1.MaterialStorage.get(item.prototype.secondary_material);
            const weapon_type = content_1.ImpactStorage.get(item.prototype.impact);
            const ratio = weapon_type.handle_ratio;
            return item.prototype.size * (material_handle.density * ratio + material_impact.density * (1 - ratio));
        }
        if ((0, item_1.is_armour)(item)) {
            const main_material = content_1.MaterialStorage.get(item.prototype.material);
            const secondary_material = content_1.MaterialStorage.get(item.prototype.secondary_material);
            return main_material.density * item.prototype.size + secondary_material.density * item.prototype.secondary_size;
        }
        return 0;
    }
    ItemSystem.weight = weight;
    function power(item) {
        if (item == undefined)
            return 0;
        let result = 0;
        for (let i = 0; i < item.affixes.length; i++) {
            let affix = item.affixes[i];
            let f = affix_1.get_power[affix.tag];
            if (f != undefined) {
                result = f(result);
            }
        }
        result += item.prototype.magic_power;
        if ((0, item_1.is_weapon)(item)) {
            const material_impact = content_1.MaterialStorage.get(item.prototype.material);
            const material_handle = content_1.MaterialStorage.get(item.prototype.secondary_material);
            const weapon_type = content_1.ImpactStorage.get(item.prototype.impact);
            const ratio = weapon_type.handle_ratio;
            result += item.prototype.size * (material_handle.magic_power * ratio + material_impact.magic_power * (1 - ratio));
        }
        if ((0, item_1.is_armour)(item)) {
            const main_material = content_1.MaterialStorage.get(item.prototype.material);
            const secondary_material = content_1.MaterialStorage.get(item.prototype.secondary_material);
            result += main_material.magic_power * item.prototype.size + secondary_material.magic_power * item.prototype.secondary_size;
        }
        return result;
    }
    ItemSystem.power = power;
    function melee_damage(item, type) {
        // summing up all affixes
        let affix_damage = new Damage_1.Damage();
        for (let i = 0; i < item.affixes.length; i++) {
            let affix = item.affixes[i];
            let effect = affix_1.damage_affixes_effects[affix.tag];
            if (effect == undefined)
                continue;
            affix_damage = effect(affix_damage);
        }
        // calculating base damage of item and adding affix
        let damage = new Damage_1.Damage();
        const weight_item = weight(item);
        const impact = content_1.ImpactStorage.get(item.prototype.impact);
        const material = content_1.MaterialStorage.get(item.prototype.material);
        switch (type) {
            case 'blunt': {
                damage.blunt = weight_item * impact.blunt * 2 + affix_damage.blunt;
                damage.slice = material.cutting_power * weight_item * impact.slice + affix_damage.slice;
                break;
            }
            case 'pierce': {
                damage.pierce = material.cutting_power * 10 * impact.pierce + affix_damage.pierce;
                damage.blunt = (weight_item * impact.blunt + affix_damage.blunt) * 0.1;
                break;
            }
            case 'slice': {
                damage.blunt = weight_item * impact.blunt * 0.1 + affix_damage.blunt;
                damage.slice = material.cutting_power * weight_item * impact.slice + affix_damage.slice;
                break;
            }
        }
        const durability_mod = 0.5 + 0.5 * item.durability / 100;
        damage_types_1.DmgOps.mult_ip(damage, durability_mod);
        // fire damage is always added
        damage.fire = power(item) + affix_damage.fire;
        // console.log(damage)
        return damage;
    }
    ItemSystem.melee_damage = melee_damage;
    function ranged_damage(weapon, ammo) {
        // summing up all affixes
        let affix_damage = new Damage_1.Damage();
        for (let i = 0; i < weapon.affixes.length; i++) {
            let affix = weapon.affixes[i];
            let effect = affix_1.damage_affixes_effects[affix.tag];
            if (effect == undefined)
                continue;
            affix_damage = (affix_damage);
        }
        const damage = new Damage_1.Damage();
        const ammo_data = content_1.MaterialStorage.get(ammo);
        damage.pierce = weapon.prototype.bow_power * ammo_data.cutting_power + ammo_data.magic_power;
        damage_types_1.DmgOps.add_ip(damage, affix_damage);
        return damage;
    }
    ItemSystem.ranged_damage = ranged_damage;
    function damage_breakdown(item) {
        const damage = new Damage_1.Damage();
        damage.slice = damage_types_1.DmgOps.total(melee_damage(item, "slice"));
        damage.blunt = damage_types_1.DmgOps.total(melee_damage(item, "blunt"));
        damage.pierce = damage_types_1.DmgOps.total(melee_damage(item, "pierce"));
        damage.fire = power(item);
        return damage;
    }
    ItemSystem.damage_breakdown = damage_breakdown;
    function resists(item) {
        if (item == undefined) {
            return damage_types_1.DmgOps.copy(empty_resists);
        }
        let result = new Damage_1.Damage();
        const material = content_1.MaterialStorage.get(item.prototype.material);
        const material_secondary = content_1.MaterialStorage.get(item.prototype.secondary_material);
        result.blunt = material.blunt_protection * item.prototype.size + material_secondary.blunt_protection * item.prototype.secondary_material;
        result.pierce = material.penentration_protection * item.prototype.size + material_secondary.penentration_protection * item.prototype.secondary_material;
        result.slice = material.cutting_protection * item.prototype.size + material_secondary.cutting_protection * item.prototype.secondary_material;
        result.fire = material.magic_power * item.prototype.size + material_secondary.magic_power * item.prototype.secondary_material;
        for (let i = 0; i < item.affixes.length; i++) {
            let affix = item.affixes[i];
            let f = affix_1.protection_affixes_effects[affix.tag];
            if (f != undefined) {
                result = f(result);
            }
        }
        const durability_mod = 0.2 + 0.8 * item.durability / 100;
        damage_types_1.DmgOps.mult_ip(result, durability_mod);
        return result;
    }
    ItemSystem.resists = resists;
    function modify_attack(item, attack) {
        if (item == undefined)
            return attack;
        for (let i = 0; i < item.affixes.length; i++) {
            let affix = item.affixes[i];
            let f = affix_1.attack_affixes_effects[affix.tag];
            if (f == undefined)
                continue;
            f(attack);
        }
        return attack;
    }
    ItemSystem.modify_attack = modify_attack;
    function weapon_data(item) {
        return {
            id: item.id,
            name: item.prototype.name,
            prototype_id: item.prototype.id_string,
            affixes: item.affixes.length,
            affixes_list: item.affixes,
            durability: item.durability,
            item_type: 0 /* EQUIP_SLOT.WEAPON */,
            damage: damage_breakdown(item),
            ranged_damage: damage_types_1.DmgOps.total(ranged_damage(item, 0 /* MATERIAL.ARROW_BONE */)),
            resists: empty_resists,
            price: item.price,
            is_weapon: true,
        };
    }
    ItemSystem.weapon_data = weapon_data;
    function armour_data(item) {
        return {
            id: item.id,
            name: item.prototype.name,
            prototype_id: item.prototype.id_string,
            affixes: item.affixes.length,
            affixes_list: item.affixes,
            durability: item.durability,
            item_type: 0 /* EQUIP_SLOT.WEAPON */,
            damage: empty_resists,
            ranged_damage: 0,
            resists: resists(item),
            price: item.price,
            is_weapon: true,
        };
    }
    ItemSystem.armour_data = armour_data;
    function data(item) {
        if (item == undefined)
            return undefined;
        if ((0, item_1.is_armour)(item)) {
            return armour_data(item);
        }
        if ((0, item_1.is_weapon)(item)) {
            return weapon_data(item);
        }
    }
    ItemSystem.data = data;
})(ItemSystem = exports.ItemSystem || (exports.ItemSystem = {}));
