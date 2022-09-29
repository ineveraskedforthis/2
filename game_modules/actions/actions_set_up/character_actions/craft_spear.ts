import { Character } from "../../../base_game_classes/character/character";
import { Item } from "../../../base_game_classes/items/item";
import { SPEAR_ARGUMENT } from "../../../base_game_classes/items/items_set_up";
import { ItemSystem } from "../../../base_game_classes/items/system";
import { BONUS_SPEAR, Difficulty, DIFFICULTY_SPEAR } from "../../../calculations/difficulty";
import { UI_Part } from "../../../client_communication/causality_graph";
import { UserManagement } from "../../../client_communication/user_manager";
import { WOOD } from "../../../manager_classes/materials_manager";
import { map_position } from "../../../types";
import { ActionTargeted, CharacterActionResponce } from "../../action_manager";


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
        if (tmp > 2) { 
            let skill = char.skills.woodwork;

            char.stash.inc(WOOD, -3)
            char.change('fatigue', 10)

            UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STASH)
            UserManagement.add_user_to_update_queue(char.user_id, UI_Part.STATUS)
            
            let dice = Math.random()
            if (dice < craft_spear_probability(skill)) {
                let spear = ItemSystem.create(SPEAR_ARGUMENT)
                char.equip.data.backpack.add(spear)

                UserManagement.add_user_to_update_queue(char.user_id, UI_Part.INVENTORY)

                if (Difficulty.success_to_skill_up(skill, DIFFICULTY_SPEAR, 0)) {
                    char.skills.woodwork += 1
                    UserManagement.add_user_to_update_queue(char.user_id, UI_Part.SKILLS)
                }

                return CharacterActionResponce.OK
            } else {

                char.change('stress', 1)
                if (Difficulty.failure_to_skill_up(skill, DIFFICULTY_SPEAR, 0)) {
                    char.skills.woodwork += 1
                    UserManagement.add_user_to_update_queue(char.user_id, UI_Part.SKILLS)
                }
                
                return CharacterActionResponce.FAILED
            }
        }
    },

    start: function(char:Character, data: map_position) {
    },
}

export function craft_spear_probability(skill: number) {
    return Difficulty.success_ratio(skill, DIFFICULTY_SPEAR, BONUS_SPEAR)
}

export function character_to_craft_spear_probability(character:Character) {
    let skill = character.skills.woodwork
    return craft_spear_probability(skill)
}