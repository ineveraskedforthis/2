"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alerts = void 0;
const system_1 = require("../../battle/system");
const systems_communication_1 = require("../../systems_communication");
const user_manager_1 = require("../user_manager");
const data_1 = require("../../data");
var Alerts;
(function (Alerts) {
    function not_enough_to_user(user, tag, required, current) {
        generic_user_alert(user, 'not_enough', { tag: tag, req: required, cur: current });
    }
    Alerts.not_enough_to_user = not_enough_to_user;
    function market_data(user, data) {
        generic_user_alert(user, 'market-data', data);
    }
    Alerts.market_data = market_data;
    function item_market_data(user, data) {
        generic_user_alert(user, 'item-market-data', data);
    }
    Alerts.item_market_data = item_market_data;
    function in_battle(user) {
        generic_user_alert(user, 'alert', 'you are in battle');
    }
    Alerts.in_battle = in_battle;
    function character_removed(user) {
        generic_user_alert(user, 'char-removed', undefined);
    }
    Alerts.character_removed = character_removed;
    function ok(user) {
        generic_user_alert(user, 'alert', 'ok');
    }
    Alerts.ok = ok;
    function impossible_move(user) {
        generic_user_alert(user, 'alert', 'can\'t go there');
    }
    Alerts.impossible_move = impossible_move;
    function failed(character) {
        generic_character_alert(character, 'alert', 'failed');
    }
    Alerts.failed = failed;
    function no_character(user) {
        generic_user_alert(user, 'no-character', '');
    }
    Alerts.no_character = no_character;
    function log_to_user(user, message) {
        user.socket.emit('log-message', message);
    }
    Alerts.log_to_user = log_to_user;
    function log_attack(character, attack, resistance, total_damage, role) {
        generic_character_alert(character, 'log-attack', {
            attack: attack,
            res: resistance,
            total: total_damage,
            role: role
        });
    }
    Alerts.log_attack = log_attack;
    function login_is_completed(user) {
        user.socket.emit('is-login-completed', 'ok');
    }
    Alerts.login_is_completed = login_is_completed;
    function not_enough_to_character(character, tag, required, current) {
        let user = systems_communication_1.Convert.character_to_user(character);
        if (user == undefined)
            return;
        not_enough_to_user(user, tag, required, current);
    }
    Alerts.not_enough_to_character = not_enough_to_character;
    function generic_user_alert(user, tag, msg) {
        if (!user.logged_in)
            return;
        user.socket.emit(tag, msg);
    }
    Alerts.generic_user_alert = generic_user_alert;
    function battle_progress(user, flag) {
        if (!user.logged_in)
            return;
        user.socket.emit('battle-in-process', flag);
    }
    Alerts.battle_progress = battle_progress;
    function generic_character_alert(character, tag, msg) {
        let user = systems_communication_1.Convert.character_to_user(character);
        if (user == undefined)
            return;
        generic_user_alert(user, tag, msg);
    }
    Alerts.generic_character_alert = generic_character_alert;
    function craft_bulk(user, tag, value) {
        Alerts.generic_user_alert(user, 'craft-bulk', { tag: tag, value: value });
    }
    Alerts.craft_bulk = craft_bulk;
    function craft_bulk_complete(user, tag, value) {
        Alerts.generic_user_alert(user, 'craft-bulk-complete', { tag: tag, value: value });
    }
    Alerts.craft_bulk_complete = craft_bulk_complete;
    function craft_item(user, tag, value) {
        Alerts.generic_user_alert(user, 'craft-item', { tag: tag, value: value });
    }
    Alerts.craft_item = craft_item;
    function craft_item_complete(user, tag, value) {
        Alerts.generic_user_alert(user, 'craft-item-complete', { tag: tag, value: value });
    }
    Alerts.craft_item_complete = craft_item_complete;
    function skill(user, tag, value) {
        Alerts.generic_user_alert(user, 'skill', { tag: tag, value: value });
    }
    Alerts.skill = skill;
    function battle_action_chance(user, tag, value) {
        Alerts.generic_user_alert(user, 'b-action-chance', { tag: tag, value: value });
    }
    Alerts.battle_action_chance = battle_action_chance;
    function battle_action_damage(user, tag, value) {
        Alerts.generic_user_alert(user, 'b-action-damage', { tag: tag, value: value });
    }
    Alerts.battle_action_damage = battle_action_damage;
    function battle_event(battle, tag, unit_id, position, target, cost) {
        battle.last_event_index += 1;
        const Event = {
            tag: tag,
            creator: unit_id,
            target_position: position,
            target_unit: target,
            index: battle.last_event_index,
            cost: cost,
        };
        if ((tag == 'update') || (tag == 'unit_join') || (tag == 'new_turn')) {
            let unit_data = systems_communication_1.Convert.unit_to_unit_socket(battle.heap.get_unit(unit_id));
            Event.data = unit_data;
        }
        for (let unit of Object.values(battle.heap.data)) {
            if (unit == undefined)
                continue;
            const character = systems_communication_1.Convert.unit_to_character(unit);
            generic_character_alert(character, 'battle-event', Event);
        }
    }
    Alerts.battle_event = battle_event;
    function battle_update_data(battle) {
        const data = system_1.BattleSystem.data(battle);
        for (let unit of Object.values(battle.heap.data)) {
            const character = systems_communication_1.Convert.unit_to_character(unit);
            generic_character_alert(character, 'battle-update-units', data);
        }
    }
    Alerts.battle_update_data = battle_update_data;
    function battle_update_units(battle) {
        for (let unit of Object.values(battle.heap.data)) {
            Alerts.battle_event(battle, 'update', unit.id, unit.position, unit.id, 0);
        }
    }
    Alerts.battle_update_units = battle_update_units;
    function battle_update_unit(battle, unit) {
        Alerts.battle_event(battle, 'update', unit.id, unit.position, unit.id, 0);
        // const data = Convert.unit_to_unit_socket(unit)
        // for (let unit of battle.heap.raw_data) {
        //     const character = Convert.unit_to_character(unit)
        //     generic_character_alert(character, 'battle-update-unit', data)
        // }
    }
    Alerts.battle_update_unit = battle_update_unit;
    function battle_to_character(battle, character) {
        const data = system_1.BattleSystem.data(battle);
        generic_character_alert(character, 'battle-update-units', data);
    }
    Alerts.battle_to_character = battle_to_character;
    function new_unit(battle, new_unit) {
        for (let unit of Object.values(battle.heap.data)) {
            const character = systems_communication_1.Convert.unit_to_character(unit);
            generic_character_alert(character, 'battle-new-unit', systems_communication_1.Convert.unit_to_unit_socket(new_unit));
        }
    }
    Alerts.new_unit = new_unit;
    function remove_unit(battle, removed_unit) {
        for (let unit of Object.values(battle.heap.data)) {
            const character = systems_communication_1.Convert.unit_to_character(unit);
            generic_character_alert(character, 'battle-remove-unit', systems_communication_1.Convert.unit_to_unit_socket(removed_unit));
        }
    }
    Alerts.remove_unit = remove_unit;
    function cell_locals(cell) {
        const locals = data_1.Data.Cells.get_characters_list_from_cell(cell);
        for (let item of locals) {
            // const id = item.id
            const local_character = systems_communication_1.Convert.id_to_character(item);
            const local_user = systems_communication_1.Convert.character_to_user(local_character);
            if (local_user == undefined) {
                continue;
            }
            user_manager_1.UserManagement.add_user_to_update_queue(local_user.data.id, 8 /* UI_Part.LOCAL_CHARACTERS */);
        }
    }
    Alerts.cell_locals = cell_locals;
    function map_action(user, tag, data) {
        Alerts.generic_user_alert(user, 'map-action-status', { tag: tag, value: data });
    }
    Alerts.map_action = map_action;
    function cell_action(user, tag, data) {
        generic_user_alert(user, 'cell-action-chance', { tag: tag, value: data });
    }
    Alerts.cell_action = cell_action;
    function action_ping(character, duration, is_move) {
        generic_character_alert(character, 'action-ping', { tag: 'start', time: duration, is_move: is_move });
    }
    Alerts.action_ping = action_ping;
    function perks(user, character) {
        Alerts.generic_user_alert(user, 'perks-update', character.perks);
    }
    Alerts.perks = perks;
})(Alerts = exports.Alerts || (exports.Alerts = {}));
