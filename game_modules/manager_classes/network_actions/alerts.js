"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alerts = void 0;
const conversions_1 = require("../conversions");
const user_manager_1 = require("../user_manager");
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
        let user = conversions_1.Convert.character_to_user(user_manager_1.users_data_list, user_manager_1.users_online_list, character);
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
    function generic_character_alert(character, tag, msg) {
        let user = conversions_1.Convert.character_to_user(user_manager_1.users_data_list, user_manager_1.users_online_list, character);
        if (user == undefined)
            return;
        generic_user_alert(user, tag, msg);
    }
    Alerts.generic_character_alert = generic_character_alert;
})(Alerts = exports.Alerts || (exports.Alerts = {}));
