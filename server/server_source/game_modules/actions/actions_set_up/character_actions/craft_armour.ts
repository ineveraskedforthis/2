import { Character } from "../../../character/character";
import { CharacterActionResponce } from "../../action_manager";
import { ELODINO_FLESH, GRACI_HAIR, RAT_SKIN } from "../../../manager_classes/materials_manager";
import { ELODINO_DRESS_ARGUMENT, GRACI_HAIR_ARGUMENT, RAT_SKIN_ARMOUR_ARGUMENT, RAT_SKIN_BOOTS_ARGUMENT, RAT_SKIN_GLOVES_ARGUMENT, RAT_SKIN_HELMET_ARGUMENT, RAT_SKIN_PANTS_ARGUMENT } from "../../../items/items_set_up";

import { map_position } from "../../../types";
import { ItemSystem } from "../../../items/system";
import { ItemJson } from "../../../items/item";
import { UserManagement } from "../../../client_communication/user_manager";
import { UI_Part } from "../../../client_communication/causality_graph";
import { Alerts } from "../../../client_communication/network_actions/alerts";
import { craft_item } from "../../../craft/craft";
import { Craft } from "../../../calculations/craft";
import { generate_craft_item_action } from "./generate_craft_item_action";

export const RAT_ARMOUR_TIER = 25

function generate_rat_skin_craft(arg: ItemJson, cost: number,) {
    return {
        duration(char: Character) {
            return 0.5
            return 1 + char.get_fatigue() / 20 + (100 - char.skills.clothier) / 20;            
        },
    
        check:  function(char:Character, data: map_position): CharacterActionResponce {
            if (!char.in_battle()) {
                let tmp = char.stash.get(RAT_SKIN)
                if (tmp >= cost)  {
                    return CharacterActionResponce.OK
                }
                return CharacterActionResponce.NO_RESOURCE
            } 
            return CharacterActionResponce.IN_BATTLE
        },
    
        result:  function(char:Character, data: map_position) {
            let tmp = char.stash.get(RAT_SKIN)
            if (tmp >= cost) {    
                char.stash.inc(RAT_SKIN, -cost)
                UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)
                craft_item(char, arg, Craft.Durability.skin_item, 'clothier', RAT_ARMOUR_TIER)
            }
        },
    
        start:  function(char:Character, data: map_position) {
        },
    }
}

export const RAT_SKIN_ARMOUR_SKIN_NEEDED = 10
export const RAT_SKIN_PANTS_SKIN_NEEDED = 8
export const RAT_SKIN_BOOTS_SKIN_NEEDED = 5

export const craft_rat_armour = generate_rat_skin_craft(RAT_SKIN_ARMOUR_ARGUMENT, RAT_SKIN_ARMOUR_SKIN_NEEDED)
export const craft_rat_gloves = generate_rat_skin_craft(RAT_SKIN_GLOVES_ARGUMENT, 5)
export const craft_rat_pants = generate_rat_skin_craft(RAT_SKIN_PANTS_ARGUMENT, RAT_SKIN_PANTS_SKIN_NEEDED)
export const craft_rat_helmet = generate_rat_skin_craft(RAT_SKIN_HELMET_ARGUMENT, 5)
export const craft_rat_boots = generate_rat_skin_craft(RAT_SKIN_BOOTS_ARGUMENT, RAT_SKIN_BOOTS_SKIN_NEEDED)

export const craft_elo_dress = generate_craft_item_action(
    [{amount: 4, material: ELODINO_FLESH}], ELODINO_DRESS_ARGUMENT, 
    Craft.Durability.skin_item, 50, 'clothier')

export const craft_graci_hair = generate_craft_item_action(
    [{amount: 2, material: GRACI_HAIR}], GRACI_HAIR_ARGUMENT, 
    Craft.Durability.skin_item, 50, 'clothier')