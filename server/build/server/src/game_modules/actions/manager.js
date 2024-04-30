"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionManager = void 0;
const alerts_1 = require("../client_communication/network_actions/alerts");
const data_objects_1 = require("../data/data_objects");
var ActionManager;
(function (ActionManager) {
    function start_action(action, char, cell) {
        if (char.action != undefined) {
            return { response: 'Notification:', value: "You are already doing something", tag: "condition_failed" };
        }
        let check = action.check(char, cell);
        if (check.response != "OK") {
            return check;
        }
        let duration = action.duration(char);
        alerts_1.Alerts.action_ping(char, duration, action.is_move || false);
        if (action.immediate) {
            call_action(action, char, cell);
        }
        else {
            action.start(char, cell);
            char.action = action;
            char.action_progress = 0;
            char.action_duration = duration;
        }
        return check;
    }
    ActionManager.start_action = start_action;
    function call_action(action, char, cell_id) {
        char.action = undefined;
        char.action_duration = 0;
        char.action_progress = 0;
        let check = action.check(char, cell_id);
        if (check.response == "OK") {
            action.result(char, cell_id);
        }
        return check;
    }
    ActionManager.call_action = call_action;
    function update_characters(dt) {
        data_objects_1.Data.Characters.for_each(character => {
            if (character.action != undefined) {
                character.action_progress += dt / 1000;
                if (character.action_progress > character.action_duration) {
                    call_action(character.action, character, character.next_cell || character.cell_id);
                }
            }
        });
    }
    ActionManager.update_characters = update_characters;
})(ActionManager || (exports.ActionManager = ActionManager = {}));
