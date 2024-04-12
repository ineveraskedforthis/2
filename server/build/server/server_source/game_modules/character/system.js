"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterSystem = void 0;
const materials_manager_1 = require("../manager_classes/materials_manager");
const damage_types_1 = require("../damage_types");
const Damage_1 = require("../Damage");
const generate_loot_1 = require("../races/generate_loot");
const ai_manager_1 = require("../AI/ai_manager");
const basic_functions_1 = require("../calculations/basic_functions");
const effects_1 = require("../events/effects");
const SkillList_1 = require("./SkillList");
const stats_1 = require("../races/stats");
const resists_1 = require("../races/resists");
const system_1 = require("../items/system");
const data_objects_1 = require("../data/data_objects");
var ai_campaign_decision_timer = 0;
var character_state_update_timer = 0;
var CharacterSystem;
(function (CharacterSystem) {
    function template_to_character(template, name, location) {
        if (name == undefined)
            name = template.name_generator();
        const character = data_objects_1.Data.Characters.create(location, name, template);
        character.explored[character.cell_id] = true;
        for (const cell_id of data_objects_1.Data.World.neighbours(character.cell_id)) {
            character.explored[cell_id] = true;
        }
        return character;
    }
    CharacterSystem.template_to_character = template_to_character;
    function transfer_savings(A, B, x) {
        A.savings.transfer(B.savings, x);
    }
    CharacterSystem.transfer_savings = transfer_savings;
    function transfer_stash(A, B, what, amount) {
        A.stash.transfer(B.stash, what, amount);
    }
    CharacterSystem.transfer_stash = transfer_stash;
    function to_trade_stash(A, material, amount) {
        if (amount > 0) {
            if (A.stash.get(material) < amount)
                return false;
            A.stash.transfer(A.trade_stash, material, amount);
            return true;
        }
        if (amount < 0) {
            if (A.trade_stash.get(material) < -amount)
                return false;
            A.trade_stash.transfer(A.stash, material, -amount);
            return true;
        }
        return true;
    }
    CharacterSystem.to_trade_stash = to_trade_stash;
    function to_trade_savings(A, amount) {
        if (amount > 0) {
            if (A.savings.get() < amount)
                return false;
            A.savings.transfer(A.trade_savings, amount);
            return true;
        }
        if (amount < 0) {
            if (A.trade_savings.get() < -amount)
                return false;
            A.trade_savings.transfer(A.savings, -amount);
            return true;
        }
        return true;
    }
    CharacterSystem.to_trade_savings = to_trade_savings;
    function transaction(A, B, savings_A_to_B, stash_A_to_B, savings_B_to_A, stash_B_to_A) {
        // transaction validation
        if (A.savings.get() < savings_A_to_B)
            return false;
        if (B.savings.get() < savings_B_to_A)
            return false;
        for (let material of materials_manager_1.materials.get_materials_list()) {
            if (A.stash.get(material) < stash_A_to_B.get(material))
                return false;
            if (B.stash.get(material) < stash_B_to_A.get(material))
                return false;
        }
        //transaction is validated, execution
        A.savings.transfer(B.savings, savings_A_to_B);
        B.savings.transfer(A.savings, savings_B_to_A);
        for (let material of materials_manager_1.materials.get_materials_list()) {
            A.stash.transfer(B.stash, material, stash_A_to_B.get(material));
            B.stash.transfer(A.stash, material, stash_B_to_A.get(material));
        }
        return true;
    }
    CharacterSystem.transaction = transaction;
    function pure_skill(character, skill) {
        let result = character._skills[skill];
        if (result == undefined) {
            result = 0;
        }
        return result;
    }
    CharacterSystem.pure_skill = pure_skill;
    function skill(character, skill) {
        let result = character._skills[skill];
        if (result == undefined) {
            result = 0;
        }
        let location = data_objects_1.Data.Locations.from_id(character.location_id);
        if (location.has_cooking_tools && skill == 'cooking') {
            result = (result + 5) * 1.2;
        }
        if (location.has_bowmaking_tools && skill == 'woodwork') {
            result = (result + 5) * 1.2;
        }
        if (location.has_clothier_tools && skill == 'clothier') {
            result = (result + 5) * 1.2;
        }
        if (skill == 'ranged') {
            const rage_mod = (100 - character.get_rage()) / 100;
            const stress_mod = (100 - character.get_stress()) / 100;
            const fatigue_mod = (100 - character.get_fatigue()) / 100;
            result = result * rage_mod * stress_mod * fatigue_mod;
        }
        if ((0, SkillList_1.is_melee_skill)(skill)) {
            const rage_mod = (100 - character.get_rage()) / 100;
            const stress_mod = (100 - character.get_stress()) / 100;
            const fatigue_mod = (100 - character.get_fatigue()) / 100;
            result = result * rage_mod * stress_mod * fatigue_mod;
        }
        return (0, basic_functions_1.trim)(Math.round(result), 0, 100);
    }
    CharacterSystem.skill = skill;
    function melee_damage_raw(character, type) {
        const weapon_damage = character.equip.get_melee_damage(type);
        if (weapon_damage != undefined) {
            if (character._perks.advanced_polearm) {
                if (CharacterSystem.weapon_type(character) == 'polearms') {
                    damage_types_1.DmgOps.mult_ip(weapon_damage, 1.2);
                }
            }
            return weapon_damage;
        }
        //handle case of unarmed
        const damage = new Damage_1.Damage();
        if (type == 'blunt') {
            if (character._perks.advanced_unarmed) {
                damage.blunt = 40;
            }
            else {
                damage.blunt = 15;
            }
        }
        if (type == 'slice') {
            if (character._traits.claws) {
                damage.slice = 20;
            }
            else {
                damage.slice = 2;
            }
        }
        if (type == 'pierce') {
            damage.pierce = 0;
        }
        return damage;
    }
    CharacterSystem.melee_damage_raw = melee_damage_raw;
    function ranged_damage_raw(character) {
        const damage = character.equip.get_ranged_damage();
        if (damage != undefined)
            return damage;
        return new Damage_1.Damage();
    }
    CharacterSystem.ranged_damage_raw = ranged_damage_raw;
    function base_phys_power(character) {
        return stats_1.BaseStats[character.stats].phys_power;
    }
    CharacterSystem.base_phys_power = base_phys_power;
    function phys_power(character) {
        let base = base_phys_power(character);
        base += skill(character, 'travelling') / 30;
        base += skill(character, 'noweapon') / 50;
        base += skill(character, 'fishing') / 50;
        base += skill(character, 'ranged') / 60;
        base += skill(character, 'woodwork') / 40;
        base += (skill(character, 'onehand') + skill(character, 'polearms') + skill(character, 'twohanded')) / 50;
        return Math.floor(base * character.equip.get_phys_power_modifier());
    }
    CharacterSystem.phys_power = phys_power;
    function base_magic_power(character) {
        return stats_1.BaseStats[character.stats].magic_power;
    }
    CharacterSystem.base_magic_power = base_magic_power;
    function magic_power(character) {
        let result = base_magic_power(character) + character.equip.get_magic_power();
        if (character._perks.mage_initiation)
            result += 5;
        if (character._perks.magic_bolt)
            result += 3;
        if (character._perks.blood_mage) {
            const blood_mod = character.status.blood / 50;
            result = Math.round(result * (1 + blood_mod));
        }
        return result;
    }
    CharacterSystem.magic_power = magic_power;
    function perk(character, tag) {
        return character._perks[tag] == true;
    }
    CharacterSystem.perk = perk;
    function enchant_rating(character) {
        let enchant_rating = CharacterSystem.magic_power(character) * (1 + skill(character, 'magic_mastery') / 100);
        // so it's ~15 at 50 magic mastery
        // and 1 at 20 magic mastery
        if (character._perks.mage_initiation) {
            enchant_rating = enchant_rating * 2;
        }
        return enchant_rating;
    }
    CharacterSystem.enchant_rating = enchant_rating;
    function movement_speed_battle(character) {
        let speed = stats_1.BaseStats[character.stats].movement_speed;
        speed = speed * (2 - character.get_fatigue() / 100) * boots_speed_multiplier(character);
        return speed;
    }
    function movement_cost_battle(character) {
        return (2.5 / movement_speed_battle(character));
    }
    CharacterSystem.movement_cost_battle = movement_cost_battle;
    function boots_speed_multiplier(character) {
        let base = 0.75;
        if (character.equip.data.slots.boots != undefined) {
            base = base + character.equip.data.slots.boots.durability / 200;
        }
        return base;
    }
    CharacterSystem.boots_speed_multiplier = boots_speed_multiplier;
    function movement_duration_map(character) {
        let duration = 1;
        duration += character.get_fatigue() / 100;
        duration = duration / boots_speed_multiplier(character);
        duration = duration * (1 - skill(character, 'travelling') / 200);
        return duration;
    }
    CharacterSystem.movement_duration_map = movement_duration_map;
    function attack_skill(character) {
        return skill(character, melee_weapon_type(character));
    }
    CharacterSystem.attack_skill = attack_skill;
    function resistance(character) {
        let result = resists_1.BaseResists[character.resists];
        result = damage_types_1.DmgOps.add(result, character.equip.resists());
        return result;
    }
    CharacterSystem.resistance = resistance;
    function weapon_type(character) {
        const weapon = character.equip.data.slots.weapon;
        if (weapon == undefined)
            return 'noweapon';
        return system_1.ItemSystem.weapon_tag(weapon) || 'noweapon';
    }
    CharacterSystem.weapon_type = weapon_type;
    function melee_weapon_type(character) {
        const weapon = character.equip.data.slots.weapon;
        if (weapon == undefined)
            return 'noweapon';
        if (system_1.ItemSystem.weapon_tag(weapon) == 'ranged')
            return 'polearms';
        return system_1.ItemSystem.weapon_tag(weapon) || 'noweapon';
    }
    CharacterSystem.melee_weapon_type = melee_weapon_type;
    /**
     * Damages character, accounting for resistances
     * @param character Damaged character
     * @param damage damage
     * @returns total damage dealt
     */
    function damage(character, damage) {
        let total = 0;
        let resistance = CharacterSystem.resistance(character);
        for (let tag of damage_types_1.damage_types) {
            const damage_curr = (0, basic_functions_1.trim)(damage[tag] - resistance[tag], 0, 100000);
            character.change_hp(-damage_curr);
            total += damage_curr;
        }
        return total;
    }
    CharacterSystem.damage = damage;
    function transfer_all(origin, target) {
        origin.stash.transfer_all(target.stash);
        origin.savings.transfer_all(target.savings);
        origin.equip.transfer_all(target);
    }
    CharacterSystem.transfer_all = transfer_all;
    function rgo_check(character) {
        const loot = generate_loot_1.Loot.base(character.model);
        return loot;
    }
    CharacterSystem.rgo_check = rgo_check;
    function update(dt) {
        ai_campaign_decision_timer += dt;
        character_state_update_timer += dt;
        if (ai_campaign_decision_timer > 8) {
            data_objects_1.Data.Characters.for_each((character) => {
                if (character.dead()) {
                    return;
                }
                if (Math.random() > 0.6) {
                    ai_manager_1.CampaignAI.decision(character);
                }
            });
            ai_campaign_decision_timer = 0;
        }
        if (character_state_update_timer > 1) {
            data_objects_1.Data.Characters.for_each((character) => {
                if (character.dead()) {
                    return;
                }
                if (!character.in_battle()) {
                    effects_1.Effect.Change.rage(character, -1);
                    effects_1.Effect.rest_location_tick(character);
                    effects_1.Effect.spoilage(character, materials_manager_1.MEAT, 0.01);
                    effects_1.Effect.spoilage(character, materials_manager_1.FISH, 0.01);
                    effects_1.Effect.spoilage(character, materials_manager_1.FOOD, 0.001);
                }
            });
            character_state_update_timer = 0;
        }
    }
    CharacterSystem.update = update;
    function battle_update(character) {
    }
    CharacterSystem.battle_update = battle_update;
})(CharacterSystem = exports.CharacterSystem || (exports.CharacterSystem = {}));
