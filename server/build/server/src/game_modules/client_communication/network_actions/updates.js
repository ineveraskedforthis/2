"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendUpdate = void 0;
const system_1 = require("../../attack/system");
const battle_calcs_1 = require("../../battle/battle_calcs");
const heap_1 = require("../../battle/classes/heap");
const system_2 = require("../../battle/system");
const crafts_storage_1 = require("../../craft/crafts_storage");
const crafts_storage_2 = require("../../craft/crafts_storage");
const damage_types_1 = require("../../damage_types");
const extract_data_1 = require("../../data-extraction/extract-data");
const data_id_1 = require("../../data/data_id");
const data_objects_1 = require("../../data/data_objects");
const system_3 = require("../../map/system");
const terrain_1 = require("../../map/terrain");
const character_1 = require("../../scripted-values/character");
const constants_1 = require("../../static_data/constants");
const systems_communication_1 = require("../../systems_communication");
const helper_functions_1 = require("../helper_functions");
const alerts_1 = require("./alerts");
const craft_1 = require("../../scripted-values/craft");
const content_1 = require("../../../.././../game_content/src/content");
const scripted_values_1 = require("../../events/scripted_values");
var SendUpdate;
(function (SendUpdate) {
    function all(user) {
        status(user);
        belongings(user);
        all_skills(user);
        all_craft(user);
        map_related(user);
        battle(user);
        market(user);
        stats(user);
        race_model(user);
    }
    SendUpdate.all = all;
    function locations_to_character(character) {
        const user = systems_communication_1.Convert.character_to_user(character);
        if (user == undefined)
            return;
        locations(user);
    }
    SendUpdate.locations_to_character = locations_to_character;
    function locations(user) {
        const character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        let ids = data_id_1.DataID.Cells.locations(character.cell_id);
        if (ids == undefined) {
            alerts_1.Alerts.generic_user_alert(user, 'locations-info', []);
            return;
        }
        let locations = ids.map((id) => {
            let location = data_objects_1.Data.Locations.from_id(id);
            let guests = data_id_1.DataID.Location.guest_list(id);
            let owner = location.owner_id;
            let name = 'None';
            if (owner != undefined) {
                name = data_objects_1.Data.Characters.from_id(owner).name;
            }
            else {
                owner = -1;
            }
            let urbanisation = system_3.MapSystem.urbanisation(location.cell_id);
            if (location.has_house_level > 0) {
                urbanisation = 0;
            }
            return {
                id: id,
                room_cost: scripted_values_1.ScriptedValue.rest_price(character, location),
                guests: guests.length,
                durability: scripted_values_1.ScriptedValue.rest_quality(location),
                owner_id: owner,
                owner_name: name,
                cell_id: location.cell_id,
                house_level: location.has_house_level,
                forest: location.forest,
                terrain: location.terrain,
                urbanisation: urbanisation
            };
        });
        // console.log(locations)
        alerts_1.Alerts.generic_user_alert(user, 'locations-info', locations);
    }
    SendUpdate.locations = locations;
    function race_model(user) {
        const character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.generic_user_alert(user, 'model', character.model);
    }
    SendUpdate.race_model = race_model;
    function stats(user) {
        const character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        const stats = {
            phys_power: character_1.CharacterValues.phys_power(character),
            magic_power: character_1.CharacterValues.magic_power(character),
            enchant_rating: character_1.CharacterValues.enchant_rating(character),
            movement_cost: character_1.CharacterValues.movement_cost_battle(character),
            move_duration_map: character_1.CharacterValues.movement_duration_map(character),
            base_damage_magic_bolt: system_1.Attack.magic_bolt_base_damage(character, false),
            base_damage_magic_bolt_charged: system_1.Attack.magic_bolt_base_damage(character, true),
        };
        alerts_1.Alerts.generic_user_alert(user, 'stats', stats);
    }
    SendUpdate.stats = stats;
    function battle(user) {
        const character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        const battle_id = character.battle_id;
        if (battle_id != undefined) {
            // console.log('!!!')
            const battle = data_objects_1.Data.Battles.from_id(battle_id);
            alerts_1.Alerts.battle_progress(user, true);
            alerts_1.Alerts.generic_user_alert(user, constants_1.BATTLE_DATA_MESSAGE, system_2.BattleSystem.data(battle));
            alerts_1.Alerts.generic_user_alert(user, constants_1.BATTLE_CURRENT_UNIT, heap_1.CharactersHeap.get_selected_unit(battle)?.id);
            alerts_1.Alerts.generic_user_alert(user, constants_1.character_id_MESSAGE, character.id);
        }
        else {
            alerts_1.Alerts.battle_progress(user, false);
        }
    }
    SendUpdate.battle = battle;
    function savings(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.generic_user_alert(user, 'val_savings_c', character.savings.get());
        alerts_1.Alerts.generic_user_alert(user, 'val_savings_trade_c', character.trade_savings.get());
    }
    SendUpdate.savings = savings;
    function status(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        const status = character.status;
        alerts_1.Alerts.generic_user_alert(user, 'val_hp_c', status.hp);
        alerts_1.Alerts.generic_user_alert(user, 'val_rage_c', status.rage);
        alerts_1.Alerts.generic_user_alert(user, 'val_fatigue_c', status.fatigue);
        alerts_1.Alerts.generic_user_alert(user, 'val_stress_c', status.stress);
        alerts_1.Alerts.generic_user_alert(user, 'val_blood_c', status.blood);
        alerts_1.Alerts.generic_user_alert(user, 'val_hp_m', character.get_max_hp());
    }
    SendUpdate.status = status;
    function stash(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.generic_user_alert(user, 'stash-update', character.stash.data);
    }
    SendUpdate.stash = stash;
    function equip(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.generic_user_alert(user, 'equip-update', extract_data_1.Extract.EquipData(character.equip));
        attack_damage(user);
    }
    SendUpdate.equip = equip;
    function skill(user, skill) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        const current_skill = character_1.CharacterValues.skill(character, skill);
        const pure_skill = character_1.CharacterValues.pure_skill(character, skill);
        alerts_1.Alerts.skill(user, skill, pure_skill, current_skill);
    }
    SendUpdate.skill = skill;
    function skills(user, skills) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        for (let skill of skills) {
            const current_skill = character_1.CharacterValues.skill(character, skill);
            const pure_skill = character_1.CharacterValues.pure_skill(character, skill);
            alerts_1.Alerts.skill(user, skill, pure_skill, current_skill);
        }
    }
    SendUpdate.skills = skills;
    function skill_clothier(user) {
        skill(user, 0 /* SKILL.CLOTHIER */);
    }
    SendUpdate.skill_clothier = skill_clothier;
    function skill_cooking(user) {
        skill(user, 2 /* SKILL.COOKING */);
    }
    SendUpdate.skill_cooking = skill_cooking;
    function skill_woodwork(user) {
        skill(user, 4 /* SKILL.WOODWORKING */);
    }
    SendUpdate.skill_woodwork = skill_woodwork;
    function skill_skinning(user) {
        skill(user, 3 /* SKILL.SKINNING */);
    }
    SendUpdate.skill_skinning = skill_skinning;
    function skill_defence(user) {
        skills(user, [19 /* SKILL.EVASION */, 20 /* SKILL.BLOCKING */]);
    }
    SendUpdate.skill_defence = skill_defence;
    function all_skills(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        skills(user, content_1.SkillConfiguration.SKILL);
        cell_probability(user);
        alerts_1.Alerts.perks(user, character);
    }
    SendUpdate.all_skills = all_skills;
    function all_craft(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        for (let item of (0, crafts_storage_1.get_crafts_bulk_list)(character)) {
            alerts_1.Alerts.craft_bulk_complete(user, item.id, item);
        }
        for (let item of (0, crafts_storage_2.get_crafts_item_list)(character)) {
            alerts_1.Alerts.craft_item_complete(user, item.id, item);
        }
        for (let item of (0, crafts_storage_1.get_crafts_bulk_list)(character)) {
            alerts_1.Alerts.craft_bulk(user, item.id, craft_1.CraftValues.output_bulk(character, item));
        }
        for (let item of (0, crafts_storage_2.get_crafts_item_list)(character)) {
            alerts_1.Alerts.craft_item(user, item.id, craft_1.CraftValues.durability(character, item));
        }
    }
    SendUpdate.all_craft = all_craft;
    function ranged(user, distance) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        if (isNaN(distance)) {
            return;
        }
        alerts_1.Alerts.battle_action_chance(user, 'shoot', battle_calcs_1.Accuracy.ranged(character, distance));
    }
    SendUpdate.ranged = ranged;
    function hp(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.generic_user_alert(user, 'val_hp_c', character.status.hp);
        alerts_1.Alerts.generic_user_alert(user, 'val_hp_m', character.get_max_hp());
    }
    SendUpdate.hp = hp;
    function blood(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.generic_user_alert(user, 'val_hp_c', character.status.hp);
    }
    SendUpdate.blood = blood;
    function fatigue(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.generic_user_alert(user, 'val_fatigue_c', character.status.fatigue);
    }
    SendUpdate.fatigue = fatigue;
    function stress(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.generic_user_alert(user, 'val_stress_c', character.status.stress);
    }
    SendUpdate.stress = stress;
    function rage(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.generic_user_alert(user, 'val_rage_c', character.status.rage);
    }
    SendUpdate.rage = rage;
    function market(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        const bulk_data = (0, helper_functions_1.prepare_market_orders)(character.cell_id);
        const items_data = systems_communication_1.Convert.cell_id_to_item_orders_socket(character.cell_id);
        alerts_1.Alerts.item_market_data(user, items_data);
        alerts_1.Alerts.market_data(user, bulk_data);
    }
    SendUpdate.market = market;
    function explored(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.generic_user_alert(user, 'explore', character.explored);
        map_position(user, true);
        data_objects_1.Data.Cells.for_each(cell => {
            if (character == undefined)
                return;
            const exploration_status = character.explored[cell.id];
            if ((exploration_status != undefined) && exploration_status) {
                let x = cell.x;
                let y = cell.y;
                let terrain = data_objects_1.Data.World.id_to_terrain(cell.id);
                let forestation = system_3.MapSystem.forestation(cell.id);
                let urbanisation = system_3.MapSystem.urbanisation(cell.id);
                // console.log(forestation)
                // let res1: {[_ in string]: CellDisplayData} = {}
                const display_data = {
                    terrain: (0, terrain_1.terrain_to_string)(terrain),
                    forestation: forestation,
                    urbanisation: urbanisation,
                    rat_lair: system_3.MapSystem.rat_lair(cell.id)
                };
                let res2 = { x: x, y: y, ter: display_data };
                alerts_1.Alerts.generic_user_alert(user, 'map-data-display', res2);
            }
        });
    }
    SendUpdate.explored = explored;
    function map_position(user, teleport_flag) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        let cell = systems_communication_1.Convert.character_to_cell(character);
        let data = {
            x: cell.x,
            y: cell.y,
            teleport_flag: teleport_flag
        };
        alerts_1.Alerts.generic_user_alert(user, 'map-pos', data);
        location(user);
    }
    SendUpdate.map_position = map_position;
    function location(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.generic_user_alert(user, 'val_location_id_c', character.location_id);
    }
    SendUpdate.location = location;
    function map_position_move(user) {
        map_position(user, false);
        location(user);
        local_characters(user);
    }
    SendUpdate.map_position_move = map_position_move;
    function local_characters(user) {
        const character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        let characters = data_id_1.DataID.Location.guest_list(character.location_id).map(systems_communication_1.Convert.character_id_to_character_view);
        alerts_1.Alerts.generic_user_alert(user, 'cell-characters', characters);
    }
    SendUpdate.local_characters = local_characters;
    function local_actions(user) {
        const character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        const cell = systems_communication_1.Convert.character_to_cell(character);
        // Alerts.map_action(user, 'fish'          , cell.can_fish())
        // Alerts.map_action(user, 'hunt'          , cell.can_hunt())
        // Alerts.map_action(user, 'clean'         , cell.can_clean())
        // Alerts.map_action(user, 'gather_wood'   , cell.can_gather_wood())
        // Alerts.map_action(user, 'gather_cotton' , cell.can_gather_cotton())
    }
    SendUpdate.local_actions = local_actions;
    function map_related(user) {
        local_actions(user);
        local_characters(user);
        explored(user);
        location(user);
    }
    SendUpdate.map_related = map_related;
    function belongings(user) {
        stash(user);
        savings(user);
        equip(user);
    }
    SendUpdate.belongings = belongings;
    function attack_damage(user) {
        const character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        let blunt = damage_types_1.DmgOps.total(system_1.Attack.generate_melee(character, 'blunt').damage);
        let slice = damage_types_1.DmgOps.total(system_1.Attack.generate_melee(character, 'slice').damage);
        let pierce = damage_types_1.DmgOps.total(system_1.Attack.generate_melee(character, 'pierce').damage);
        alerts_1.Alerts.battle_action_damage(user, 'attack_blunt', blunt);
        alerts_1.Alerts.battle_action_damage(user, 'attack_slice', slice);
        alerts_1.Alerts.battle_action_damage(user, 'attack_pierce', pierce);
        let ranged = damage_types_1.DmgOps.total(system_1.Attack.generate_ranged(character).damage);
        alerts_1.Alerts.battle_action_damage(user, 'shoot', ranged);
    }
    SendUpdate.attack_damage = attack_damage;
    function cell_probability(user) {
        const character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
    }
    SendUpdate.cell_probability = cell_probability;
    function update_player_actions_availability() {
        // send_skills_info(character: Character) {
        //
        //
        //     this.send_to_character_user(character, 'b-action-chance', {tag: 'flee', value: flee_chance(character)})
        //     this.send_to_character_user(character, 'b-action-chance', {tag: 'attack', value: character.get_attack_chance('usual')})
        //     this.send_perk_related_skills_update(character)
        // }
        //     send_perk_related_skills_update(character: Character) {
        //     this.send_to_character_user(character, 'b-action-chance', {tag: 'fast_attack', value: character.get_attack_chance('fast')})
        //     this.send_to_character_user(character, 'b-action-chance', {tag: 'push_back', value: character.get_attack_chance('heavy')})
        //     this.send_to_character_user(character, 'b-action-chance', {tag: 'magic_bolt', value: 1})
        //     this.send_to_character_user(character, 'action-display', {tag: 'dodge', value: can_dodge(character)})
        //     this.send_to_character_user(character, 'action-display', {tag: 'fast_attack', value: can_fast_attack(character)})
        //     this.send_to_character_user(character, 'action-display', {tag: 'push_back', value: can_push_back(character)})
        //     this.send_to_character_user(character, 'action-display', {tag: 'magic_bolt', value: can_cast_magic_bolt(character)})
        // }
    }
    SendUpdate.update_player_actions_availability = update_player_actions_availability;
})(SendUpdate || (exports.SendUpdate = SendUpdate = {}));
// update_market_info(market: Cell) {
//     let response = this.prepare_market_orders(market)
//     for (let i of this.sockets) {
//         if (i.current_user != null) {
//             let char = i.current_user.character;
//             try {
//                 let cell1 = char.get_cell();
//                 if (i.online & i.market_data && (cell1.id==market.id)) {
//                     i.socket.emit('market-data', response);
//                 }
//             } catch(error) {
//             }
//         }
//     }
// }

