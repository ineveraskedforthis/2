import { Character } from "../character/character";

export function tired(character: Character) {
    return (character.get_fatigue() > 70) || (character.get_stress() > 30);
}
export function low_hp(character: Character) {
    return character.get_hp() < 0.5 * character.get_max_hp();
}
