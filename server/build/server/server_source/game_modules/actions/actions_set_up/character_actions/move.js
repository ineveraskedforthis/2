"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.move = void 0;
const system_1 = require("../../../map/system");
const events_1 = require("../../../events/events");
exports.move = {
    duration(char) {
        let duration = 1;
        duration += char.get_fatigue() / 100;
        if (char.equip.data.armour.foot == undefined) {
            duration = duration * 1.5;
        }
        else {
            duration = duration * (1.5 - char.equip.data.armour.foot.durability / 200);
        }
        duration = duration * (1 - char.skills.travelling / 200);
        return duration;
    },
    check: function (char, data) {
        if (char.in_battle()) {
            return 2 /* CharacterActionResponce.IN_BATTLE */;
        }
        if (system_1.MapSystem.can_move(data)) {
            let [x, y] = system_1.MapSystem.id_to_coordinate(char.cell_id);
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
        const new_cell = system_1.MapSystem.coordinate_to_cell(character.next_cell);
        if (new_cell == undefined) {
            console.log('something wrong with movement');
            console.log(character.next_cell);
            return;
        }
        events_1.Event.move(character, new_cell);
    },
    is_move: true
};













































