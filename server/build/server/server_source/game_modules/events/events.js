"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const battle_calcs_1 = require("../battle/battle_calcs");
const basic_functions_1 = require("../calculations/basic_functions");
const system_1 = require("../attack/system");
const generate_loot_1 = require("../races/generate_loot");
// import { Perks } from "../character/Perks";
const perk_requirement_1 = require("../character/perk_requirement");
const perk_base_price_1 = require("../prices/perk_base_price");
const system_2 = require("../character/system");
const alerts_1 = require("../client_communication/network_actions/alerts");
const user_manager_1 = require("../client_communication/user_manager");
const data_1 = require("../data");
const materials_manager_1 = require("../manager_classes/materials_manager");
const systems_communication_1 = require("../systems_communication");
const effects_1 = require("./effects");
const inventory_events_1 = require("./inventory_events");
const market_1 = require("./market");
const damage_types_1 = require("../damage_types");
const scripted_values_1 = require("./scripted_values");
// import { BuildingType } from "../DATA_LAYOUT_BUILDING";
const helpers_1 = require("../craft/helpers");
const triggers_1 = require("./triggers");
const SYSTEM_REPUTATION_1 = require("../SYSTEM_REPUTATION");
const GRAVEYARD_CELL = 0;
var Event;
(function (Event) {
    function buy_perk(student, perk, teacher) {
        let savings = student.savings.get();
        let price = (0, perk_base_price_1.perk_price)(perk, student, teacher);
        if (savings < price) {
            alerts_1.Alerts.not_enough_to_character(student, 'money', savings, price, undefined);
            return;
        }
        let responce = (0, perk_requirement_1.perk_requirement)(perk, student);
        if (responce != 'ok') {
            alerts_1.Alerts.generic_character_alert(student, 'alert', responce);
            return;
        }
        effects_1.Effect.Transfer.savings(student, teacher, price);
        effects_1.Effect.learn_perk(student, perk);
    }
    Event.buy_perk = buy_perk;
    function buy_skill(student, skill, teacher) {
        let response = triggers_1.Trigger.can_learn_from(student, teacher, skill);
        if (response.response == 'ok') {
            effects_1.Effect.Transfer.savings(student, teacher, response.price);
            effects_1.Effect.Change.skill(student, skill, 1);
        }
        else {
            alerts_1.Alerts.not_enough_to_character(student, response.response, response.current_quantity, response.min_quantity, response.max_quantity);
        }
    }
    Event.buy_skill = buy_skill;
    function move(character, new_cell_id) {
        const old_cell_id = character.cell_id;
        effects_1.Effect.leave_room(character.id);
        systems_communication_1.Link.character_and_cell(character.id, new_cell_id);
        move_fatigue_change(character);
        let probability = move_durability_roll_probability(old_cell_id);
        move_durability_roll(character, probability);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 1 /* UI_Part.STATUS */);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 7 /* UI_Part.MAP */);
        let user = systems_communication_1.Convert.character_to_user(character);
        if (user == undefined)
            return;
        let new_cell = data_1.Data.Cells.from_id(new_cell_id);
        alerts_1.Alerts.log_to_user(user, 'rat scent ' + new_cell.rat_scent);
    }
    Event.move = move;
    function move_durability_roll_probability(cell) {
        let probability = 0.5;
        let urbanisation = data_1.Data.Cells.urbanisation(cell);
        let forestation = data_1.Data.Cells.forestation(cell);
        if (forestation > 100)
            probability += 0.1;
        if (forestation > 300)
            probability += 0.1;
        if (urbanisation > 4)
            probability -= 0.2;
        if (urbanisation > 0)
            probability -= 0.1;
        return probability;
    }
    Event.move_durability_roll_probability = move_durability_roll_probability;
    function move_fatigue_change(character) {
        if (character.equip.data.armour.foot == undefined) {
            effects_1.Effect.Change.fatigue(character, 3);
        }
        else {
            const durability = character.equip.data.armour.foot.durability;
            effects_1.Effect.Change.fatigue(character, Math.round((0, basic_functions_1.trim)(3 - 2 * (durability / 100), 1, 3)));
        }
    }
    Event.move_fatigue_change = move_fatigue_change;
    function move_durability_roll(character, probability) {
        const dice = Math.random();
        if (dice < probability) {
            effects_1.Effect.change_durability(character, 'foot', -1);
            let skill_dice = Math.random();
            if (skill_dice * skill_dice * skill_dice > system_2.CharacterSystem.skill(character, 'travelling') / 100) {
                effects_1.Effect.Change.skill(character, 'travelling', 1);
            }
        }
    }
    Event.move_durability_roll = move_durability_roll;
    function new_character(template, name, starting_cell, model) {
        // console.log('creating new character')
        let character = system_2.CharacterSystem.template_to_character(template, name, starting_cell);
        if (model == undefined)
            model = { chin: 0, mouth: 0, eyes: 0 };
        character.set_model_variation(model);
        const cell = data_1.Data.Cells.from_id(starting_cell);
        systems_communication_1.Link.character_and_cell(character.id, cell.id);
        data_1.Data.CharacterDB.save();
        return character;
    }
    Event.new_character = new_character;
    function ranged_dodge(attack, defender, flag_dodge) {
        // evasion helps against arrows better than in melee
        // 100 evasion - 2 * attack skill = 100% of arrows are missing
        // evaded attack does not rise skill of attacker
        // dodge is an active evasion
        // it gives base 10% of arrows missing
        // and you rise your evasion if you are attacked
        const attack_skill = 2 * attack.attack_skill;
        const evasion = system_2.CharacterSystem.skill(defender, 'evasion');
        let evasion_chance = evasion / (100 + attack_skill);
        if (flag_dodge)
            evasion_chance = evasion_chance + 0.1;
        const evasion_roll = Math.random();
        if (evasion_roll < evasion_chance) {
            attack.flags.miss = true;
            return 'miss';
        }
        if (flag_dodge) {
            const dice_evasion_skill_up = Math.random();
            if (dice_evasion_skill_up > evasion_chance) {
                effects_1.Effect.Change.skill(defender, 'evasion', 1);
            }
        }
    }
    function shoot(attacker, defender, distance, flag_dodge) {
        // sanity checks
        if (defender.get_hp() == 0)
            return 'miss';
        if (attacker.get_hp() == 0)
            return 'miss';
        if (attacker.stash.get(materials_manager_1.ARROW_BONE) < 1) {
            alerts_1.Alerts.not_enough_to_character(attacker, 'arrow', 0, 1, undefined);
            return 'no_ammo';
        }
        //remove arrow
        change_stash(attacker, materials_manager_1.ARROW_BONE, -1);
        //check missed attack because of lack of skill
        const acc = battle_calcs_1.Accuracy.ranged(attacker, distance);
        const dice_accuracy = Math.random();
        const attacker_ranged_skill = system_2.CharacterSystem.skill(attacker, 'ranged');
        if (dice_accuracy > acc) {
            const dice_skill_up = Math.random();
            if (dice_skill_up * 100 > attacker_ranged_skill) {
                effects_1.Effect.Change.skill(attacker, 'ranged', 1);
            }
            return 'miss';
        }
        const dice_skill_up = Math.random();
        if (dice_skill_up * 50 > attacker_ranged_skill) {
            effects_1.Effect.Change.skill(attacker, 'ranged', 1);
        }
        // create attack
        const attack = system_1.Attack.generate_ranged(attacker);
        // durability changes weapon
        const roll_weapon = Math.random();
        if (roll_weapon < 0.2) {
            effects_1.Effect.change_durability(attacker, 'weapon', -1);
        }
        const responce = ranged_dodge(attack, defender, flag_dodge);
        if (responce == 'miss') {
            damage_types_1.DmgOps.mult_ip(attack.damage, 0);
        }
        else {
            const roll = Math.random();
            if (roll < 0.5)
                effects_1.Effect.change_durability(defender, 'body', -1);
            else if (roll < 0.7)
                effects_1.Effect.change_durability(defender, 'legs', -1);
            else if (roll < 0.8)
                effects_1.Effect.change_durability(defender, 'foot', -1);
            else if (roll < 0.9)
                effects_1.Effect.change_durability(defender, 'head', -1);
            else
                effects_1.Effect.change_durability(defender, 'arms', -1);
        }
        //apply status to attack
        attack.attacker_status_change.fatigue += 5;
        attack.defender_status_change.fatigue += 5;
        attack.defender_status_change.stress += 3;
        attack.defence_skill += system_2.CharacterSystem.skill(defender, 'evasion');
        deal_damage(defender, attack, attacker, false);
        //if target is dead, loot it all
        if (defender.dead()) {
            kill(attacker, defender);
        }
        return 'ok';
    }
    Event.shoot = shoot;
    function unconditional_magic_bolt(attacker, defender, dist, flag_dodge, flag_charged) {
        const dice = Math.random();
        if (dice > system_2.CharacterSystem.skill(attacker, 'magic_mastery') / 50) {
            effects_1.Effect.Change.skill(attacker, 'magic_mastery', 1);
        }
        const attack = system_1.Attack.generate_magic_bolt(attacker, dist, flag_charged);
        attack.defender_status_change.stress += 5;
        deal_damage(defender, attack, attacker, false);
        if (defender.dead()) {
            kill(attacker, defender);
        }
        return 'ok';
    }
    Event.unconditional_magic_bolt = unconditional_magic_bolt;
    function magic_bolt_mage(attacker, defender, dist, flag_dodge) {
        if (defender.dead())
            return 'miss';
        if (attacker.dead())
            return 'miss';
        unconditional_magic_bolt(attacker, defender, dist, flag_dodge, false);
    }
    Event.magic_bolt_mage = magic_bolt_mage;
    function magic_bolt_zaz(attacker, defender, dist, flag_dodge) {
        if (defender.dead())
            return 'miss';
        if (attacker.dead())
            return 'miss';
        if (attacker.stash.get(materials_manager_1.ZAZ) == 0)
            return;
        Event.change_stash(attacker, materials_manager_1.ZAZ, -1);
        unconditional_magic_bolt(attacker, defender, dist, flag_dodge, true);
    }
    Event.magic_bolt_zaz = magic_bolt_zaz;
    function magic_bolt_blood(attacker, defender, dist, flag_dodge) {
        if (defender.dead())
            return 'miss';
        if (attacker.dead())
            return 'miss';
        const BLOOD_COST = 10;
        if (attacker.status.blood >= BLOOD_COST) {
            effects_1.Effect.Change.blood(attacker, -BLOOD_COST);
        }
        else {
            const blood = attacker.status.blood;
            const hp = attacker.status.hp;
            if (blood + hp > BLOOD_COST) {
                attacker.status.blood = 0;
                effects_1.Effect.Change.blood(attacker, -attacker.status.blood);
                effects_1.Effect.Change.hp(attacker, BLOOD_COST - blood);
            }
        }
        unconditional_magic_bolt(attacker, defender, dist, flag_dodge, true);
    }
    Event.magic_bolt_blood = magic_bolt_blood;
    function deal_damage(defender, attack, attacker, AOE_flag) {
        const total = system_2.CharacterSystem.damage(defender, attack.damage);
        defender.change_status(attack.defender_status_change);
        attacker.change_status(attack.attacker_status_change);
        const resistance = system_2.CharacterSystem.resistance(defender);
        alerts_1.Alerts.log_attack(defender, attack, resistance, total, 'defender');
        alerts_1.Alerts.log_attack(attacker, attack, resistance, total, 'attacker');
        (0, SYSTEM_REPUTATION_1.handle_attack_reputation_change)(attacker, defender, AOE_flag);
        user_manager_1.UserManagement.add_user_to_update_queue(defender.user_id, 1 /* UI_Part.STATUS */);
        user_manager_1.UserManagement.add_user_to_update_queue(attacker.user_id, 1 /* UI_Part.STATUS */);
    }
    function attack(attacker, defender, dodge_flag, attack_type, AOE_flag) {
        if (attacker.dead())
            return;
        if (defender.dead())
            return;
        const attack = system_1.Attack.generate_melee(attacker, attack_type);
        // console.log(attack)
        //status changes for melee attack
        attack.attacker_status_change.rage += 5;
        attack.attacker_status_change.fatigue += 5;
        attack.defender_status_change.rage += 3;
        attack.defender_status_change.stress += 1;
        //calculating defense skill
        evade(defender, attack, dodge_flag);
        block(defender, attack);
        parry(defender, attack);
        //calculating improvement to skill
        attack_skill_improvement(attacker, defender, attack);
        //breaking items
        attack_affect_durability(attacker, defender, attack);
        //applying defense and attack skill
        let damage_modifier = (100 + attack.attack_skill) / (100 + attack.defence_skill);
        damage_types_1.DmgOps.mult_ip(attack.damage, damage_modifier);
        // console.log('attack after modification')
        // console.log(attack)
        //apply damage and status effect after all modifiers
        deal_damage(defender, attack, attacker, AOE_flag);
        //if target is dead, loot it all
        if (defender.dead()) {
            kill(attacker, defender);
        }
    }
    Event.attack = attack;
    function attack_affect_durability(attacker, defender, attack) {
        if (!attack.flags.miss) {
            const durability_roll = Math.random();
            if (durability_roll < 0.5)
                effects_1.Effect.change_durability(attacker, 'weapon', -1);
            if (attack.flags.blocked) {
                effects_1.Effect.change_durability(defender, 'weapon', -1);
            }
            else {
                const roll = Math.random();
                if (roll < 0.5)
                    effects_1.Effect.change_durability(defender, 'body', -1);
                else if (roll < 0.7)
                    effects_1.Effect.change_durability(defender, 'legs', -1);
                else if (roll < 0.8)
                    effects_1.Effect.change_durability(defender, 'foot', -1);
                else if (roll < 0.9)
                    effects_1.Effect.change_durability(defender, 'head', -1);
                else
                    effects_1.Effect.change_durability(defender, 'arms', -1);
            }
        }
    }
    function attack_skill_improvement(attacker, defender, attack) {
        // if attacker skill is lower than total defence skill of attack, then attacker can improve
        if (attack.attack_skill < attack.defence_skill) {
            const improvement_rate = (100 + attack.defence_skill) / (100 + attack.attack_skill);
            if (improvement_rate > 1) {
                effects_1.Effect.Change.skill(attacker, attack.weapon_type, Math.floor(improvement_rate));
            }
            else {
                const dice = Math.random();
                if (dice < improvement_rate)
                    effects_1.Effect.Change.skill(attacker, attack.weapon_type, 1);
            }
        }
        //fighting provides constant growth of this skill up to some level
        //for defender
        const dice = Math.random();
        if ((dice < 0.5) && (attack.attack_skill <= 30)) {
            effects_1.Effect.Change.skill(defender, system_2.CharacterSystem.melee_weapon_type(defender), 1);
        }
        //for attacker
        const dice2 = Math.random();
        if ((dice2 < 0.5) && (attack.attack_skill <= 30)) {
            effects_1.Effect.Change.skill(attacker, attack.weapon_type, 1);
        }
    }
    function parry(defender, attack) {
        const weapon = system_2.CharacterSystem.melee_weapon_type(defender);
        const skill = system_2.CharacterSystem.attack_skill(defender) + Math.round(Math.random() * 5);
        attack.defence_skill += skill;
        // roll parry
        const parry_dice = Math.random();
        if ((parry_dice * skill > attack.attack_skill)) {
            attack.defence_skill += 40;
            attack.flags.blocked = true;
        }
        //fighting provides constant growth of this skill up to some level
        if (skill < attack.attack_skill) {
            effects_1.Effect.Change.skill(defender, weapon, 1);
        }
        const dice = Math.random();
        if ((dice < 0.1) && (skill <= 10)) {
            effects_1.Effect.Change.skill(defender, weapon, 1);
        }
    }
    function block(defender, attack) {
        const skill = system_2.CharacterSystem.skill(defender, 'blocking') + Math.round(Math.random() * 10);
        attack.defence_skill += skill;
        // roll block
        const block_dice = Math.random();
        if (block_dice * skill > attack.defence_skill) {
            attack.flags.blocked = true;
        }
        //fighting provides constant growth of this skill
        if (skill < attack.attack_skill) {
            effects_1.Effect.Change.skill(defender, 'blocking', 1);
        }
        const dice = Math.random();
        if ((dice < 0.1) && (skill <= 20)) {
            effects_1.Effect.Change.skill(defender, 'blocking', 1);
        }
    }
    function evade(defender, attack, dodge_flag) {
        //this skill has quite wide deviation
        const skill = (0, basic_functions_1.trim)(system_2.CharacterSystem.skill(defender, 'evasion') + Math.round((Math.random() - 0.5) * 40), 0, 200);
        //passive evasion
        attack.defence_skill += skill;
        //active dodge
        if (dodge_flag) {
            attack.flags.miss = true;
            attack.defence_skill += 50;
        }
        // roll miss
        const block_dice = Math.random();
        if (block_dice * skill > attack.defence_skill) {
            attack.flags.miss = true;
        }
        //fighting provides constant growth of this skill
        if (skill < attack.attack_skill) {
            effects_1.Effect.Change.skill(defender, 'evasion', 1);
        }
        const dice = Math.random();
        if ((dice < 0.1) && (skill <= 10)) {
            effects_1.Effect.Change.skill(defender, 'evasion', 1);
        }
    }
    function rob_the_dead(robber, target) {
        if (robber.cell_id != target.cell_id)
            return;
        if (!target.dead())
            return;
        system_2.CharacterSystem.transfer_all(target, robber);
        user_manager_1.UserManagement.add_user_to_update_queue(robber.user_id, 4 /* UI_Part.STASH */);
    }
    Event.rob_the_dead = rob_the_dead;
    function kill(killer, victim) {
        let cell = data_1.Data.Cells.from_id(killer.cell_id);
        console.log(killer.name + ' kills ' + victim.name + ' at ' + `(${cell?.x}, ${cell?.y})`);
        death(victim);
        if (killer.id == victim.id) {
            return;
        }
        // loot bulk
        const loot = system_2.CharacterSystem.rgo_check(victim);
        for (const item of loot) {
            Event.change_stash(killer, item.material, item.amount);
        }
        // loot items rgo
        // console.log('check items drop')
        const dropped_items = generate_loot_1.Loot.items(victim.race);
        for (let item of dropped_items) {
            inventory_events_1.EventInventory.add_item(killer, item);
        }
        // skinning check
        const skin = generate_loot_1.Loot.skinning(victim.race);
        if (skin > 0) {
            const dice = Math.random();
            const skinning_skill = system_2.CharacterSystem.skill(killer, 'skinning');
            if (dice < skinning_skill / 100) {
                Event.change_stash(killer, materials_manager_1.RAT_SKIN, skin);
            }
            else {
                effects_1.Effect.Change.skill(killer, 'skinning', 1);
            }
        }
        if (victim.current_building != undefined) {
            effects_1.Effect.leave_room(victim.id);
        }
        data_1.Data.Buildings.remove_ownership_character(victim.id);
        user_manager_1.UserManagement.add_user_to_update_queue(killer.user_id, 4 /* UI_Part.STASH */);
    }
    Event.kill = kill;
    function death(character) {
        // UserManagement.add_user_to_update_queue(character.user_id, "death");
        if (character.cleared)
            return;
        // console.log('death of ' + character.get_name())
        market_1.EventMarket.clear_orders(character);
        const user_data = systems_communication_1.Convert.character_to_user_data(character);
        systems_communication_1.Unlink.user_data_and_character(user_data, character);
        // character.get_name() = `Corpse of ${character.race}`
        // const battle = Convert.character_to_battle(character)
        // if (battle != undefined) {
        //     let unit = Convert.character_to_unit(character)
        //     // BattleEvent.Leave(battle, unit)
        // }
        // Unlink.character_and_battle(character)
        // const cell = Convert.character_to_cell(character)
        // cell.changed_characters = true
        // Link.character_and_cell(character.id, GRAVEYARD_CELL)
        character.cleared = true;
    }
    Event.death = death;
    function change_stash(character, tag, amount) {
        character.stash.inc(tag, amount);
        let user = systems_communication_1.Convert.character_to_user(character);
        if (user == undefined)
            return;
        alerts_1.Alerts.log_to_user(user, `change ${materials_manager_1.materials.index_to_material(tag).string_tag} by ${amount}. Now: ${character.stash.get(tag)}`);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 4 /* UI_Part.STASH */);
    }
    Event.change_stash = change_stash;
    // export function build_building(character: Character, type: LandPlotType) {
    // }
    function buy_land_plot(character, seller) {
        if (data_1.Data.Reputation.from_id('city', seller.id) != 'leader')
            return 'not_a_leader';
        if (character.cell_id != seller.cell_id)
            return 'too_far';
        if (character.savings.get() < 500)
            return 'not_enough_money';
        if (data_1.Data.Cells.free_space(character.cell_id) < 1)
            return 'no_space';
        effects_1.Effect.Transfer.savings(character, seller, 500);
        const land_plot = effects_1.Effect.new_building(character.cell_id, "land_plot" /* LandPlotType.LandPlot */, 100, 1);
        data_1.Data.Buildings.set_ownership(character.id, land_plot);
    }
    Event.buy_land_plot = buy_land_plot;
    function create_land_plot(character) {
        let characters = data_1.Data.Cells.get_characters_list_from_cell(character.cell_id);
        for (let local_character of characters) {
            if (data_1.Data.Reputation.from_id('city', local_character) == 'leader')
                return 'leader_here';
        }
        if (character.cell_id != character.cell_id)
            return 'too_far';
        if (data_1.Data.Cells.free_space(character.cell_id) < 1)
            return 'no_space';
        effects_1.Effect.new_building(character.cell_id, "land_plot" /* LandPlotType.LandPlot */, 100, 0);
        // Data.Buildings.set_ownership(character.id, land_plot)
    }
    Event.create_land_plot = create_land_plot;
    function develop_land_plot(character, plot_id, type) {
        let cost = scripted_values_1.ScriptedValue.building_price_wood(type);
        if (character.stash.get(materials_manager_1.WOOD) < cost)
            return;
        let owner = data_1.Data.Buildings.owner(plot_id);
        if ((owner != undefined) && (owner != character.id))
            return 'not_your_plot';
        let building = data_1.Data.Buildings.from_id(plot_id);
        if (building.type != "land_plot" /* LandPlotType.LandPlot */)
            return;
        change_stash(character, materials_manager_1.WOOD, -cost);
        building.type = type;
        // Effect.new_building(character.cell_id, type, character.skills.woodwork)
    }
    Event.develop_land_plot = develop_land_plot;
    function repair_building(character, builing_id) {
        let building = data_1.Data.Buildings.from_id(builing_id);
        let skill = system_2.CharacterSystem.skill(character, 'woodwork');
        let repair = Math.min(5, skill - building.durability);
        if (repair <= 0)
            return;
        let cost = Math.round(repair / 100 * scripted_values_1.ScriptedValue.building_price_wood(building.type) / 2 + 0.51);
        if (cost > character.stash.get(materials_manager_1.WOOD))
            return;
        let difficulty = Math.floor(building.durability / 3 + 10);
        (0, helpers_1.on_craft_update)(character, [{ skill: 'woodwork', difficulty: difficulty }]);
        change_stash(character, materials_manager_1.WOOD, -cost);
        effects_1.Effect.building_repair(building, repair);
    }
    Event.repair_building = repair_building;
    function remove_tree(cell) {
        let land_plots = data_1.Data.Buildings.from_cell_id(cell);
        if (land_plots == undefined)
            return;
        for (let item of land_plots) {
            const plot = data_1.Data.Buildings.from_id(item);
            if (plot.type == "forest_plot" /* LandPlotType.ForestPlot */) {
                plot.durability = plot.durability - 1;
                if (plot.durability < 0)
                    plot.durability = 0;
            }
        }
    }
    Event.remove_tree = remove_tree;
})(Event = exports.Event || (exports.Event = {}));
