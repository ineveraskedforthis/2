import { Character } from "../character/character";
import { Event } from "../events/events";
import { Convert } from "../systems_communication";
import { rest_building, rest_outside, urban_walk } from "./actions";
import { AIhelper } from "./helpers";
import { tired } from "./triggers";

export function GuardUrbanRoutine(character: Character) {
    
    if (tired(character)) {
        let responce = rest_building(character, character.savings.get())
        if (!responce) {
            rest_outside(character)
            return
        }
        return
    }

    let target = AIhelper.enemies_in_cell(character)
    const target_char = Convert.id_to_character(target)
    if (target_char != undefined) {
        Event.start_battle(character, target_char)
    } else {
        urban_walk(character)
        return
    }
}