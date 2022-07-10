import { CharacterGenericPart, PerksTable } from "../character_generic_part";
import { CharacterActionResponce } from "../../manager_classes/action_manager";
import { Armour, Weapon } from "../../static_data/item_tags";
import { nodb_mode_check } from "../../market/market_items";


export const craft_rat_pants = {
    duration(char: CharacterGenericPart) {
        return 1 + char.get_fatigue() / 20 + (100 - char.skills.clothier.practice) / 20;
    },

    check: async function(pool: any, char:CharacterGenericPart, data: any): Promise<CharacterActionResponce> {
        if (!char.in_battle()) {
            let tmp = char.stash.get(char.world.materials.RAT_SKIN)
            if (tmp >= 4)  {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result: async function(pool: any, char:CharacterGenericPart, data: any) {
        let tmp = char.stash.get(char.world.materials.RAT_SKIN)
        if (tmp >= 4) { 
            char.changed = true
            let skill = char.skills.clothier.practice;

            char.stash.inc(char.world.materials.RAT_SKIN, -4)
            char.send_stash_update()
            char.change_fatigue(10)
            // if (dice < check) {
            let dice = Math.random()
            if (dice < craft_rat_pants_probability(skill)) {
                let armour = new Armour(char.world.rat_skin_pants_argument)
                char.equip.add_armour(armour)
                char.world.socket_manager.send_to_character_user(char, 'alert', 'pants are made')
                char.send_stash_update()
                char.send_equip_update()
                char.send_status_update()
                return CharacterActionResponce.OK
            } else {
                char.change_stress(1)
                if (skill < 20) {
                    char.skills.clothier.practice += 1
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

export function craft_rat_pants_probability(skill: number) {
    if (nodb_mode_check()) return 1;
    return Math.min(skill / 30, 1)
}

export function character_to_craft_rat_pants_probability(character:CharacterGenericPart) {
    let skill = character.skills.clothier.practice
    return craft_rat_pants_probability(skill)
}