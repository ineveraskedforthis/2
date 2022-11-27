"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
const battle_calcs_1 = require("../../battle/battle_calcs");
const systems_communication_1 = require("../../systems_communication");
const alerts_1 = require("./alerts");
var Request;
(function (Request) {
    function accuracy(sw, distance) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        // console.log('request accuracy ' + distance)
        if (character == undefined)
            return;
        if (!user.logged_in) {
            return;
        }
        if (isNaN(distance)) {
            // console.log('not_a_number')
            return;
        }
        const acc = battle_calcs_1.Accuracy.ranged(character, distance);
        // console.log(acc)
        alerts_1.Alerts.battle_action_chance(user, 'shoot', acc);
    }
    Request.accuracy = accuracy;
})(Request = exports.Request || (exports.Request = {}));
