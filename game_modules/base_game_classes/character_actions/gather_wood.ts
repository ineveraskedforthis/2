import { Cell } from "../../cell";
import { CharacterActionResponce } from "../../manager_classes/action_manager";
import { WOOD } from "../../manager_classes/materials_manager";
import { PgPool } from "../../world";
import type { CharacterGenericPart } from "../character_generic_part";


export const gather_wood = {
    duration(char: CharacterGenericPart) {
        return 1 + char.get_fatigue() / 50;
    },

    check: async function(pool: PgPool, char:CharacterGenericPart, data: any): Promise<CharacterActionResponce> {
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

    result: async function(pool: PgPool, char:CharacterGenericPart, data: any) {
        char.changed = true
        char.change_fatigue(10)
        char.stash.inc(WOOD, 1)
        char.change_blood(1)
        char.change_stress(1)
        char.send_status_update()
        char.send_stash_update()
        return CharacterActionResponce.OK
    },

    start: async function(pool: PgPool, char:CharacterGenericPart, data: any) {
    },
}

export function can_gather_wood(cell:Cell) {
    return cell.development.wild > 0
}