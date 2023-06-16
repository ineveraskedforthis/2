import { Character } from "../character/character";
import { Event } from "../events/events";
import { Convert } from "../systems_communication";
import { GenericRest } from "./AI_ROUTINE_GENERIC";
import { urban_walk } from "./actions";
import { AIhelper } from "./helpers";

export function GuardUrbanRoutine(character: Character) {    
    GenericRest(character);

    let target = AIhelper.enemies_in_cell(character)
    const target_char = Convert.id_to_character(target)
    if (target_char != undefined) {
        Event.start_battle(character, target_char)
    } else {
        urban_walk(character)
        return
    }
}