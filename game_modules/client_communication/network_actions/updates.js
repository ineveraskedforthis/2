"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendUpdate = void 0;
const systems_communication_1 = require("../../systems_communication");
const alerts_1 = require("./alerts");
var SendUpdate;
(function (SendUpdate) {
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
        console.log(character);
        if (character == undefined)
            return;
        alerts_1.Alerts.generic_user_alert(user, 'status', { c: character.status, m: character.stats.max });
        // this.send_to_character_user(character, 'b-action-chance', {tag: 'attack', value: character.get_attack_chance('usual')})
    }
    SendUpdate.status = status;
})(SendUpdate = exports.SendUpdate || (exports.SendUpdate = {}));
