import { CharacterActionResponce } from "../../manager_classes/action_manager";
import { RAT_BONE, WOOD } from "../../manager_classes/materials_manager";
import { Weapon } from "../../static_data/item_tags";
import { CharacterGenericPart } from "../character_generic_part";
import { craft_spear_probability } from "./craft_spear";

export const craft_bone_spear = {
    duration(char: CharacterGenericPart) {
        return 1 + char.get_fatigue() / 20 + (100 - char.skills.woodwork.practice) / 20;
    },

    check: async function(pool: any, char:CharacterGenericPart, data: any): Promise<CharacterActionResponce> {
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

    result: async function(pool: any, char:CharacterGenericPart, data: any) {
        let tmp = char.stash.get(WOOD)
        let tmp_2 = char.stash.get(RAT_BONE)
        if ((tmp > 2) && (tmp_2 > 3)) { 
            char.changed = true
            let skill = char.skills.woodwork.practice;

            char.stash.inc(WOOD, -3)
            char.stash.inc(RAT_BONE, -4)
            char.send_stash_update()
            char.change_fatigue(10)
            // if (dice < check) {
            let dice = Math.random()
            if (dice < craft_spear_probability(skill)) {
                let spear = new Weapon(char.world.bone_spear_argument)
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