import { Character } from "../../../base_game_classes/character/character";
import { CharacterActionResponce } from "../../action_manager";
import { WATER } from "../../../manager_classes/materials_manager";
import { PgPool } from "../../../world";

export const clean = {
    duration(char: Character) {
        return 1 + char.get_fatigue() / 50 + char.get_blood() / 50;
    },

    check: async function(pool: PgPool, char:Character, data: any): Promise<CharacterActionResponce> {
        if (!char.in_battle()) {
            let cell = char.get_cell();
            if (cell == undefined) {
                return CharacterActionResponce.INVALID_CELL
            }
            let tmp = char.stash.get(WATER);
            if (cell.can_clean()) {
                return CharacterActionResponce.OK
            } else if (tmp > 0)  {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result: async function(pool: PgPool, char:Character, data: any) {
        let cell = char.get_cell();
        if (cell == undefined) {
            return CharacterActionResponce.INVALID_CELL
        }
        let tmp = char.stash.get(WATER);
        if (cell.can_clean()) {
            char.changed = true
            char.change_blood(-100)
            char.send_status_update()
        } else if (tmp > 0) {
            char.changed = true
            char.change_blood(-20);
            char.stash.inc(WATER, -1);
            char.send_stash_update()
            char.send_status_update()
        }
    },

    start: async function(pool: PgPool, char:Character, data: any) {
    },
}