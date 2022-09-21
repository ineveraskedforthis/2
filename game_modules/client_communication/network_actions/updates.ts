import { Accuracy } from "../../base_game_classes/battle/battle_calcs";
import { CraftProbability } from "../../base_game_classes/character/craft";
import { SkillList } from "../../base_game_classes/character/skills";
import { Convert } from "../../systems_communication";
import { User, user_id } from "../user";
import { Alerts } from "./alerts";



export namespace SendUpdate {
    export function all(user: User) {
        savings(user)
        status(user)
        stash(user)
        equip(user)
        all_skills(user)
        all_craft(user)
    }

    export function savings(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return
        Alerts.generic_user_alert(user, 'savings', character.savings.get())
        Alerts.generic_user_alert(user, 'savings-trade', character.trade_savings.get()) 
    }
 
    export function status(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.generic_user_alert(user, 'status', {c: character.status, m: character.stats.max})
    }

    export function stash(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.generic_user_alert(user, 'stash-update', character.stash.data)
    }

    export function equip(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.generic_user_alert(user, 'equip-update', character.equip.get_data())
    }

    export function skill_clothier(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return
        
        Alerts.skill(user, 'clothier', character.skills.clothier)
        let value = CraftProbability.from_rat_skin(character)
        Alerts.craft(user, 'craft_rat_pants',  value)
        Alerts.craft(user, 'craft_rat_armour', value)
        Alerts.craft(user, 'craft_rat_gloves', value)
        Alerts.craft(user, 'craft_rat_helmet', value)
        Alerts.craft(user, 'craft_rat_boots',  value)
    }

    export function skill_cooking(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.skill(user, 'cooking', character.skills.cooking)        
    }

    export function skill_woodwork(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.skill(user, 'woodwork', character.skills.woodwork)
    }

    export function all_skills(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        for (let i in character.skills) {
            Alerts.skill(user, i, character.skills[i as keyof SkillList])
        }        
    }

    export function all_craft(user: User) {
        cooking_craft(user)
        woodwork_craft(user)
    }



    export function cooking_craft(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.craft(user, 'cook_elodin', CraftProbability.elo_to_food(character))
        Alerts.craft(user, 'cook_meat', CraftProbability.meat_to_food(character))
    }

    export function woodwork_craft(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        let value = CraftProbability.basic_wood(character)
        Alerts.craft(user, 'craft_spear',       value)
        Alerts.craft(user, 'craft_bone_spear',  value)
        Alerts.craft(user, 'craft_wood_bow',    value)
        Alerts.craft(user, 'craft_bone_arrow', CraftProbability.arrow(character))
    }

    export function ranged(user: User, distance: number) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        if (isNaN(distance)) {
            return 
        }

        Alerts.battle_action(user, 'shoot', Accuracy.ranged(character, distance))
    }

    export function hp(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.generic_user_alert(user, 'hp', {c: character.status.hp, m: character.stats.max.hp})
    }
}


    // send_map_pos_info(character: Character, teleport_flag:boolean) {
    //     let cell_id = character.cell_id;
    //     let pos = this.world.get_cell_x_y_by_id(cell_id);
    //     let data = {x:pos.x,y:pos.y,teleport_flag:teleport_flag}
    //     this.send_to_character_user(character, 'map-pos', data)
    // }

    // send_skills_info(character: Character) {
    //     
       

    //     this.send_to_character_user(character, 'cell-action-chance', {tag: 'hunt', value: character_to_hunt_probability(character)})
    //     this.send_to_character_user(character, 'b-action-chance', {tag: 'flee', value: flee_chance(character)})
    //     this.send_to_character_user(character, 'b-action-chance', {tag: 'attack', value: character.get_attack_chance('usual')})
    //     this.send_perk_related_skills_update(character)
    // }

    //     send_perk_related_skills_update(character: Character) {
    //     this.send_to_character_user(character, 'b-action-chance', {tag: 'fast_attack', value: character.get_attack_chance('fast')})
    //     this.send_to_character_user(character, 'b-action-chance', {tag: 'push_back', value: character.get_attack_chance('heavy')})
    //     this.send_to_character_user(character, 'b-action-chance', {tag: 'magic_bolt', value: 1})

    //     this.send_to_character_user(character, 'action-display', {tag: 'dodge', value: can_dodge(character)})
    //     this.send_to_character_user(character, 'action-display', {tag: 'fast_attack', value: can_fast_attack(character)})
    //     this.send_to_character_user(character, 'action-display', {tag: 'push_back', value: can_push_back(character)})
    //     this.send_to_character_user(character, 'action-display', {tag: 'magic_bolt', value: can_cast_magic_bolt(character)})
    // }