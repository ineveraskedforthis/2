"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Alerts = void 0;
var Alerts;
(function (Alerts) {
    function not_enough_to_user(user, tag, required, current) {
        generic_user_alert(user, 'not_enough', { tag: tag, req: required, cur: current });
    }
    Alerts.not_enough_to_user = not_enough_to_user;
    function not_enough_to_character(character, tag, required, current) {
        let user = character_to_user(character);
        if (user == undefined)
            return;
        not_enough_to_user(user, tag, required, current);
    }
    function generic_user_alert(user, tag, msg) {
        user.socket.emit(tag, msg);
    }
    function generic_character_alert(character, tag, msg) {
        let user = character_to_user(character);
        if (user == undefined)
            return;
        generic_user_alert(user, tag, msg);
    }
})(Alerts = exports.Alerts || (exports.Alerts = {}));
