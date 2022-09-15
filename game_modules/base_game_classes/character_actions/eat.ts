import type { Character } from "../character/character";
import { CharacterActionResponce } from "../../manager_classes/action_manager";
import { FOOD } from "../../manager_classes/materials_manager";
import { PgPool } from "../../world";

export const eat = {
    duration(char: Character) {
        return 1 + char.get_fatigue() / 20;
    },

    check: async function(pool: PgPool, char:Character, data: any): Promise<CharacterActionResponce> {
        if (!char.in_battle()) {
            let tmp = char.stash.get(FOOD);
            if (tmp > 0) {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result: async function(pool: PgPool, char:Character, data: any) {
        char.changed = true
        char.change_hp(10);
        char.stash.inc(FOOD, -1);
        char.send_stash_update()
        char.send_status_update()
    },

    start: async function(pool: PgPool, char:Character, data: any) {
    },
}