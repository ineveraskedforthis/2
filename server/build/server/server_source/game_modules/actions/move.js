"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.move = void 0;
const system_1 = require("../map/system");
const events_1 = require("../events/events");
const system_2 = require("../character/system");
const data_1 = require("../data");
exports.move = {
    duration(char) {
        return system_2.CharacterSystem.movement_duration_map(char);
    },
    check: function (char, data) {
        if (char.in_battle()) {
            return 2 /* CharacterActionResponce.IN_BATTLE */;
        }
        if (system_1.MapSystem.can_move(data)) {
            let [x, y] = data_1.Data.World.id_to_coordinate(char.cell_id);
            let dx = data[0] - x;
            let dy = data[1] - y;
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
        const new_cell = data_1.Data.World.coordinate_to_id(character.next_cell);
        if (new_cell == undefined) {
            console.log('something wrong with movement');
            console.log(character.next_cell);
            return;
        }
        events_1.Event.move(character, new_cell);
    },
    is_move: true
};
