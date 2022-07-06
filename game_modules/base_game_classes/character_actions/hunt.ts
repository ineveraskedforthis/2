import { CharacterActionResponce } from "../../manager_classes/action_manager";
import type { CharacterGenericPart } from "../character_generic_part";


export const hunt = {
    duration(char: CharacterGenericPart) {
        return 1 + char.get_fatigue() / 20 + (100 - char.skills.hunt.practice) / 20;
    },

    check: async function(pool: any, char:CharacterGenericPart, data: any): Promise<CharacterActionResponce> {
        if (!char.in_battle()) {
            let cell = char.get_cell();
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

    result: async function(pool: any, char:CharacterGenericPart, data: any) {
        char.changed = true

        let skill = char.skills.hunt.practice
        let dice = Math.random()

        char.change_fatigue(10)

        if (dice * 100 < skill) {
            char.stash.inc(char.world.materials.MEAT, 1)
            char.change_blood(5)
            char.send_status_update()
            char.send_stash_update()
            return CharacterActionResponce.OK
        } else {
            let dice = Math.random()
            if (dice * 100 > skill) {
                char.skills.hunt.practice += 1
                char.send_skills_update()
            }
            char.change_stress(1)
            char.send_status_update()
            char.send_stash_update()
            return CharacterActionResponce.FAILED
        }
        
        
    },

    start: async function(pool: any, char:CharacterGenericPart, data: any) {
    },
}

export function hunt_probability(skill: number) {
    return Math.min(skill / 100, 1)
}

export function character_to_hunt_probability(character:CharacterGenericPart) {
    let skill = character.skills.hunt.practice
    return hunt_probability(skill)
}