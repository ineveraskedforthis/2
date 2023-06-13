import { Character } from "../character/character";
import { ScriptedValue } from "../events/scripted_values";

export function tired(character: Character) {
    return (character.get_fatigue() > ScriptedValue.rest_target_fatigue(0, 0, character.race()) + 10) 
        || (character.get_stress()  > ScriptedValue.rest_target_stress(0, 0, character.race()) + 10);
}

export function low_hp(character: Character) {
    return character.get_hp() < 0.5 * character.get_max_hp();
}
