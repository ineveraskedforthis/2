import { CharacterActionResponce } from "../../action_manager";
import { ARROW_BONE, RAT_BONE, WOOD } from "../../../manager_classes/materials_manager";
import { BASIC_BOW_ARGUMENT, BONE_SPEAR_ARGUMENT } from "../../../base_game_classes/items/items_set_up";
import { Character } from "../../../base_game_classes/character/character";
import { craft_spear_probability } from "./craft_spear";
import { map_position } from "../../../types";
import { UserManagement } from "../../../client_communication/user_manager";
import { UI_Part } from "../../../client_communication/causality_graph";
import { CraftProbability } from "../../../base_game_classes/character/craft";
import { ItemSystem } from "../../../base_game_classes/items/system";
import { Alerts } from "../../../client_communication/network_actions/alerts";

export const craft_bone_spear = {
    duration(char: Character) {
        return 0.5;
    },

    check:  function(char:Character, data: map_position): CharacterActionResponce {
        if (!char.in_battle()) {
            let tmp = char.stash.get(WOOD)
            let tmp_2 = char.stash.get(RAT_BONE)
            if ((tmp > 2) && (tmp_2 > 3))  {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result:  function(char:Character, data: map_position) {
        let tmp = char.stash.get(WOOD)
        let tmp_2 = char.stash.get(RAT_BONE)
        if ((tmp > 2) && (tmp_2 > 3)) { 

            let skill = char.skills.woodwork;

            char.stash.inc(WOOD, -3)
            char.stash.inc(RAT_BONE, -4)
            char.change_fatigue(10)

            UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)
            UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)

            let dice = Math.random()
            if (dice < CraftProbability.basic_wood(char)) {
                let spear = ItemSystem.create(BONE_SPEAR_ARGUMENT)
                char.equip.data.backpack.add(spear)
                UserManagement.add_user_to_update_queue(char.user_id, UI_Part.INVENTORY)
                return CharacterActionResponce.OK
            } else {
                char.change_stress(1)
                if (skill < 20) {
                    char.skills.woodwork += 1
                    UserManagement.add_user_to_update_queue(char.user_id, UI_Part.SKILLS)
                }
                Alerts.failed(char)
                return CharacterActionResponce.FAILED
            }
        }
    },

    start:  function(char:Character, data: map_position) {
    },
}

export const craft_bone_arrow = {
    duration(char: Character) {
        return 0.5;
    },

    check:  function(char:Character, data: map_position): CharacterActionResponce {
        if (!char.in_battle()) {
            let tmp = char.stash.get(WOOD)
            let tmp_2 = char.stash.get(RAT_BONE)
            if ((tmp >= 1) && (tmp_2 >= 10))  {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result:  function(char:Character, data: map_position) {
        let tmp = char.stash.get(WOOD)
        let tmp_2 = char.stash.get(RAT_BONE)
        if ((tmp >= 1) && (tmp_2 >= 10)) { 
            let skill = char.skills.woodwork;

            char.stash.inc(WOOD, -1)
            char.stash.inc(RAT_BONE, -10)
            char.change_fatigue(10)

            let dice = Math.random()
            let amount = Math.round((CraftProbability.arrow(char) / dice) * 10)
            char.stash.inc(ARROW_BONE, amount)
            UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)
            UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)

            if (skill < 10) {
                char.skills.woodwork += 1
            }
        }
    },

    start:  function(char:Character, data: map_position) {
    },
}

export const craft_wood_bow = {
    duration(char: Character) {
        return 0.5;
    },

    check:  function(char:Character, data: map_position): CharacterActionResponce {
        if (!char.in_battle()) {
            let tmp = char.stash.get(WOOD)
            if ((tmp >= 3)) {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result:  function(char:Character, data: map_position) {
        let tmp = char.stash.get(WOOD)
        if ((tmp >= 3)) { 
            let skill = char.skills.woodwork;

            char.stash.inc(WOOD, -3)
            char.change_fatigue(10)

            let dice = Math.random()
            if (dice < craft_spear_probability(skill)) {
                let bow = ItemSystem.create(BASIC_BOW_ARGUMENT)
                char.equip.data.backpack.add(bow)

                UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)
                UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)
                UserManagement.add_user_to_update_queue(char.user_id, UI_Part.INVENTORY)

                return CharacterActionResponce.OK
            } else {
                char.change_stress(1)
                if (skill < 20) {
                    char.skills.woodwork += 1
                    UserManagement.add_user_to_update_queue(char.user_id, UI_Part.SKILLS)
                }
                Alerts.failed(char)
                return CharacterActionResponce.FAILED
            }
        }
    },

    start:  function(char:Character, data: map_position) {
    },
}