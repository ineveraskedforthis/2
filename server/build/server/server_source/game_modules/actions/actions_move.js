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
    check: function (char, cell) {
        if (char.in_battle()) {
            return { response: 'IN_BATTLE' };
        }
        const data = data_1.Data.World.id_to_coordinate(cell);
        if (system_1.MapSystem.can_move(data)) {
            let [x, y] = data_1.Data.World.id_to_coordinate(char.cell_id);
            let dx = data[0] - x;
            let dy = data[1] - y;
            if (system_1.MapSystem.is_valid_move(dx, dy)) {
                return { response: 'OK' };
            }
            if ((dx == 0 && dy == 0)) {
                return { response: 'ZERO_MOTION' };
            }
            return { response: 'INVALID_MOTION' };
        }
        return { response: 'INVALID_MOTION' };
    },
    start: function (char, data) {
        char.next_cell = data;
    },
    result: function (character) {
        if (character.next_cell == undefined)
            return;
        const new_cell = character.next_cell;
        if (new_cell == undefined) {
            console.log('something wrong with movement');
            console.log(character.next_cell);
            return;
        }
        events_1.Event.move(character, new_cell);
    },
    is_move: true
};
