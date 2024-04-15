"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandleAction = void 0;
const manager_1 = require("../../actions/manager");
const actions_00_1 = require("../../actions/actions_00");
const systems_communication_1 = require("../../systems_communication");
const user_manager_1 = require("../user_manager");
const alerts_1 = require("./alerts");
const actions_1 = require("../../battle/actions");
const common_validations_1 = require("./common_validations");
const data_objects_1 = require("../../data/data_objects");
const heap_1 = require("../../battle/classes/heap");
var HandleAction;
(function (HandleAction) {
    function response_to_alert(user, response) {
        // console.log(response.response)
        switch (response.response) {
            case "Notification:": alerts_1.Alerts.generic_user_alert(user, "alert", response.value);
            case "OK": return;
            case "Not enough resources": alerts_1.Alerts.generic_user_alert(user, "alert", "Not enough: " + JSON.stringify(response.value));
        }
    }
    function move(sw, data) {
        // do not handle unlogged or characterless
        if (sw.user_id == undefined)
            return;
        const user = user_manager_1.UserManagement.get_user(sw.user_id);
        const character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        // sanitise data
        const x = Number(data.x);
        const y = Number(data.y);
        if ((Number.isNaN(x)) || (Number.isNaN(y))) {
            return;
        }
        const destination = [x, y];
        const cell = data_objects_1.Data.World.coordinate_to_id(destination);
        let response = manager_1.ActionManager.start_action(actions_00_1.CharacterAction.MOVE, character, cell);
        response_to_alert(user, response);
    }
    HandleAction.move = move;
    function act(sw, action) {
        // do not handle unlogged or characterless
        if (sw.user_id == undefined)
            return;
        const user = user_manager_1.UserManagement.get_user(sw.user_id);
        const character = systems_communication_1.Convert.user_to_character(user);
        if (character == undefined)
            return;
        const destination = character.cell_id;
        let response = manager_1.ActionManager.start_action(action, character, destination);
        // console.log(response)
        response_to_alert(user, response);
    }
    HandleAction.act = act;
    function battle_self(sw, tag) {
        // console.log('action self', tag)
        if (typeof tag != 'string')
            return;
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        if (!character.in_battle())
            return;
        const battle = systems_communication_1.Convert.character_to_battle(character);
        if (battle == undefined)
            return;
        if (!battle.waiting_for_input) {
            console.log('not waiting for input');
            return;
        }
        if (heap_1.CharactersHeap.get_selected_unit(battle)?.id != character.id) {
            console.log('not selected unit');
            return;
        }
        console.log('action is validated');
        (0, actions_1.battle_action_self)(tag, battle, character);
    }
    HandleAction.battle_self = battle_self;
    function battle_unit(sw, action) {
        // console.log('action unit', action)
        if (!common_validations_1.Validator.is_tag_value(action)) {
            return;
        }
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        if (!character.in_battle())
            return;
        const battle = systems_communication_1.Convert.character_to_battle(character);
        if (battle == undefined)
            return;
        if (!battle.waiting_for_input) {
            return;
        }
        if (heap_1.CharactersHeap.get_selected_unit(battle)?.id != character.id) {
            return;
        }
        const target_unit = heap_1.CharactersHeap.get_unit(battle, action.target);
        if (target_unit == undefined)
            return;
        (0, actions_1.battle_action_character)(action.tag, battle, character, target_unit);
    }
    HandleAction.battle_unit = battle_unit;
    function battle_position(sw, action) {
        // console.log('action position', action)
        if (!common_validations_1.Validator.is_tag_point(action))
            return;
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        if (!character.in_battle())
            return;
        const battle = systems_communication_1.Convert.character_to_battle(character);
        if (battle == undefined)
            return;
        const unit = character;
        if (unit == undefined)
            return;
        if (!battle.waiting_for_input) {
            return;
        }
        if (heap_1.CharactersHeap.get_selected_unit(battle)?.id != unit.id) {
            return;
        }
        const target = action.target;
        (0, actions_1.battle_action_position)(action.tag, battle, character, target);
    }
    HandleAction.battle_position = battle_position;
})(HandleAction || (exports.HandleAction = HandleAction = {}));
