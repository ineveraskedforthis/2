import { Character } from "../character/character";
import { MapSystem } from "../map/system";
import { Event } from "../events/events";
import { CharacterSystem } from "../character/system";
import { CharacterMapAction, NotificationResponse, TriggerResponse } from "./types";
import { cell_id } from "@custom_types/ids";
import { Data } from "../data/data_objects";
import { DataID } from "../data/data_id";

export const move:CharacterMapAction ={
    duration(char: Character) {
        return CharacterSystem.movement_duration_map(char);
    },

    check: function (char: Character, cell: cell_id) : TriggerResponse {
        if (char.in_battle()) {
            return NotificationResponse.InBattle
        }
        const data = Data.World.id_to_coordinate(cell)
        if (MapSystem.can_move(data)) {
            let [x, y] = Data.World.id_to_coordinate(char.cell_id)
            let dx = data[0] - x;
            let dy = data[1] - y;
            if (MapSystem.is_valid_move(dx, dy)) {
                return { response: 'OK' }
            }
            if ((dx == 0 && dy == 0)) {
                return { response: 'Notification:', value: "You have to select another tile" }
            }
            return { response: 'Notification:', value: "You can travel only to neighbouring tiles" }
        }
        return { response: 'Notification:', value: "You can't travel to this cell due to terrain" }
    },

    start: function (char: Character, data: cell_id) {
        char.next_cell = data
    },

    result: function (character: Character) {
        if (character.next_cell == undefined) return
        const new_cell = character.next_cell
        if (new_cell == undefined) {
            console.log('something wrong with movement')
            console.log(character.next_cell)
            return
        }

        Event.move(character, DataID.Cells.main_location(new_cell))
    },

    is_move: true
}