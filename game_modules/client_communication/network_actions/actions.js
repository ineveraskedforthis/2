"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandleAction = void 0;
const action_manager_1 = require("../../actions/action_manager");
const systems_communication_1 = require("../../systems_communication");
const user_manager_1 = require("../user_manager");
const alerts_1 = require("./alerts");
var HandleAction;
(function (HandleAction) {
    function move(sw, data) {
        // do not handle unlogged or characterless
        if (sw.user_id == '#')
            return;
        const user = user_manager_1.UserManagement.get_user(sw.user_id);
        const character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        // sanitise data
        const x = Number(data.x);
        const y = Number(data.y);
        if ((x == NaN) || (y == NaN)) {
            return;
        }
        const destination = [x, y];
        let responce = action_manager_1.ActionManager.start_action(action_manager_1.CharacterAction.MOVE, character, destination);
        if (responce == 0 /* CharacterActionResponce.CANNOT_MOVE_THERE */) {
            alerts_1.Alerts.impossible_move(user);
        }
        else if (responce == 2 /* CharacterActionResponce.IN_BATTLE */) {
            alerts_1.Alerts.in_battle(user);
        }
    }
    HandleAction.move = move;
})(HandleAction = exports.HandleAction || (exports.HandleAction = {}));
//  move(user: User, data: {x: number, y: number}) {
//     if (!user.logged_in) {
//         return 
//     }
//     let char = user.get_character();
// }
