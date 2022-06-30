import { CharacterGenericPart } from "../character_generic_part";
import { CharacterActionResponce } from "../../manager_classes/action_manager";


export const cook_meat = {
    duration(char: CharacterGenericPart) {
        return 1 + char.get_fatigue() / 20 + (100 - char.skills.cooking.practice) / 20;
    },

    check: async function(pool: any, char:CharacterGenericPart, data: any): Promise<CharacterActionResponce> {
        if (!char.in_battle()) {
            let tmp = char.stash.get(char.world.materials.MEAT)
            if (tmp > 0)  {
                return CharacterActionResponce.OK
            }
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result: async function(pool: any, char:CharacterGenericPart, data: any) {
        let tmp = char.stash.get(char.world.materials.MEAT)
        if (tmp > 0) { 
            char.changed = true
            let skill = char.skills.cooking.practice
            let check = 0;
            if (char.skills.perks.meat_master) {
                check = 1
            } else if (skill > 20) {
                check = 0.7
            } else {
                check = 0.7 * skill / 20
            }
            let dice = Math.random()
            char.stash.inc(char.world.materials.MEAT, -1)
            char.send_stash_update()
            char.change_fatigue(10)
            if (dice < check) {
                char.stash.inc(char.world.materials.FOOD, 1)
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

    start: async function(pool: any, char:CharacterGenericPart, data: any) {
    },
}