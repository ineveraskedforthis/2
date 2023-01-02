import { CharacterActionResponce } from "./action_manager";
import { FISH, MEAT } from "../manager_classes/materials_manager";
import type { Character } from "../character/character";
import { Convert } from "../systems_communication";
import { map_position } from "../types";
import { UserManagement } from "../client_communication/user_manager";
import { UI_Part } from "../client_communication/causality_graph";


export const hunt = {
    duration(char: Character) {
        return 0.5 + char.get_fatigue() / 100 + (100 - char.skills.hunt) / 100;
    },

    check:  function(char:Character, data: map_position): CharacterActionResponce {
        if (!char.in_battle()) {
            let cell = Convert.character_to_cell(char);
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

    result:  function(char:Character, data: map_position) {

        let skill = char.skills.hunt
        let dice = Math.random()

        char.change_fatigue(10)

        if (dice * 100 < skill) {
            char.stash.inc(MEAT, 1)
            char.change_blood(5)

            UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)
            UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)
            return CharacterActionResponce.OK
        } else {
            let dice = Math.random()
            if (dice * 100 > skill) {
                char.skills.hunt += 1
                UserManagement.add_user_to_update_queue(char.user_id, UI_Part.SKILLS)
            }
            char.change_stress(1)

            UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)
            UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)
            return CharacterActionResponce.FAILED
        }
        
        
    },

    start:  function(char:Character, data: map_position) {
    },
}

export const fish = {
    duration(char: Character) {
        return 0.5 + char.get_fatigue() / 100 + (100 - char.skills.fishing) / 100;
    },

    check:  function(char:Character, data: map_position): CharacterActionResponce {
        if (!char.in_battle()) {
            let cell = Convert.character_to_cell(char);
            if (cell == undefined) {
                return CharacterActionResponce.INVALID_CELL
            }
            if (cell.can_fish()) {
                return CharacterActionResponce.OK
            } else {
                return CharacterActionResponce.NO_RESOURCE
            }
        } else return CharacterActionResponce.IN_BATTLE
    },

    result:  function(char:Character, data: map_position) {
        let skill = char.skills.fishing
        let dice = Math.random()

        char.change_fatigue(10)

        if (dice * 100 < skill) {
            char.stash.inc(FISH, 1)
            UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)
            return CharacterActionResponce.OK
        } else {
            let dice = Math.random()
            if (dice * 100 > skill) {
                char.skills.fishing += 1
                UserManagement.add_user_to_update_queue(char.user_id, UI_Part.SKILLS)
            }
            char.change_stress(1)

            // UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)
            UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)
            return CharacterActionResponce.FAILED
        }
    },

    start:  function(char:Character, data: map_position) {
    },
}