import { Character, } from "../../../character/character";
import { ActionTargeted, CharacterActionResponce } from "../../action_manager";
import { ELODINO_FLESH, FOOD, MEAT, ZAZ } from "../../../manager_classes/materials_manager";
import { map_position } from "../../../types";
import { UserManagement } from "../../../client_communication/user_manager";
import { UI_Part } from "../../../client_communication/causality_graph";
import { Alerts } from "../../../client_communication/network_actions/alerts";
import { craft_bone_spear } from "./craft_bone_spear";
import { craft_bulk } from "../../../craft/craft";
import { Craft } from "../../../calculations/craft";

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
            char.stash.inc(MEAT, -1)
            craft_bulk(char, FOOD, Craft.Amount.Cooking.meat, 'cooking', 1)
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
            if (tmp >= 1)  {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result:  function(char:Character, data: map_position) {
        let tmp = char.stash.get(ELODINO_FLESH)
        if (tmp > 0) { 
            char.stash.inc(ELODINO_FLESH, -1)
            UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)

            craft_bulk(char, FOOD, Craft.Amount.Cooking.elodino, 'cooking', 3)
            craft_bulk(char, ZAZ, Craft.Amount.elodino_zaz_extraction, 'cooking', 3)
        }
    },

    start:  function(char:Character, data: map_position) {
    },
}