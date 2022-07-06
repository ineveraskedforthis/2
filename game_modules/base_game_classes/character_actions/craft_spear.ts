import { CharacterGenericPart, PerksTable } from "../character_generic_part";
import { CharacterActionResponce } from "../../manager_classes/action_manager";
import { Weapon } from "../../static_data/item_tags";
import { textChangeRangeIsUnchanged } from "typescript";


export const craft_spear = {
    duration(char: CharacterGenericPart) {
        return 1 + char.get_fatigue() / 20 + (100 - char.skills.woodwork.practice) / 20;
    },

    check: async function(pool: any, char:CharacterGenericPart, data: any): Promise<CharacterActionResponce> {
        if (!char.in_battle()) {
            let tmp = char.stash.get(char.world.materials.WOOD)
            if (tmp > 2)  {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result: async function(pool: any, char:CharacterGenericPart, data: any) {
        let tmp = char.stash.get(char.world.materials.WOOD)
        if (tmp > 2) { 
            char.changed = true
            let skill = char.skills.woodwork.practice;

            char.stash.inc(char.world.materials.WOOD, -3)
            char.send_stash_update()
            char.change_fatigue(10)
            // if (dice < check) {
            let dice = Math.random()
            if (dice < craft_spear_probability(skill)) {
                let spear = new Weapon(char.world.spear_argument)
                char.equip.add_weapon(spear)
                char.world.socket_manager.send_to_character_user(char, 'alert', 'spear is made')
                char.send_stash_update()
                char.send_equip_update()
                char.send_status_update()
                return CharacterActionResponce.OK
            } else {
                char.change_stress(1)
                if (skill < 20) {
                    char.skills.woodwork.practice += 1
                    char.send_skills_update()
                    char.changed = true
                }
                char.world.socket_manager.send_to_character_user(char, 'alert', 'failed')
                return CharacterActionResponce.FAILED
            }
        }
    },

    start: async function(pool: any, char:CharacterGenericPart, data: any) {
    },
}

export function craft_spear_probability(skill: number) {
    return Math.min(skill / 30, 1)
}

export function character_to_craft_spear_probability(character:CharacterGenericPart) {
    let skill = character.skills.woodwork.practice
    return craft_spear_probability(skill)
}