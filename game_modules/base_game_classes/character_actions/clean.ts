import { CharacterGenericPart } from "../character_generic_part";
import { CharacterActionResponce } from "../../manager_classes/action_manager";

export const clean = {
    duration(char: CharacterGenericPart) {
        return 1 + char.get_fatigue() / 50 + char.get_blood() / 50;
    },

    check: async function(pool: any, char:CharacterGenericPart, data: any): Promise<CharacterActionResponce> {
        if (!char.in_battle()) {
            let cell = char.get_cell();
            if (cell == undefined) {
                return CharacterActionResponce.INVALID_CELL
            }
            let tmp = char.stash.get(char.world.materials.WATER);
            if (cell.can_clean()) {
                return CharacterActionResponce.OK
            } else if (tmp > 0)  {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result: async function(pool: any, char:CharacterGenericPart, data: any) {
        let cell = char.get_cell();
        if (cell == undefined) {
            return CharacterActionResponce.INVALID_CELL
        }
        let tmp = char.stash.get(char.world.materials.WATER);
        if (cell.can_clean()) {
            char.changed = true
            char.change_blood(-100)
            char.send_status_update()
        } else if (tmp > 0) {
            char.changed = true
            char.change_blood(-20);
            char.stash.inc(char.world.materials.WATER, -1);
            char.send_stash_update()
            char.send_status_update()
        }
    },

    start: async function(pool: any, char:CharacterGenericPart, data: any) {
    },
}