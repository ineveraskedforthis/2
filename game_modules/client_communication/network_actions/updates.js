"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendUpdate = void 0;
const battle_calcs_1 = require("../../base_game_classes/battle/battle_calcs");
const craft_1 = require("../../calculations/craft");
const system_1 = require("../../map/system");
const systems_communication_1 = require("../../systems_communication");
const types_1 = require("../../types");
const alerts_1 = require("./alerts");
const difficulty_1 = require("../../calculations/difficulty");
const system_2 = require("../../base_game_classes/battle/system");
const constants_1 = require("../../static_data/constants");
var SendUpdate;
(function (SendUpdate) {
    function all(user) {
        status(user);
        belongings(user);
        all_skills(user);
        all_craft(user);
        map_related(user);
        battle(user);
    }
    SendUpdate.all = all;
    function battle(user) {
        const character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        if (character.in_battle()) {
            const battle = system_2.BattleSystem.id_to_battle(character.battle_id);
            let unit_id = character.battle_unit_id;
            alerts_1.Alerts.generic_user_alert(user, constants_1.UNIT_ID_MESSAGE, unit_id);
            alerts_1.Alerts.generic_user_alert(user, 'battle-in-process', true);
            alerts_1.Alerts.generic_user_alert(user, constants_1.BATTLE_DATA_MESSAGE, system_2.BattleSystem.data(battle));
            alerts_1.Alerts.generic_user_alert(user, constants_1.BATTLE_CURRENT_UNIT, { action: 'new_turn', target: battle.heap.selected });
        }
        else {
            alerts_1.Alerts.generic_user_alert(user, 'battle-in-process', false);
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
    //     console.log('sending battle info')
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
        console.log('update status');
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.generic_user_alert(user, 'status', { c: character.status, m: character.stats.max });
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
    }
    SendUpdate.equip = equip;
    function skill_clothier(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.skill(user, 'clothier', character.skills.clothier);
        let value = craft_1.CraftProbability.from_rat_skin(character);
        alerts_1.Alerts.craft(user, 'craft_rat_pants', value);
        alerts_1.Alerts.craft(user, 'craft_rat_armour', value);
        alerts_1.Alerts.craft(user, 'craft_rat_gloves', value);
        alerts_1.Alerts.craft(user, 'craft_rat_helmet', value);
        alerts_1.Alerts.craft(user, 'craft_rat_boots', value);
    }
    SendUpdate.skill_clothier = skill_clothier;
    function skill_cooking(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.skill(user, 'cooking', character.skills.cooking);
    }
    SendUpdate.skill_cooking = skill_cooking;
    function skill_woodwork(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.skill(user, 'woodwork', character.skills.woodwork);
    }
    SendUpdate.skill_woodwork = skill_woodwork;
    function skill_skinning(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.skill(user, 'woodwork', character.skills.woodwork);
    }
    SendUpdate.skill_skinning = skill_skinning;
    function skill_weapon(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        for (const tag of types_1.weapon_attack_tags) {
            alerts_1.Alerts.skill(user, tag, character.skills[tag]);
        }
    }
    SendUpdate.skill_weapon = skill_weapon;
    function skill_defence(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.skill(user, 'evasion', character.skills.evasion);
        alerts_1.Alerts.skill(user, 'blocking', character.skills.blocking);
    }
    SendUpdate.skill_defence = skill_defence;
    function all_skills(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        for (let i in character.skills) {
            alerts_1.Alerts.skill(user, i, character.skills[i]);
        }
        cell_probability(user);
    }
    SendUpdate.all_skills = all_skills;
    function all_craft(user) {
        cooking_craft(user);
        woodwork_craft(user);
    }
    SendUpdate.all_craft = all_craft;
    function cooking_craft(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.craft(user, 'cook_elodin', craft_1.CraftProbability.elo_to_food(character));
        alerts_1.Alerts.craft(user, 'cook_meat', craft_1.CraftProbability.meat_to_food(character));
    }
    SendUpdate.cooking_craft = cooking_craft;
    function woodwork_craft(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        let value = craft_1.CraftProbability.basic_wood(character);
        alerts_1.Alerts.craft(user, 'craft_spear', value);
        alerts_1.Alerts.craft(user, 'craft_bone_spear', value);
        alerts_1.Alerts.craft(user, 'craft_wood_bow', value);
        alerts_1.Alerts.craft(user, 'craft_bone_arrow', craft_1.CraftProbability.arrow(character));
    }
    SendUpdate.woodwork_craft = woodwork_craft;
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
        alerts_1.Alerts.generic_user_alert(user, 'hp', { c: character.status.hp, m: character.stats.max.hp });
    }
    SendUpdate.hp = hp;
    function market(user) {
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        // let data = 
        //     let user = this.world.user_manager.get_user_from_character(character);
        //     if (user != undefined) {
        //         let data = this.prepare_market_orders(market)
        //     this.send_to_character_user(character, 'market-data', data)
        //     }
        // }
    }
    SendUpdate.market = market;
    function explored(user) {
        console.log('send exploration');
        // var stack = new Error().stack
        // console.log( stack )
        let character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.generic_user_alert(user, 'explore', character.explored);
        map_position(user, true);
        console.log(character.explored);
        for (let i = 0; i < character.explored.length; i++) {
            if (character.explored[i]) {
                let cell = system_1.MapSystem.id_to_cell(i);
                if (cell != undefined) {
                    let x = cell.x;
                    let y = cell.y;
                    let data = cell.development;
                    let res1 = {};
                    res1[x + '_' + y] = data;
                    if (data != undefined) {
                        alerts_1.Alerts.generic_user_alert(user, 'map-data-cells', res1);
                    }
                    let res2 = { x: x, y: y, ter: cell.terrain };
                    alerts_1.Alerts.generic_user_alert(user, 'map-data-terrain', res2);
                }
            }
        }
    }
    SendUpdate.explored = explored;
    function map_position(user, teleport_flag) {
        console.log('send map position');
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
        console.log('send map position');
        map_position(user, false);
    }
    SendUpdate.map_position_move = map_position_move;
    function local_characters(user) {
        // prepare data
        const character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        const cell = systems_communication_1.Convert.character_to_cell(character);
        let characters_list = cell.get_characters_list();
        alerts_1.Alerts.generic_user_alert(user, 'cell-characters', characters_list);
    }
    SendUpdate.local_characters = local_characters;
    function local_actions(user) {
        const character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        const cell = systems_communication_1.Convert.character_to_cell(character);
        alerts_1.Alerts.map_action(user, 'hunt', cell.can_hunt());
        alerts_1.Alerts.map_action(user, 'clean', cell.can_clean());
        alerts_1.Alerts.map_action(user, 'gather_wood', cell.can_gather_wood());
    }
    SendUpdate.local_actions = local_actions;
    function map_related(user) {
        console.log('update map related');
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
    //     // user.socket.emit('map-data-cells', this.world.constants.development)
    //     // user.socket.emit('map-data-terrain', this.world.constants.terrain)
    function cell_probability(user) {
        const character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        alerts_1.Alerts.cell_action(user, 'hunt', difficulty_1.CellActionProb.hunt(character));
    }
    SendUpdate.cell_probability = cell_probability;
})(SendUpdate = exports.SendUpdate || (exports.SendUpdate = {}));
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
// function prepare_market_orders(market: Cell) {
//     let data = market.orders;
//     let orders_array = Array.from(data)
//     let responce: MarketOrderBulkJson[] = []
//     for (let order_id of orders_array) {
//         let order = this.world.get_order(order_id)
//         if (order.amount > 0) {
//             responce.push(order.get_json())
//         }
//     }
//     return responce
// }
// update_market_info(market: Cell) {
//     // console.log('sending market orders to client');
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
//                 console.log(i.current_user.login);
//             }
//         }
//     }
// }
// send_item_market_update_to_character(character: Character) {
//     let data = AuctionManagement.cell_id_to_orders_socket_data_list(this.world.entity_manager, character.cell_id)
//     this.send_to_character_user(character, 'item-market-data', data)
// }
