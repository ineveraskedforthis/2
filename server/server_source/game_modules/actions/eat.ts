import type { Character } from "../character/character";
import { CharacterActionResponce } from "./action_manager";
import { FOOD } from "../manager_classes/materials_manager";
import { map_position } from "../types";
import { UserManagement } from "../client_communication/user_manager";
import { UI_Part } from "../client_communication/causality_graph";
import { Event } from "../events/events";

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
        char.change_hp(10);
        char.change_fatigue(-10)
        char.change_stress(-1)
        Event.change_stash(char, FOOD, -1)
        UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)
        UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)
    },

    start:  function(char:Character, data: map_position) {
    },
}