import { Character, PerksTable } from "../../../base_game_classes/character/character";
import { CharacterActionResponce } from "../../action_manager";
import { Armour, ArmourConstructorArgument, Weapon } from "../../static_data/item_tags";
import { nodb_mode_check } from "../../market/market_items";
import { RAT_SKIN } from "../../../manager_classes/materials_manager";
import { RAT_SKIN_ARMOUR_ARGUMENT, RAT_SKIN_BOOTS_ARGUMENT, RAT_SKIN_GLOVES_ARGUMENT, RAT_SKIN_HELMET_ARGUMENT, RAT_SKIN_PANTS_ARGUMENT } from "../../../base_game_classes/items/items_set_up";
import { PgPool } from "../../../world";


function generate_rat_skin_craft(arg: ArmourConstructorArgument, cost: number) {
    return {
        duration(char: Character) {
            return 0.5
            return 1 + char.get_fatigue() / 20 + (100 - char.skills.clothier.practice) / 20;            
        },
    
        check:  function(char:Character, data: any): Promise<CharacterActionResponce> {
            if (!char.in_battle()) {
                let tmp = char.stash.get(RAT_SKIN)
                if (tmp >= cost)  {
                    return CharacterActionResponce.OK
                }
                return CharacterActionResponce.NO_RESOURCE
            } 
            return CharacterActionResponce.IN_BATTLE
        },
    
        result:  function(char:Character, data: any) {
            let tmp = char.stash.get(RAT_SKIN)
            if (tmp >= cost) {
                char.changed = true
                let skill = char.skills.clothier.practice;
    
                char.stash.inc(RAT_SKIN, -cost)
                char.send_stash_update()
                char.change_fatigue(10)
                // if (dice < check) {
                let dice = Math.random()
                if (dice < craft_rat_armour_probability(skill, char.skills.perks.skin_armour_master == true)) {
                    let armour = new Armour(arg)
                    char.equip.add_armour(armour)
                    char.world.socket_manager.send_to_character_user(char, 'alert', 'finished')
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
    
        start:  function(char:Character, data: any) {
        },
    }
}

export const RAT_SKIN_ARMOUR_SKIN_NEEDED = 10

export const craft_rat_armour = generate_rat_skin_craft(RAT_SKIN_ARMOUR_ARGUMENT, RAT_SKIN_ARMOUR_SKIN_NEEDED)
export const craft_rat_gloves = generate_rat_skin_craft(RAT_SKIN_GLOVES_ARGUMENT, 5)
export const craft_rat_pants = generate_rat_skin_craft(RAT_SKIN_PANTS_ARGUMENT, 8)
export const craft_rat_helmet = generate_rat_skin_craft(RAT_SKIN_HELMET_ARGUMENT, 5)
export const craft_rat_boots = generate_rat_skin_craft(RAT_SKIN_BOOTS_ARGUMENT, 5)