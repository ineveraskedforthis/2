import type { Character } from "../../../base_game_classes/character/character";
import { CharacterActionResponce } from "../../action_manager";
import { FOOD } from "../../../manager_classes/materials_manager";
import { PgPool } from "../../../world";

export const eat = {
    duration(char: Character) {
        return 1 + char.get_fatigue() / 20;
    },

    check:  function(char:Character, data: map_position): CharacterActionResponce {
        if (!char.in_battle()) {
            let tmp = char.stash.get(FOOD);
            if (tmp > 0) {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result:  function(char:Character, data: map_position) {
        char.changed = true
        char.change_hp(10);
        char.stash.inc(FOOD, -1);
        char.send_stash_update()
        char.send_status_update()
    },

    start:  function(char:Character, data: map_position) {
    },
}