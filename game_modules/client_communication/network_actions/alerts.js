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
        console.log('emit ' + tag + ' ' + msg);
        user.socket.emit(tag, msg);
    }
    Alerts.generic_user_alert = generic_user_alert;
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
    function battle_action(user, tag, value) {
        Alerts.generic_user_alert(user, 'b-action-chance', { tag: tag, value: value });
    }
    Alerts.battle_action = battle_action;
    function map_action(user, tag, data) {
        Alerts.generic_user_alert(user, 'map-action-status', { tag: tag, value: data });
    }
    Alerts.map_action = map_action;
})(Alerts = exports.Alerts || (exports.Alerts = {}));
