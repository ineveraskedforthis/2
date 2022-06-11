import { CharacterActionResponce } from "../../manager_classes/action_manager";
import type { CharacterGenericPart } from "../character_generic_part";


export const gather_wood = {
    check: async function(pool: any, char:CharacterGenericPart, data: any): Promise<CharacterActionResponce> {
        if (!char.in_battle()) {
            let cell = char.get_cell();
            if (cell == undefined) {
                return CharacterActionResponce.INVALID_CELL
            }
            if (cell.development.wild > 0) {
                return CharacterActionResponce.OK
            } else {
                return CharacterActionResponce.NO_RESOURCE
            }
        } else return CharacterActionResponce.IN_BATTLE
    },

    result: async function(pool: any, char:CharacterGenericPart, data: any) {
        char.changed = true
        char.change_fatigue(10)
        char.stash.inc(char.world.materials.WOOD, 1)
        char.change_blood(5)
        char.send_status_update()
        char.send_stash_update()
    },

    start: async function(pool: any, char:CharacterGenericPart, data: any) {
    },
}