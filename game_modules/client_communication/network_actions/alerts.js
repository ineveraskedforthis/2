"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alerts = void 0;
const systems_communication_1 = require("../../systems_communication");
var Alerts;
(function (Alerts) {
    function not_enough_to_user(user, tag, required, current) {
        generic_user_alert(user, 'not_enough', { tag: tag, req: required, cur: current });
    }
    Alerts.not_enough_to_user = not_enough_to_user;
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
        console.log('emit ' + tag + ' ' + JSON.stringify(msg));
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
    function craft(user, tag, value) {
        Alerts.generic_user_alert(user, 'craft-probability', { tag: tag, value: value });
    }
    Alerts.craft = craft;
    function skill(user, tag, value) {
        Alerts.generic_user_alert(user, 'skill', { tag: tag, value: value });
    }
    Alerts.skill = skill;
    function battle_action_chance(user, tag, value) {
        Alerts.generic_user_alert(user, 'b-action-chance', { tag: tag, value: value });
    }
    Alerts.battle_action_chance = battle_action_chance;
    function battle_event(battle, tag, unit_id, position, target) {
        battle.last_event_index += 1;
        const Event = {
            tag: tag,
            creator: unit_id,
            target_position: position,
            target_unit: target,
            index: battle.last_event_index
        };
        for (let unit of battle.heap.raw_data) {
            const character = systems_communication_1.Convert.unit_to_character(unit);
            generic_character_alert(character, 'battle-event', Event);
        }
    }
    Alerts.battle_event = battle_event;
    function new_unit(battle, unit) {
        for (let unit of battle.heap.raw_data) {
            const character = systems_communication_1.Convert.unit_to_character(unit);
            generic_character_alert(character, 'battle-new-character', systems_communication_1.Convert.unit_to_unit_socket(unit));
        }
    }
    Alerts.new_unit = new_unit;
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
})(Alerts = exports.Alerts || (exports.Alerts = {}));
