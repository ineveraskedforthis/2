import { Character, CharacterMapAction, NotificationResponse, TriggerResponse } from "../data/entities/character";
import { MapSystem } from "../map/system";
import { Event } from "../events/events";
import { cell_id } from "@custom_types/ids";
import { Data } from "../data/data_objects";
import { DataID } from "../data/data_id";
import { CharacterValues } from "../scripted-values/character";

export const move:CharacterMapAction ={
    duration(char: Character) {
        return CharacterValues.movement_duration_map(char);
    },

    check: function (char: Character, cell: cell_id) : TriggerResponse {
        if (char.in_battle()) {
            return NotificationResponse.InBattle
        }
        if (char.open_shop) {
            return NotificationResponse.ShopOpened
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
                return { response: 'Notification:', value: "You have to select another tile", tag: "condition_failed" }
            }
            return { response: 'Notification:', value: "You can travel only to neighbouring tiles", tag: "condition_failed"  }
        }
        return { response: 'Notification:', value: "You can't travel to this cell due to terrain", tag: "condition_failed"  }
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

        const possible_locations = DataID.Cells.locations(new_cell)
        const valid_locations = possible_locations.filter((item) => {
            const object = Data.Locations.from_id(item); return object.has_house_level == 0
        })
        const random_index = Math.floor(Math.random() * valid_locations.length)

        Event.move(character, valid_locations[random_index])
    },

    is_move: true
}