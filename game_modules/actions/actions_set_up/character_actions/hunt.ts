import { CharacterActionResponce } from "../../action_manager";
import { MEAT } from "../../../manager_classes/materials_manager";
import type { Character } from "../../../base_game_classes/character/character";
import { Convert } from "../../../systems_communication";


export const hunt = {
    duration(char: Character) {
        return 0.5 + char.get_fatigue() / 100 + (100 - char.skills.hunt) / 100;
    },

    check:  function(char:Character, data: map_position): CharacterActionResponce {
        if (!char.in_battle()) {
            let cell = Convert.character_to_cell(char);
            if (cell == undefined) {
                return CharacterActionResponce.INVALID_CELL
            }
            if (cell.can_hunt()) {
                return CharacterActionResponce.OK
            } else {
                return CharacterActionResponce.NO_RESOURCE
            }
        } else return CharacterActionResponce.IN_BATTLE
    },

    result:  function(char:Character, data: map_position) {

        let skill = char.skills.hunt
        let dice = Math.random()

        char.change_fatigue(10)

        if (dice * 100 < skill) {
            char.stash.inc(MEAT, 1)

            char.change_blood(5)
            char.send_status_update()
            char.send_stash_update()
            return CharacterActionResponce.OK
        } else {
            let dice = Math.random()
            if (dice * 100 > skill) {
                char.skills.hunt += 1
                char.send_skills_update()
            }
            char.change_stress(1)
            char.send_status_update()
            char.send_stash_update()
            return CharacterActionResponce.FAILED
        }
        
        
    },

    start:  function(char:Character, data: map_position) {
    },
}

export function hunt_probability(skill: number) {
    return Math.min(skill / 100, 1)
}

export function character_to_hunt_probability(character:Character) {
    let skill = character.skills.hunt
    return hunt_probability(skill)
}