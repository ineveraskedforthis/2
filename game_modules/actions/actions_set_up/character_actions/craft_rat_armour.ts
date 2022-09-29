import { Character } from "../../../base_game_classes/character/character";
import { CharacterActionResponce } from "../../action_manager";
import { RAT_SKIN } from "../../../manager_classes/materials_manager";
import { RAT_SKIN_ARMOUR_ARGUMENT, RAT_SKIN_BOOTS_ARGUMENT, RAT_SKIN_GLOVES_ARGUMENT, RAT_SKIN_HELMET_ARGUMENT, RAT_SKIN_PANTS_ARGUMENT } from "../../../base_game_classes/items/items_set_up";

import { map_position } from "../../../types";
import { ItemSystem } from "../../../base_game_classes/items/system";
import { ItemJson } from "../../../base_game_classes/items/item";
import { CraftProbability } from "../../../base_game_classes/character/craft";
import { UserManagement } from "../../../client_communication/user_manager";
import { UI_Part } from "../../../client_communication/causality_graph";
import { Alerts } from "../../../client_communication/network_actions/alerts";



function generate_rat_skin_craft(arg: ItemJson, cost: number) {
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
                let skill = char.skills.clothier;
    
                char.stash.inc(RAT_SKIN, -cost)
                char.change_fatigue(10)
                UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)
                UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)

                let dice = Math.random()
                if (dice < CraftProbability.from_rat_skin(char)) {
                    let armour = ItemSystem.create(arg)
                    char.equip.data.backpack.add(armour)
                    UserManagement.add_user_to_update_queue(char.user_id, UI_Part.INVENTORY)
                    return CharacterActionResponce.OK
                } else {
                    char.change_stress(1)
                    if (skill < 20) {
                        char.skills.clothier += 1
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
}

export const RAT_SKIN_ARMOUR_SKIN_NEEDED = 10

export const craft_rat_armour = generate_rat_skin_craft(RAT_SKIN_ARMOUR_ARGUMENT, RAT_SKIN_ARMOUR_SKIN_NEEDED)
export const craft_rat_gloves = generate_rat_skin_craft(RAT_SKIN_GLOVES_ARGUMENT, 5)
export const craft_rat_pants = generate_rat_skin_craft(RAT_SKIN_PANTS_ARGUMENT, 8)
export const craft_rat_helmet = generate_rat_skin_craft(RAT_SKIN_HELMET_ARGUMENT, 5)
export const craft_rat_boots = generate_rat_skin_craft(RAT_SKIN_BOOTS_ARGUMENT, 5)