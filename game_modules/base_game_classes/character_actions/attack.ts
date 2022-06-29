import { CharacterActionResponce } from "../../manager_classes/action_manager";
import type { CharacterGenericPart } from "../character_generic_part";


export const attack = {
    duration(char: CharacterGenericPart) {
        return 0
    },

    check: async function(pool: any, char:CharacterGenericPart, data: any): Promise<CharacterActionResponce> {
        if (!char.in_battle()) {
            let cell = char.get_cell();
            if (cell == undefined) {
                return CharacterActionResponce.INVALID_CELL
            }
            let targets = cell.get_characters_set()
            let target = undefined
            for (let id of targets) {
                let target_char = char.world.get_char_from_id(id)
                if ((target_char.get_tag() == 'test') && (char.get_tag() == 'rat') || (target_char.get_tag() == 'rat') && (char.get_tag() == 'test')) {
                    if (!target_char.in_battle()) {
                        target = target_char
                    }
                }
            } 
            if (target == undefined) {
                return CharacterActionResponce.NO_RESOURCE
            } else {
                char.action_target = target.id
                return CharacterActionResponce.OK
            }
        } else return CharacterActionResponce.IN_BATTLE
    },

    result: async function(pool: any, char:CharacterGenericPart, data: any) {
        let target_char = char.world.get_char_from_id(char.action_target)
        await char.world.create_battle(pool, [char], [target_char])
    },

    start: async function(pool: any, char:CharacterGenericPart, data: any) {
    },

    immediate: true
}