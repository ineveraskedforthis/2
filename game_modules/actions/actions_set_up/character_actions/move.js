"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.move = void 0;
const system_1 = require("../../../map/system");
const systems_communication_1 = require("../../../systems_communication");
const user_manager_1 = require("../../../client_communication/user_manager");
exports.move = {
    duration(char) {
        return 1 + char.get_fatigue() / 30;
    },
    check: function (char, data) {
        if (char.in_battle()) {
            return 2 /* CharacterActionResponce.IN_BATTLE */;
        }
        console.log('attempt to move');
        console.log(data);
        console.log(system_1.MapSystem.can_move(data));
        if (system_1.MapSystem.can_move(data)) {
            let [x, y] = system_1.MapSystem.id_to_coordinate(char.cell_id);
            let dx = data[0] - x;
            let dy = data[1] - y;
            console.log(dx, dy);
            console.log(x, y);
            console.log(char.cell_id);
            console.log(system_1.MapSystem.is_valid_move(dx, dy));
            if (system_1.MapSystem.is_valid_move(dx, dy)) {
                return 1 /* CharacterActionResponce.OK */;
            }
            if ((dx == 0 && dy == 0)) {
                return 7 /* CharacterActionResponce.ZERO_MOTION */;
            }
            return 0 /* CharacterActionResponce.CANNOT_MOVE_THERE */;
        }
        return 0 /* CharacterActionResponce.CANNOT_MOVE_THERE */;
    },
    start: function (char, data) {
        char.next_cell = data;
    },
    result: function (character) {
        if (character.next_cell == undefined)
            return;
        const new_cell = system_1.MapSystem.coordinate_to_cell(character.next_cell);
        if (new_cell == undefined) {
            console.log('something wrong with movement');
            console.log(character.next_cell);
            return;
        }
        const old_cell = systems_communication_1.Convert.character_to_cell(character);
        systems_communication_1.Unlink.character_and_cell(character, old_cell);
        systems_communication_1.Link.character_and_cell(character, new_cell);
        // effect on fatigue
        character.change('fatigue', 2);
        //check if it is user and you need to update status
        const user = systems_communication_1.Convert.character_to_user(character);
        if (user != undefined) {
            user_manager_1.UserManagement.add_user_to_update_queue(user.data.id, 1 /* UI_Part.STATUS */);
        }
    },
    is_move: true
};
