import type { CharacterGenericPart } from "../character_generic_part";
import { CharacterActionResponce } from "../../manager_classes/action_manager";

export const eat = {
    check: async function(pool: any, char:CharacterGenericPart, data: any): Promise<CharacterActionResponce> {
        if (!char.in_battle()) {
            let tmp = char.stash.get(char.world.materials.FOOD);
            if (tmp > 0) {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result: async function(pool: any, char:CharacterGenericPart, data: any) {
        char.changed = true
        char.change_hp(10);
        char.stash.inc(char.world.materials.FOOD, -1);
        char.send_stash_update()
        char.send_status_update()
    },

    start: async function(pool: any, char:CharacterGenericPart, data: any) {
    },
}