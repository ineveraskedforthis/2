import { CharacterActionResponce } from "../../action_manager";
import { ARROW_BONE, RAT_BONE, WOOD } from "../../../manager_classes/materials_manager";
import { BASIC_BOW_ARGUMENT, BONE_SPEAR_ARGUMENT } from "../../../base_game_classes/items/items_set_up";
import { Weapon } from "../../static_data/item_tags";
import { PgPool } from "../../../world";
import { Character } from "../../../base_game_classes/character/character";
import { craft_spear_probability } from "./craft_spear";

export const craft_bone_spear = {
    duration(char: Character) {
        return 0.5;
    },

    check:  function(char:Character, data: any): Promise<CharacterActionResponce> {
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

    result:  function(char:Character, data: any) {
        let tmp = char.stash.get(WOOD)
        let tmp_2 = char.stash.get(RAT_BONE)
        if ((tmp > 2) && (tmp_2 > 3)) { 
            char.changed = true
            let skill = char.skills.woodwork;

            char.stash.inc(WOOD, -3)
            char.stash.inc(RAT_BONE, -4)
            char.send_stash_update()
            char.change_fatigue(10)
            // if (dice < check) {
            let dice = Math.random()
            if (dice < craft_spear_probability(skill)) {
                let spear = new Weapon(BONE_SPEAR_ARGUMENT)
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

    start:  function(char:Character, data: any) {
    },
}

let BONE_ARROW_DIFFICULTY = 20

export function craft_bone_arrow_probability(character: Character) {
    if (character.skills.perks.fletcher) {
        return 1
    }
    return 0.7 * Math.min(1, character.skills.woodwork/BONE_ARROW_DIFFICULTY)
}

export const craft_bone_arrow = {
    duration(char: Character) {
        return 0.5;
    },

    check:  function(char:Character, data: any): Promise<CharacterActionResponce> {
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

    result:  function(char:Character, data: any) {
        let tmp = char.stash.get(WOOD)
        let tmp_2 = char.stash.get(RAT_BONE)
        if ((tmp >= 1) && (tmp_2 >= 10)) { 
            char.changed = true
            let skill = char.skills.woodwork;

            char.stash.inc(WOOD, -1)
            char.stash.inc(RAT_BONE, -10)
            char.send_stash_update()
            char.change_fatigue(10)
            // if (dice < check) {
            let dice = Math.random()
            let amount = Math.round((craft_bone_arrow_probability(char) / dice) * 10)
            char.stash.inc(ARROW_BONE, amount)
            char.send_stash_update()
            char.send_status_update()
            if (skill < 10) {
                char.skills.woodwork += 1
            }
        }
    },

    start:  function(char:Character, data: any) {
    },
}

export const craft_wood_bow = {
    duration(char: Character) {
        return 0.5;
    },

    check:  function(char:Character, data: any): Promise<CharacterActionResponce> {
        if (!char.in_battle()) {
            let tmp = char.stash.get(WOOD)
            // let tmp_2 = char.stash.get(RAT_BONE)
            if ((tmp >= 3)) {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result:  function(char:Character, data: any) {
        let tmp = char.stash.get(WOOD)
        // let tmp_2 = char.stash.get(RAT_BONE)
        if ((tmp >= 3)) { 
            char.changed = true
            let skill = char.skills.woodwork;

            char.stash.inc(WOOD, -3)
            char.send_stash_update()
            char.change_fatigue(10)
            // if (dice < check) {
            let dice = Math.random()
            if (dice < craft_spear_probability(skill)) {
                let bow = new Weapon(BASIC_BOW_ARGUMENT)
                char.equip.add_weapon(bow)
                char.world.socket_manager.send_to_character_user(char, 'alert', 'bow is finished')
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

    start:  function(char:Character, data: any) {
    },
}