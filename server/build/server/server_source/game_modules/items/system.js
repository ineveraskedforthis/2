"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemSystem = void 0;
const affix_1 = require("../base_game_classes/affix");
const damage_types_1 = require("../misc/damage_types");
const item_1 = require("./item");
const materials_manager_1 = require("../manager_classes/materials_manager");
const empty_resists = new damage_types_1.Damage();
var ItemSystem;
(function (ItemSystem) {
    function to_string(item) {
        return (JSON.stringify(item));
    }
    ItemSystem.to_string = to_string;
    function from_string(s) {
        const item_data = JSON.parse(s);
        let damage = damage_types_1.DmgOps.copy(item_data.damage);
        let resistance = damage_types_1.DmgOps.copy(item_data.resists);
        return new item_1.Item(item_data.durability, item_data.affixes, item_data.slot, item_data.range, item_data.material, item_data.weapon_tag, item_data.model_tag, resistance, damage);
    }
    ItemSystem.from_string = from_string;
    function size(item) {
        if (item.slot == 'weapon') {
            switch (item.weapon_tag) {
                case 'onehand':
                    return 1;
                case 'polearms':
                    return 2;
                case 'ranged':
                    return 1;
                case 'twohanded':
                    return 3;
            }
        }
        switch (item.slot) {
            case 'arms': return 1;
            case 'foot': return 1;
            case 'head': return 1;
            case 'legs': return 3;
            case 'body': return 5;
        }
        // return 1
    }
    ItemSystem.size = size;
    function create(item_desc) {
        let item = new item_1.Item(item_desc.durability, [], item_desc.slot, item_desc.range, item_desc.material, item_desc.weapon_tag, item_desc.model_tag, item_desc.resists, item_desc.damage);
        for (let aff of item_desc.affixes) {
            item.affixes.push(aff);
        }
        return item;
    }
    ItemSystem.create = create;
    function weight(item) {
        let modifier = 0;
        for (let affix of item.affixes) {
            if (affix.tag == 'heavy') {
                modifier += 5;
            }
        }
        return item.material.density * size(item) + modifier;
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
        if (materials_manager_1.materials.index_to_material(materials_manager_1.ELODINO_FLESH).string_tag == (item.material.string_tag)) {
            result += 5;
        }
        if (materials_manager_1.materials.index_to_material(materials_manager_1.GRACI_HAIR).string_tag == (item.material.string_tag)) {
            result += 5;
        }
        return result;
    }
    ItemSystem.power = power;
    function melee_damage(item, type) {
        // summing up all affixes
        let affix_damage = new damage_types_1.Damage();
        for (let i = 0; i < item.affixes.length; i++) {
            let affix = item.affixes[i];
            affix_damage = affix_1.damage_affixes_effects[affix.tag](affix_damage);
        }
        // calculating base damage of item and adding affix
        let damage = new damage_types_1.Damage();
        switch (type) {
            case 'blunt': {
                damage.blunt = ItemSystem.weight(item) * item.damage.blunt + affix_damage.blunt;
                break;
            }
            case 'pierce': {
                damage.pierce = ItemSystem.weight(item) * item.damage.pierce + affix_damage.pierce;
                break;
            }
            case 'slice': {
                damage.slice = ItemSystem.weight(item) * item.damage.slice + affix_damage.slice;
                break;
            }
        }
        const durability_mod = 0.3 + 0.7 * item.durability / 100;
        damage_types_1.DmgOps.mult_ip(damage, durability_mod);
        // fire damage is alwasys added
        damage.fire = item.damage.fire + affix_damage.fire;
        console.log(damage);
        return damage;
    }
    ItemSystem.melee_damage = melee_damage;
    function ranged_damage(weapon) {
        // summing up all affixes
        let affix_damage = new damage_types_1.Damage();
        for (let i = 0; i < weapon.affixes.length; i++) {
            let affix = weapon.affixes[i];
            affix_damage = affix_1.damage_affixes_effects[affix.tag](affix_damage);
        }
        let damage = new damage_types_1.Damage();
        if (weapon?.weapon_tag == 'ranged') {
            damage.pierce = 10;
            damage = damage_types_1.DmgOps.add(damage, affix_damage);
            return damage;
        }
        damage.blunt = weight(weapon) * weapon.damage.blunt;
        damage.pierce = weight(weapon) * weapon.damage.pierce;
        damage.slice = weight(weapon) * weapon.damage.slice;
        return damage;
    }
    ItemSystem.ranged_damage = ranged_damage;
    function damage_breakdown(item) {
        let damage = damage_types_1.DmgOps.copy(item.damage);
        damage_types_1.DmgOps.mult_ip(damage, ItemSystem.weight(item));
        damage.fire = item.damage.fire;
        for (let aff of item.affixes) {
            damage = affix_1.damage_affixes_effects[aff.tag](damage);
        }
        let tmp = damage.fire;
        const durability_mod = 0.3 + 0.7 * item.durability / 100;
        damage_types_1.DmgOps.mult_ip(damage, durability_mod);
        damage.fire = tmp;
        return damage;
    }
    ItemSystem.damage_breakdown = damage_breakdown;
    function resists(item) {
        if (item == undefined) {
            return empty_resists;
        }
        let result = damage_types_1.DmgOps.copy(item.resists);
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
    function item_data(item) {
        if (item == undefined)
            return undefined;
        return {
            name: item.tag(),
            affixes: item.affixes.length,
            affixes_list: item.affixes,
            durability: item.durability,
            item_type: item.slot,
            damage: damage_breakdown(item),
            resists: resists(item),
            // ranged_damage: ranged_damage(item)
            is_weapon: item.is_weapon()
        };
    }
    ItemSystem.item_data = item_data;
})(ItemSystem = exports.ItemSystem || (exports.ItemSystem = {}));
