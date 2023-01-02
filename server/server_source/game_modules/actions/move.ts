import { Character } from "../character/character";
import {ActionTargeted, CharacterActionResponce} from './action_manager'
import { MapSystem } from "../map/system";
import { Event } from "../events/events";

export const move:ActionTargeted ={
    duration(char: Character) {
        let duration = 1
        duration += char.get_fatigue() / 100
        if (char.equip.data.armour.foot == undefined) {
            duration = duration * 1.5
        } else {
            duration = duration * (1.5 - char.equip.data.armour.foot.durability / 200)
        }
        duration = duration * (1 - char.skills.travelling / 200)

        return duration;
    },

    check: function (char: Character, data: [number, number]) {
        if (char.in_battle()) {
            return CharacterActionResponce.IN_BATTLE
        }
        if (MapSystem.can_move(data)) {
            let [x, y] = MapSystem.id_to_coordinate(char.cell_id)
            let dx = data[0] - x;
            let dy = data[1] - y;
            if (MapSystem.is_valid_move(dx, dy)) {
                return CharacterActionResponce.OK
            }
            if ((dx == 0 && dy ==0)) {
                return CharacterActionResponce.ZERO_MOTION
            }
            return CharacterActionResponce.CANNOT_MOVE_THERE
        }
        return CharacterActionResponce.CANNOT_MOVE_THERE
    },

    start: function (char: Character, data: any) {
        char.next_cell = data
    },

    result: function (character: Character) {
        if (character.next_cell == undefined) return
        const new_cell = MapSystem.coordinate_to_cell(character.next_cell)
        if (new_cell == undefined) {
            console.log('something wrong with movement')
            console.log(character.next_cell)
            return
        }
        Event.move(character, new_cell)
    },

    is_move: true
}