"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterSystem = void 0;
const materials_manager_1 = require("../manager_classes/materials_manager");
const damage_types_1 = require("../damage_types");
const Damage_1 = require("../Damage");
const character_1 = require("./character");
const generate_loot_1 = require("../races/generate_loot");
const data_1 = require("../data");
const ai_manager_1 = require("../AI/ai_manager");
const basic_functions_1 = require("../calculations/basic_functions");
const effects_1 = require("../events/effects");
const scripted_values_1 = require("../events/scripted_values");
var ai_campaign_decision_timer = 0;
var character_state_update_timer = 0;
var CharacterSystem;
(function (CharacterSystem) {
    function template_to_character(template, name, cell_id) {
        data_1.Data.CharacterDB.increase_id();
        if (name == undefined)
            name = template.name_generator();
        let character = new character_1.Character(data_1.Data.CharacterDB.id(), -1, -1, '#', cell_id, name, template.archetype, template.stats, template.max_hp);
        character.stats.base_resists = damage_types_1.DmgOps.add(character.stats.base_resists, template.base_resists);
        data_1.Data.CharacterDB.set(data_1.Data.CharacterDB.id(), character);
        character.explored[cell_id] = true;
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
    function melee_damage_raw(character, type) {
        const weapon_damage = character.equip.get_melee_damage(type);
        if (weapon_damage != undefined) {
            if (character.perks.advanced_polearm) {
                if (CharacterSystem.weapon_type(character) == 'polearms') {
                    damage_types_1.DmgOps.mult_ip(weapon_damage, 1.5);
                }
            }
            return weapon_damage;
        }
        //handle case of unarmed
        const damage = new Damage_1.Damage();
        if (type == 'blunt') {
            if (character.perks.advanced_unarmed) {
                damage.blunt = 40;
            }
            else {
                damage.blunt = 15;
            }
        }
        if (type == 'slice') {
            if (character.perks.claws) {
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
    function ranged_skill(character) {
        let base = character.skills.ranged;
        const rage_mod = (100 - character.get_rage()) / 100;
        const stress_mod = (100 - character.get_stress()) / 100;
        return Math.round(base * rage_mod * stress_mod);
    }
    CharacterSystem.ranged_skill = ranged_skill;
    function phys_power(character) {
        let base = character.stats.stats.phys_power;
        base += character.skills.travelling / 30;
        base += character.skills.noweapon / 50;
        base += character.skills.fishing / 50;
        base += character.skills.ranged / 60;
        base += character.skills.woodwork / 40;
        base += (character.skills.onehand + character.skills.polearms + character.skills.twohanded) / 50;
        return Math.floor(base * character.equip.get_phys_power_modifier());
    }
    CharacterSystem.phys_power = phys_power;
    function magic_power(character) {
        let result = character.stats.stats.magic_power + character.equip.get_magic_power();
        if (character.perks.mage_initiation)
            result += 5;
        if (character.perks.magic_bolt)
            result += 3;
        if (character.perks.blood_mage) {
            const blood_mod = character.status.blood / 50;
            result = Math.round(result * (1 + blood_mod));
        }
        return result;
    }
    CharacterSystem.magic_power = magic_power;
    function enchant_rating(character) {
        let enchant_rating = CharacterSystem.magic_power(character) * (1 + character.skills.magic_mastery / 100);
        // so it's ~15 at 50 magic mastery
        // and 1 at 20 magic mastery
        if (character.perks.mage_initiation) {
            enchant_rating = enchant_rating * 2;
        }
        return enchant_rating;
    }
    CharacterSystem.enchant_rating = enchant_rating;
    function movement_speed_battle(character) {
        let speed = character.stats.stats.movement_speed;
        speed = speed * (2 - character.get_fatigue() / 100) * boots_speed_multiplier(character);
        return speed;
    }
    function movement_cost_battle(character) {
        return (2.5 / movement_speed_battle(character));
    }
    CharacterSystem.movement_cost_battle = movement_cost_battle;
    function boots_speed_multiplier(character) {
        let base = 0.75;
        if (character.equip.data.armour.foot != undefined) {
            base = base + character.equip.data.armour.foot.durability / 200;
        }
        return base;
    }
    CharacterSystem.boots_speed_multiplier = boots_speed_multiplier;
    function movement_duration_map(character) {
        let duration = 1;
        duration += character.get_fatigue() / 100;
        duration = duration / boots_speed_multiplier(character);
        duration = duration * (1 - character.skills.travelling / 200);
        return duration;
    }
    CharacterSystem.movement_duration_map = movement_duration_map;
    function attack_skill(character) {
        const weapon = character.equip.data.weapon;
        let skill = 0;
        if (weapon == undefined)
            skill = character.skills.noweapon;
        else
            skill = character.skills[weapon.weapon_tag];
        const rage_mod = (100 - character.get_rage()) / 100;
        const stress_mod = (100 - character.get_stress()) / 100;
        return Math.round(skill * rage_mod * stress_mod);
    }
    CharacterSystem.attack_skill = attack_skill;
    function resistance(character) {
        let result = character.stats.base_resists;
        result = damage_types_1.DmgOps.add(result, character.equip.resists());
        return result;
    }
    CharacterSystem.resistance = resistance;
    function weapon_type(character) {
        const weapon = character.equip.data.weapon;
        if (weapon == undefined)
            return 'noweapon';
        return weapon.weapon_tag;
    }
    CharacterSystem.weapon_type = weapon_type;
    function melee_weapon_type(character) {
        const weapon = character.equip.data.weapon;
        if (weapon == undefined)
            return 'noweapon';
        if (weapon.weapon_tag == 'ranged')
            return 'polearms';
        return weapon.weapon_tag;
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
        const loot = generate_loot_1.Loot.base(character.archetype.model);
        return loot;
    }
    CharacterSystem.rgo_check = rgo_check;
    function update(dt) {
        ai_campaign_decision_timer += dt;
        character_state_update_timer += dt;
        if (ai_campaign_decision_timer > 8) {
            for (let character of data_1.Data.CharacterDB.list()) {
                if (character.dead()) {
                    continue;
                }
                if (Math.random() > 0.6) {
                    ai_manager_1.CampaignAI.decision(character);
                }
            }
            ai_campaign_decision_timer = 0;
        }
        if (character_state_update_timer > 1) {
            for (let character of data_1.Data.CharacterDB.list()) {
                if (character.dead()) {
                    continue;
                }
                if (!character.in_battle()) {
                    effects_1.Effect.Change.rage(character, -1);
                    if (character.current_building != undefined) {
                        let building = data_1.Data.Buildings.from_id(character.current_building);
                        let tier = scripted_values_1.ScriptedValue.building_rest_tier(building.type, character);
                        let fatigue_target = scripted_values_1.ScriptedValue.rest_target_fatigue(tier, building.durability, character.race());
                        let stress_target = scripted_values_1.ScriptedValue.rest_target_stress(tier, building.durability, character.race());
                        if (fatigue_target < character.get_fatigue()) {
                            let fatigue_change = (0, basic_functions_1.trim)(-5, fatigue_target - character.get_fatigue(), 0);
                            effects_1.Effect.Change.fatigue(character, fatigue_change);
                        }
                        if (stress_target < character.get_stress()) {
                            let stress_change = (0, basic_functions_1.trim)(-5, stress_target - character.get_stress(), 0);
                            effects_1.Effect.Change.stress(character, stress_change);
                        }
                        if ((stress_target >= character.get_fatigue()) && (stress_target >= character.get_stress())) {
                            effects_1.Effect.leave_room(character.id);
                        }
                    }
                }
            }
            character_state_update_timer = 0;
        }
    }
    CharacterSystem.update = update;
    function battle_update(character) {
    }
    CharacterSystem.battle_update = battle_update;
})(CharacterSystem = exports.CharacterSystem || (exports.CharacterSystem = {}));
