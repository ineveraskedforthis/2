"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemSystem = void 0;
const affix_1 = require("../base_game_classes/affix");
const damage_types_1 = require("../damage_types");
const Damage_1 = require("../Damage");
const item_1 = require("./item");
const materials_manager_1 = require("../manager_classes/materials_manager");
const base_values_1 = require("./base_values");
const empty_resists = new Damage_1.Damage();
const empty_status = {
    fatigue: 0,
    stress: 0,
    hp: 0,
    rage: 0,
    blood: 0
};
var ItemSystem;
(function (ItemSystem) {
    function create(item_desc, affixes, durability) {
        let item = new item_1.Item(durability, [], item_desc);
        for (let aff of affixes) {
            item.affixes.push(aff);
        }
        return item;
    }
    ItemSystem.create = create;
    function range(item) {
        return base_values_1.BaseRange[item.model_tag] || 1;
    }
    ItemSystem.range = range;
    function material(item) {
        return base_values_1.ModelToMaterial[item.model_tag];
    }
    ItemSystem.material = material;
    function slot(item) {
        return base_values_1.ModelToEquipSlot[item.model_tag];
    }
    ItemSystem.slot = slot;
    function weapon_tag(item) {
        return base_values_1.ModelToWeaponTag[item.model_tag] || 'noweapon';
    }
    ItemSystem.weapon_tag = weapon_tag;
    function size(item) {
        return (0, base_values_1.item_size)({ slot: base_values_1.ModelToEquipSlot[item.model_tag], weapon_tag: base_values_1.ModelToWeaponTag[item.model_tag] });
    }
    ItemSystem.size = size;
    function weight(item) {
        let modifier = 0;
        for (let affix of item.affixes) {
            if (affix.tag == 'heavy') {
                modifier += 0.5;
            }
        }
        return material(item).density * size(item) + modifier;
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
        if (materials_manager_1.materials.index_to_material(materials_manager_1.ELODINO_FLESH).string_tag == (material(item).string_tag)) {
            result += 5;
        }
        if (materials_manager_1.materials.index_to_material(materials_manager_1.GRACI_HAIR).string_tag == (material(item).string_tag)) {
            result += 5;
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
        let base_damage = base_values_1.BaseDamage[item.model_tag];
        if (base_damage == undefined) {
            base_damage = new Damage_1.Damage();
        }
        switch (type) {
            case 'blunt': {
                damage.blunt = ItemSystem.weight(item) * base_damage.blunt + affix_damage.blunt;
                break;
            }
            case 'pierce': {
                damage.pierce = ItemSystem.weight(item) * base_damage.pierce + affix_damage.pierce;
                damage.blunt = Math.floor(ItemSystem.weight(item) * base_damage.blunt + affix_damage.blunt) / 10;
                break;
            }
            case 'slice': {
                damage.slice = ItemSystem.weight(item) * base_damage.slice + affix_damage.slice;
                break;
            }
        }
        const durability_mod = 0.5 + 0.5 * item.durability / 100;
        damage_types_1.DmgOps.mult_ip(damage, durability_mod);
        // fire damage is always added
        damage.fire = base_damage.fire + affix_damage.fire;
        // console.log(damage)
        return damage;
    }
    ItemSystem.melee_damage = melee_damage;
    function ranged_damage(weapon) {
        // summing up all affixes
        let affix_damage = new Damage_1.Damage();
        for (let i = 0; i < weapon.affixes.length; i++) {
            let affix = weapon.affixes[i];
            let effect = affix_1.damage_affixes_effects[affix.tag];
            if (effect == undefined)
                continue;
            affix_damage = (affix_damage);
        }
        let damage = new Damage_1.Damage();
        let tag = base_values_1.ModelToWeaponTag[weapon.model_tag];
        if (tag == 'ranged') {
            damage.pierce = Math.floor(20 + weapon.durability / 10);
            damage = damage_types_1.DmgOps.add(damage, affix_damage);
            return damage;
        }
        return damage;
    }
    ItemSystem.ranged_damage = ranged_damage;
    function damage_breakdown(item) {
        let base = base_values_1.BaseDamage[item.model_tag];
        if (base == undefined) {
            base = new Damage_1.Damage();
        }
        let damage = damage_types_1.DmgOps.copy(base);
        damage_types_1.DmgOps.mult_ip(damage, ItemSystem.weight(item));
        damage.fire = base.fire;
        for (let aff of item.affixes) {
            let effect = affix_1.damage_affixes_effects[aff.tag];
            if (effect == undefined)
                continue;
            damage = effect(damage);
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
        let base = base_values_1.BaseResist[item.model_tag];
        if (base == undefined) {
            base = new Damage_1.Damage();
        }
        let result = damage_types_1.DmgOps.copy(base);
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
    function is_weapon(item) {
        return slot(item) == 'weapon';
    }
    ItemSystem.is_weapon = is_weapon;
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
    function item_data(item) {
        if (item == undefined)
            return undefined;
        return {
            name: item.model_tag,
            affixes: item.affixes.length,
            affixes_list: item.affixes,
            durability: item.durability,
            item_type: base_values_1.ModelToEquipSlot[item.model_tag],
            damage: damage_breakdown(item),
            ranged_damage: damage_types_1.DmgOps.total(ranged_damage(item)),
            resists: resists(item),
            price: item.price,
            // ranged_damage: ranged_damage(item)
            is_weapon: slot(item) == 'weapon'
        };
    }
    ItemSystem.item_data = item_data;
})(ItemSystem = exports.ItemSystem || (exports.ItemSystem = {}));
