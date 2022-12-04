import { Character } from "../../../character/character";
import { Item } from "../../../items/item";
import { SPEAR_ARGUMENT } from "../../../items/items_set_up";
import { ItemSystem } from "../../../items/system";
import { UI_Part } from "../../../client_communication/causality_graph";
import { UserManagement } from "../../../client_communication/user_manager";
import { WOOD } from "../../../manager_classes/materials_manager";
import { map_position } from "../../../types";
import { ActionTargeted, CharacterActionResponce } from "../../action_manager";
import { Craft } from "../../../calculations/craft";
import { Event } from "../../../events/events";
import { craft_item } from "../../../craft/craft";


export const craft_spear:ActionTargeted = {
    duration(char: Character) {
        return 0.5
    },

    check: function(char:Character, data: map_position): CharacterActionResponce {
        if (!char.in_battle()) {
            let tmp = char.stash.get(WOOD)
            if (tmp > 2)  {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result: function(char:Character, data: map_position) {
        let tmp = char.stash.get(WOOD)
        if (tmp >= 3) { 
            char.stash.inc(WOOD, -3)
            UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)
            craft_item(char, SPEAR_ARGUMENT, Craft.Durability.wood_item, 'woodwork', 1)
        }
    },

    start: function(char:Character, data: map_position) {
    },
}