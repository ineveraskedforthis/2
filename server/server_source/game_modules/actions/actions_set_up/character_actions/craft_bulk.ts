import { Character, } from "../../../character/character";
import { ActionTargeted, CharacterActionResponce } from "../../action_manager";
import { COTTON, ELODINO_FLESH, FISH, FOOD, MEAT, TEXTILE, ZAZ } from "../../../manager_classes/materials_manager";
import { map_position } from "../../../types";
import { UserManagement } from "../../../client_communication/user_manager";
import { UI_Part } from "../../../client_communication/causality_graph";
import { Alerts } from "../../../client_communication/network_actions/alerts";
import { craft_bone_spear } from "./craft_weapon";
import { craft_bulk } from "../../../craft/craft";
import { Craft } from "../../../calculations/craft";
import { generate_bulk_craft } from "./generate_craft_item_action";

export const COOKING_TIER = 10
export const ELODINO_TIER = 30

export const cook_meat = generate_bulk_craft(
    [{material: MEAT, amount: 1}], FOOD, Craft.Amount.Cooking.meat, 'cooking', COOKING_TIER)

export const cook_fish = generate_bulk_craft(
    [{material: FISH, amount: 1}], FOOD, Craft.Amount.Cooking.meat, 'cooking', COOKING_TIER)

export const process_cotton = generate_bulk_craft(
    [{material: COTTON, amount: 1}], TEXTILE, Craft.Amount.textile, 'clothier', 5)

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

            craft_bulk(char, FOOD, Craft.Amount.Cooking.elodino, 'cooking', 30)
            craft_bulk(char, ZAZ, Craft.Amount.elodino_zaz_extraction, 'cooking', 30)
        }
    },

    start:  function(char:Character, data: map_position) {
    },
}