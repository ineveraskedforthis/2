import { Character, } from "../../../base_game_classes/character/character";
import { ActionTargeted, CharacterActionResponce } from "../../action_manager";
import { ELODINO_FLESH, FOOD, MEAT, ZAZ } from "../../../manager_classes/materials_manager";
import { map_position } from "../../../types";
import { COOK_ELODINO_DIFFICULTY, CraftProbability } from "../../../calculations/craft";
import { UserManagement } from "../../../client_communication/user_manager";
import { UI_Part } from "../../../client_communication/causality_graph";
import { Alerts } from "../../../client_communication/network_actions/alerts";


export const cook_meat:ActionTargeted = {
    duration(char: Character) {
        // return 1 + char.get_fatigue() / 20 + (100 - char.skills.cooking) / 20;
        return 0.5
    },

    check: function(char:Character, data: map_position): CharacterActionResponce {
        if (!char.in_battle()) {
            let tmp = char.stash.get(MEAT)
            if (tmp > 0)  {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result:  function(char:Character, data: map_position) {
        let tmp = char.stash.get(MEAT)
        if (tmp > 0) { 
            let skill = char.skills.cooking
            let check = CraftProbability.meat_to_food(char)

            let dice = Math.random()
            char.stash.inc(MEAT, -1)
            char.change_fatigue(10)

            
            UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)

            if (dice < check) {
                char.stash.inc(FOOD, 1)

                UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)
                UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)
                return CharacterActionResponce.OK
            } else {
                if (skill < 19) {
                    char.skills.cooking += 1
                    UserManagement.add_user_to_update_queue(char.user_id, UI_Part.COOKING_SKILL)
                }
                char.change_stress(5)
                UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)

                Alerts.failed(char)
                return CharacterActionResponce.FAILED
            }
        }
    },

    start:  function(char:Character, data: map_position) {
    },
}



export const cook_elo_to_zaz:ActionTargeted = {
    duration(char: Character) {
        return Math.max(0.5, 1 + char.get_fatigue() / 20 + (100 - char.skills.cooking - char.skills.magic_mastery) / 20);
    },

    check:  function(char:Character, data: map_position): CharacterActionResponce {
        if (!char.in_battle()) {
            let tmp = char.stash.get(ELODINO_FLESH)
            if (tmp >= 5)  {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result:  function(char:Character, data: map_position) {
        let tmp = char.stash.get(ELODINO_FLESH)
        if (tmp > 0) { 

            let skill1 = char.skills.cooking
            let skill2 = char.skills.magic_mastery
            let check = CraftProbability.elo_to_food(char)

            let dice = Math.random()
            char.stash.inc(ELODINO_FLESH, -5)

            UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)
            UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)

            if (dice < check) {
                char.stash.inc(ZAZ, 1)
                char.stash.inc(MEAT, 1)
                dice = Math.random() * 100
                if (dice * char.skills.magic_mastery < 5) {
                    char.skills.magic_mastery += 1
                }
                UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)
                UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)
                return CharacterActionResponce.OK
            } else {
                let dice = Math.random()
                if (skill1 < COOK_ELODINO_DIFFICULTY * dice) {
                    char.skills.cooking += 1
                }
                char.change_stress(5)

                UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)
                UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)
                Alerts.failed(char)
                return CharacterActionResponce.FAILED
            }
        }
    },

    start:  function(char:Character, data: map_position) {
    },
}