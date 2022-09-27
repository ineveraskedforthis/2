import { Character } from "../../../base_game_classes/character/character";
import { UI_Part } from "../../../client_communication/causality_graph";
import { UserManagement } from "../../../client_communication/user_manager";
import { WOOD } from "../../../manager_classes/materials_manager";
import { Convert } from "../../../systems_communication";
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
            
            // if (dice < check) {
            let dice = Math.random()
            if (dice < craft_spear_probability(skill)) {
                let spear = new Weapon(SPEAR_ARGUMENT)
                char.equip.add_weapon(spear)
                char.world.socket_manager.send_to_character_user(char, 'alert', 'spear is made')
                char.send_stash_update()
                char.send_equip_update()
                char.send_status_update()
                return CharacterActionResponce.OK
            } else {
                char.change_stress(1)
                if (skill < 20) {
                    char.skills.woodwork += 1
                    char.send_skills_update()
                    char.changed = true
                }
                char.world.socket_manager.send_to_character_user(char, 'alert', 'failed')
                return CharacterActionResponce.FAILED
            }
        }
    },

    start: function(char:Character, data: any) {
    },
}

export function craft_spear_probability(skill: number) {
    if (nodb_mode_check()) return 1;
    return Math.min(skill / 30 + 0.1, 1)
}

export function character_to_craft_spear_probability(character:Character) {
    let skill = character.skills.woodwork
    return craft_spear_probability(skill)
}