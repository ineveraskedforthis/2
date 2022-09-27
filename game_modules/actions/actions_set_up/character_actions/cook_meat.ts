import { Character, PerksTable } from "../../../base_game_classes/character/character";
import { CharacterActionResponce } from "../../action_manager";
import { ELODINO_FLESH, FOOD, MEAT, ZAZ } from "../../../manager_classes/materials_manager";
import { PgPool } from "../../../world";


export const cook_meat = {
    duration(char: Character) {
        // return 1 + char.get_fatigue() / 20 + (100 - char.skills.cooking) / 20;
        return 0.5
    },

    check:  function(char:Character, data: any): Promise<CharacterActionResponce> {
        if (!char.in_battle()) {
            let tmp = char.stash.get(MEAT)
            if (tmp > 0)  {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result:  function(char:Character, data: any) {
        let tmp = char.stash.get(MEAT)
        if (tmp > 0) { 
            char.changed = true
            let skill = char.skills.cooking
            let check = cook_meat_probability(skill, char.skills.perks)

            let dice = Math.random()
            char.stash.inc(MEAT, -1)
            char.send_stash_update()
            char.change_fatigue(10)
            if (dice < check) {
                char.stash.inc(FOOD, 1)
                char.world.socket_manager.send_to_character_user(char, 'alert', 'meat prepared')
                char.send_stash_update()
                char.send_status_update()
                return CharacterActionResponce.OK
            } else {
                if (skill < 19) {
                    char.skills.cooking += 1
                    char.send_skills_update()
                }
                char.change_stress(5)
                char.send_status_update()
                char.world.socket_manager.send_to_character_user(char, 'alert', 'failed')
                return CharacterActionResponce.FAILED
            }
        }
    },

    start:  function(char:Character, data: any) {
    },
}



export const cook_elo_to_zaz = {
    duration(char: Character) {
        return Math.max(0.5, 1 + char.get_fatigue() / 20 + (100 - char.skills.cooking - char.skills.magic_mastery) / 20);
    },

    check:  function(char:Character, data: any): Promise<CharacterActionResponce> {
        if (!char.in_battle()) {
            let tmp = char.stash.get(ELODINO_FLESH)
            if (tmp >= 5)  {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result:  function(char:Character, data: any) {
        let tmp = char.stash.get(ELODINO_FLESH)
        if (tmp > 0) { 
            char.changed = true
            let skill1 = char.skills.cooking
            let skill2 = char.skills.magic_mastery
            let check = cook_elodino_flesh_probability(skill1, skill2, char.skills.perks)

            let dice = Math.random()
            char.stash.inc(ELODINO_FLESH, -5)
            char.send_stash_update()
            char.change_fatigue(10)
            if (dice < check) {
                char.stash.inc(ZAZ, 1)
                char.stash.inc(MEAT, 1)
                dice = Math.random() * 100
                if (dice * char.skills.magic_mastery < 5) {
                    char.skills.magic_mastery += 1
                }
                char.world.socket_manager.send_to_character_user(char, 'alert', 'meat prepared')
                char.send_stash_update()
                char.send_status_update()
                return CharacterActionResponce.OK
            } else {
                let dice = Math.random()
                if (skill1 < COOK_ELODINO_DIFFICULTY * dice) {
                    char.skills.cooking += 1
                }                
                char.send_skills_update()
                char.change_stress(5)
                char.send_status_update()
                char.world.socket_manager.send_to_character_user(char, 'alert', 'failed')
                return CharacterActionResponce.FAILED
            }
        }
    },

    start:  function(char:Character, data: any) {
    },
}