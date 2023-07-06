"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendUpdate = void 0;
const battle_calcs_1 = require("../../battle/battle_calcs");
const systems_communication_1 = require("../../systems_communication");
const types_1 = require("../../types");
const alerts_1 = require("./alerts");
const system_1 = require("../../battle/system");
const constants_1 = require("../../static_data/constants");
const helper_functions_1 = require("../helper_functions");
const CraftItem_1 = require("../../craft/CraftItem");
const CraftBulk_1 = require("../../craft/CraftBulk");
const system_2 = require("../../character/system");
const system_3 = require("../../attack/system");
const damage_types_1 = require("../../damage_types");
const data_1 = require("../../data");
const terrain_1 = require("../../map/terrain");
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
            phys_power: system_2.CharacterSystem.phys_power(character),
            magic_power: system_2.CharacterSystem.magic_power(character),
            enchant_rating: system_2.CharacterSystem.enchant_rating(character),
            movement_cost: system_2.CharacterSystem.movement_cost_battle(character),
            move_duration_map: system_2.CharacterSystem.movement_duration_map(character),
            base_damage_magic_bolt: system_3.Attack.magic_bolt_base_damage(character, false),
            base_damage_magic_bolt_charged: system_3.Attack.magic_bolt_base_damage(character, true),
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
            const battle = systems_communication_1.Convert.id_to_battle(battle_id);
            let unit_id = character.battle_unit_id;
            alerts_1.Alerts.battle_progress(user, true);
            alerts_1.Alerts.generic_user_alert(user, constants_1.BATTLE_DATA_MESSAGE, system_1.BattleSystem.data(battle));
            alerts_1.Alerts.generic_user_alert(user, constants_1.BATTLE_CURRENT_UNIT, battle.heap.get_selected_unit()?.id);
            alerts_1.Alerts.generic_user_alert(user, constants_1.UNIT_ID_MESSAGE, unit_id);
        }
        else {
            alerts_1.Alerts.battle_progress(user, false);
        }
    }
    SendUpdate.battle = battle;
    // send_data_start() {
    //         this.world.socket_manager.send_battle_data_start(this)
    //         if (this.waiting_for_input) {
    //             this.send_action({action: 'new_turn', target: this.heap.selected})
    //         }
    //     }
    //     send_update() {
    //         this.world.socket_manager.send_battle_update(this)
    //         if (this.waiting_for_input) {
    //             this.send_action({action: 'new_turn', target: this.heap.selected})
    //         }
    //     }
    //     send_current_turn() {
    //         this.send_action({action: 'new_turn', target: this.heap.selected})
    //     }
    // send_battle_data_to_user(user: User) {
    // }
    // send_battle_data_start(battle: BattleReworked2) {
    //     let units = battle.get_units()
    //     let data = battle.get_data()
    //     let status = battle.get_status()
    //     for (let i in units) {
    //         let char = this.world.get_character_by_id(units[i].char_id)
    //         if ((char != undefined) && char.is_player()) {
    //             let position = char.get_in_battle_id()
    //             this.send_to_character_user(char, 'battle-has-started', data);
    //             this.send_to_character_user(char, 'enemy-update', status)
    //             this.send_to_character_user(char, 'player-position', position)
    //         }
    //     } 
    // }
    // send_battle_update(battle: BattleReworked2) {
    //     let units = battle.get_units()
    //     let status = battle.get_status()
    //     let data = battle.get_data()
    //     for (let i in units) {
    //         let char = this.world.get_character_by_id(units[i].char_id)
    //         if ((char != undefined) && char.is_player()) {
    //             this.send_to_character_user(char, 'enemy-update', status)
    //             this.send_to_character_user(char, 'battle-update', data)
    //             // this.send_to_character_user(char, 'player-position', position)
    //         }
    //     } 
    // }
    // send_battle_action(battle: BattleReworked2, a: any) {
    //     let units = battle.get_units()
    //     for (let i = 0; i < units.length; i++) {
    //         let char = this.world.get_character_by_id(units[i].char_id);
    //         if ((char != undefined) && char.is_player()) {
    //             this.send_to_character_user(char, 'battle-action', a)
    //         }
    //     }
    // }
    // send_stop_battle(battle: BattleReworked2) {
    //     let units = battle.get_units()
    //     for (let i = 0; i < units.length; i++) {
    //         let character = this.world.get_character_by_id(units[i].char_id);
    //         if (character != undefined) {
    //             if (character.is_player()) {
    //                 this.send_to_character_user(character, 'battle-action', {action: 'stop_battle'});
    //                 this.send_to_character_user(character, 'battle-has-ended', '')
    //                 this.send_updates_to_char(character)
    //             }
    //         }
    //     }
    // }
    function savings(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.generic_user_alert(user, 'savings', character.savings.get());
        alerts_1.Alerts.generic_user_alert(user, 'savings-trade', character.trade_savings.get());
    }
    SendUpdate.savings = savings;
    function status(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.generic_user_alert(user, 'status', { c: character.status, max_hp: character.get_max_hp() });
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
        alerts_1.Alerts.generic_user_alert(user, 'equip-update', character.equip.get_data());
        attack_damage(user);
    }
    SendUpdate.equip = equip;
    function skill(user, skill) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        const current_skill = system_2.CharacterSystem.skill(character, skill);
        const pure_skill = system_2.CharacterSystem.pure_skill(character, skill);
        alerts_1.Alerts.skill(user, skill, pure_skill, current_skill);
    }
    SendUpdate.skill = skill;
    function skills(user, skills) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        for (let skill of skills) {
            const current_skill = system_2.CharacterSystem.skill(character, skill);
            const pure_skill = system_2.CharacterSystem.pure_skill(character, skill);
            alerts_1.Alerts.skill(user, skill, pure_skill, current_skill);
        }
    }
    SendUpdate.skills = skills;
    function skill_clothier(user) {
        skill(user, 'clothier');
    }
    SendUpdate.skill_clothier = skill_clothier;
    function skill_cooking(user) {
        skill(user, 'cooking');
    }
    SendUpdate.skill_cooking = skill_cooking;
    function skill_woodwork(user) {
        skill(user, 'woodwork');
    }
    SendUpdate.skill_woodwork = skill_woodwork;
    function skill_skinning(user) {
        skill(user, 'skinning');
    }
    SendUpdate.skill_skinning = skill_skinning;
    function skill_weapon(user) {
        skills(user, types_1.weapon_attack_tags);
    }
    SendUpdate.skill_weapon = skill_weapon;
    function skill_defence(user) {
        skills(user, ['evasion', 'blocking']);
    }
    SendUpdate.skill_defence = skill_defence;
    function all_skills(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        skills(user, Object.keys(character._skills));
        cell_probability(user);
        alerts_1.Alerts.perks(user, character);
    }
    SendUpdate.all_skills = all_skills;
    function all_craft(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        for (let item of (0, CraftBulk_1.get_crafts_bulk_list)(character)) {
            alerts_1.Alerts.craft_bulk_complete(user, item.id, item);
        }
        for (let item of (0, CraftItem_1.get_crafts_item_list)(character)) {
            alerts_1.Alerts.craft_item_complete(user, item.id, item);
        }
        for (let item of (0, CraftBulk_1.get_crafts_bulk_list)(character)) {
            alerts_1.Alerts.craft_bulk(user, item.id, (0, CraftBulk_1.output_bulk)(character, item));
        }
        for (let item of (0, CraftItem_1.get_crafts_item_list)(character)) {
            alerts_1.Alerts.craft_item(user, item.id, (0, CraftItem_1.durability)(character, item));
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
        alerts_1.Alerts.generic_user_alert(user, 'hp', { c: character.status.hp, m: character.get_max_hp() });
    }
    SendUpdate.hp = hp;
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
        for (let i = 0; i < character.explored.length; i++) {
            if (character.explored[i]) {
                let cell = data_1.Data.Cells.from_id(i);
                if (cell != undefined) {
                    let x = cell.x;
                    let y = cell.y;
                    let terrain = data_1.Data.World.id_to_terrain(cell.id);
                    let forestation = data_1.Data.Cells.forestation(cell.id);
                    let urbanisation = data_1.Data.Cells.urbanisation(cell.id);
                    // console.log(forestation)
                    // let res1: {[_ in string]: CellDisplayData} = {}
                    const display_data = {
                        terrain: (0, terrain_1.terrain_to_string)(terrain),
                        forestation: forestation,
                        urbanisation: urbanisation,
                        rat_lair: data_1.Data.Cells.rat_lair(cell.id)
                    };
                    let res2 = { x: x, y: y, ter: display_data };
                    alerts_1.Alerts.generic_user_alert(user, 'map-data-display', res2);
                }
            }
        }
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
    }
    SendUpdate.map_position = map_position;
    function map_position_move(user) {
        map_position(user, false);
    }
    SendUpdate.map_position_move = map_position_move;
    function local_characters(user) {
        const character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        let characters_list = data_1.Data.Cells.get_characters_list_display(character.cell_id);
        alerts_1.Alerts.generic_user_alert(user, 'cell-characters', characters_list);
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
        let blunt = damage_types_1.DmgOps.total(system_3.Attack.generate_melee(character, 'blunt').damage);
        let slice = damage_types_1.DmgOps.total(system_3.Attack.generate_melee(character, 'slice').damage);
        let pierce = damage_types_1.DmgOps.total(system_3.Attack.generate_melee(character, 'pierce').damage);
        alerts_1.Alerts.battle_action_damage(user, 'attack_blunt', blunt);
        alerts_1.Alerts.battle_action_damage(user, 'attack_slice', slice);
        alerts_1.Alerts.battle_action_damage(user, 'attack_pierce', pierce);
        let ranged = damage_types_1.DmgOps.total(system_3.Attack.generate_ranged(character).damage);
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
})(SendUpdate = exports.SendUpdate || (exports.SendUpdate = {}));
// update_market_info(market: Cell) {
//     let responce = this.prepare_market_orders(market)     
//     for (let i of this.sockets) {
//         if (i.current_user != null) {
//             let char = i.current_user.character;
//             try {
//                 let cell1 = char.get_cell();
//                 if (i.online & i.market_data && (cell1.id==market.id)) {
//                     i.socket.emit('market-data', responce);
//                 }
//             } catch(error) {
//             }
//         }
//     }
// }
