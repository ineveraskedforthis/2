"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.move = void 0;
const character_1 = require("../data/entities/character");
const system_1 = require("../map/system");
const events_1 = require("../events/events");
const data_objects_1 = require("../data/data_objects");
const data_id_1 = require("../data/data_id");
const character_2 = require("../scripted-values/character");
exports.move = {
    duration(char) {
        return character_2.CharacterValues.movement_duration_map(char);
    },
    check: function (char, cell) {
        if (char.in_battle()) {
            return character_1.NotificationResponse.InBattle;
        }
        if (char.open_shop) {
            return character_1.NotificationResponse.ShopOpened;
        }
        const data = data_objects_1.Data.World.id_to_coordinate(cell);
        if (system_1.MapSystem.can_move(data)) {
            let [x, y] = data_objects_1.Data.World.id_to_coordinate(char.cell_id);
            let dx = data[0] - x;
            let dy = data[1] - y;
            if (system_1.MapSystem.is_valid_move(dx, dy)) {
                return { response: 'OK' };
            }
            if ((dx == 0 && dy == 0)) {
                return { response: 'Notification:', value: "You have to select another tile", tag: "condition_failed" };
            }
            return { response: 'Notification:', value: "You can travel only to neighbouring tiles", tag: "condition_failed" };
        }
        return { response: 'Notification:', value: "You can't travel to this cell due to terrain", tag: "condition_failed" };
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
        const possible_locations = data_id_1.DataID.Cells.locations(new_cell);
        const valid_locations = possible_locations.filter((item) => {
            const object = data_objects_1.Data.Locations.from_id(item);
            return object.has_house_level == 0;
        });
        const random_index = Math.floor(Math.random() * valid_locations.length);
        events_1.Event.move(character, valid_locations[random_index]);
    },
    is_move: true
};
