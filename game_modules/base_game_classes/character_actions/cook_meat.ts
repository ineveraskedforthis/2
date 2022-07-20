import { CharacterGenericPart, PerksTable } from "../character_generic_part";
import { CharacterActionResponce } from "../../manager_classes/action_manager";
import { ELODINO_FLESH, FOOD, MEAT, ZAZ } from "../../manager_classes/materials_manager";
import { PgPool } from "../../world";


export const cook_meat = {
    duration(char: CharacterGenericPart) {
        // return 1 + char.get_fatigue() / 20 + (100 - char.skills.cooking.practice) / 20;
        return 0.5
    },

    check: async function(pool: PgPool, char:CharacterGenericPart, data: any): Promise<CharacterActionResponce> {
        if (!char.in_battle()) {
            let tmp = char.stash.get(MEAT)
            if (tmp > 0)  {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result: async function(pool: PgPool, char:CharacterGenericPart, data: any) {
        let tmp = char.stash.get(MEAT)
        if (tmp > 0) { 
            char.changed = true
            let skill = char.skills.cooking.practice
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
                    char.skills.cooking.practice += 1
                    char.send_skills_update()
                }
                char.change_stress(5)
                char.send_status_update()
                char.world.socket_manager.send_to_character_user(char, 'alert', 'failed')
                return CharacterActionResponce.FAILED
            }
        }
    },

    start: async function(pool: PgPool, char:CharacterGenericPart, data: any) {
    },
}

export function cook_meat_probability(skill: number, perks:PerksTable){
    let check = 0;
    if (perks.meat_master) {
        check = 1
    } else if (skill > 20) {
        check = 0.7
    } else {
        check = 0.7 * skill / 20
    }
    return check
}

const COOK_ELODINO_DIFFICULTY = 50

export function cook_elodino_flesh_probability(cooking_skill: number, magic_skill: number, perks:PerksTable){
    let check = 0;
    if (perks.meat_master) {
        check += 0.2
    }
    let worst_skill = Math.min(cooking_skill, magic_skill)
    check = check + worst_skill / COOK_ELODINO_DIFFICULTY
    return check
}

export function character_to_cook_elodino_probability(character: CharacterGenericPart) {
    let skill1 = character.skills.cooking.practice
    let skill2 = character.skills.magic_mastery.practice
    let perks = character.skills.perks
    return cook_elodino_flesh_probability(skill1, skill2, perks)
}

export function character_to_cook_meat_probability(character:CharacterGenericPart) {
    let skill = character.skills.cooking.practice
    let perks = character.skills.perks
    return cook_meat_probability(skill, perks)
}



export const cook_elo_to_zaz = {
    duration(char: CharacterGenericPart) {
        return Math.max(0.5, 1 + char.get_fatigue() / 20 + (100 - char.skills.cooking.practice - char.skills.magic_mastery.practice) / 20);
    },

    check: async function(pool: PgPool, char:CharacterGenericPart, data: any): Promise<CharacterActionResponce> {
        if (!char.in_battle()) {
            let tmp = char.stash.get(ELODINO_FLESH)
            if (tmp >= 5)  {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result: async function(pool: PgPool, char:CharacterGenericPart, data: any) {
        let tmp = char.stash.get(ELODINO_FLESH)
        if (tmp > 0) { 
            char.changed = true
            let skill1 = char.skills.cooking.practice
            let skill2 = char.skills.magic_mastery.practice
            let check = cook_elodino_flesh_probability(skill1, skill2, char.skills.perks)

            let dice = Math.random()
            char.stash.inc(ELODINO_FLESH, -5)
            char.send_stash_update()
            char.change_fatigue(10)
            if (dice < check) {
                char.stash.inc(ZAZ, 1)
                char.stash.inc(MEAT, 1)
                dice = Math.random() * 100
                if (dice * char.skills.magic_mastery.practice < 5) {
                    char.skills.magic_mastery.practice += 1
                }
                char.world.socket_manager.send_to_character_user(char, 'alert', 'meat prepared')
                char.send_stash_update()
                char.send_status_update()
                return CharacterActionResponce.OK
            } else {
                let dice = Math.random()
                if (skill1 < COOK_ELODINO_DIFFICULTY * dice) {
                    char.skills.cooking.practice += 1
                }                
                char.send_skills_update()
                char.change_stress(5)
                char.send_status_update()
                char.world.socket_manager.send_to_character_user(char, 'alert', 'failed')
                return CharacterActionResponce.FAILED
            }
        }
    },

    start: async function(pool: PgPool, char:CharacterGenericPart, data: any) {
    },
}