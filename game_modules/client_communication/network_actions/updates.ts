import { Accuracy } from "../../base_game_classes/battle/battle_calcs";
import { CraftProbability } from "../../calculations/craft";
import { SkillList } from "../../base_game_classes/character/skills";
import { CharacterSystem } from "../../base_game_classes/character/system";
import { Cell } from "../../map/cell";
import { MapSystem } from "../../map/system";
import { Development } from "../../static_data/map_definitions";
import { Convert } from "../../systems_communication";
import { cell_id, weapon_attack_tags, weapon_tag } from "../../types";
import { User } from "../user";
import { Alerts } from "./alerts";
import { CellActionProb } from "../../calculations/difficulty";



export namespace SendUpdate {
    export function all(user: User) {
        status(user)
        belongings(user)
        all_skills(user)
        all_craft(user)
        map_related(user)
    }

    export function savings(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return
        Alerts.generic_user_alert(user, 'savings', character.savings.get())
        Alerts.generic_user_alert(user, 'savings-trade', character.trade_savings.get()) 
    }
 
    export function status(user: User) {
        console.log('update status')
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

    export function skill_skinning(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.skill(user, 'woodwork', character.skills.woodwork)
    }

    export function skill_weapon(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        for (const tag of weapon_attack_tags) {
            Alerts.skill(user, tag, character.skills[tag])
        }
    }

    export function skill_defence(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.skill(user, 'evasion', character.skills.evasion)
        Alerts.skill(user, 'blocking', character.skills.blocking)
    }

    export function all_skills(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        for (let i in character.skills) {
            Alerts.skill(user, i, character.skills[i as keyof SkillList])
        }
        cell_probability(user)
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

        Alerts.battle_action_chance(user, 'shoot', Accuracy.ranged(character, distance))
    }

    export function hp(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.generic_user_alert(user, 'hp', {c: character.status.hp, m: character.stats.max.hp})
    }

    export function market(user: User) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return

        // let data = 

    //     let user = this.world.user_manager.get_user_from_character(character);
    //     if (user != undefined) {
    //         let data = this.prepare_market_orders(market)
    //     this.send_to_character_user(character, 'market-data', data)
    //     }
    // }
    }

    export function explored(user: User) {
        console.log('send exploration')
        // var stack = new Error().stack
        // console.log( stack )

        let character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.generic_user_alert(user, 'explore', character.explored)
        map_position(user, true)

        for (let i = 0; i < character.explored.length; i++) {
            if (character.explored[i]) {
                let cell = MapSystem.id_to_cell(i as cell_id)
                if (cell != undefined) {
                    let x = cell.x
                    let y = cell.y
                    let data = cell.development

                    let res1: {[_ in string]: Development} = {}
                    res1[x + '_' + y] = data
                    if (data != undefined) {
                        Alerts.generic_user_alert(user, 'map-data-cells', res1)
                    }

                    let res2 = {x: x, y: y, ter: cell.terrain}
                    Alerts.generic_user_alert(user, 'map-data-terrain', res2)
                }
            }            
        }
    }

    export function map_position(user: User, teleport_flag:boolean) {
        let character = Convert.user_to_character(user)
        if (character == undefined) return
        let cell = Convert.character_to_cell(character)
        let data = {
            x:cell.x,
            y:cell.y,
            teleport_flag:teleport_flag
        }
        Alerts.generic_user_alert(user, 'map-pos', data)
    }

    export function local_characters(user: User) {
        // prepare data
        const character = Convert.user_to_character(user)
        if (character == undefined) return
        const cell = Convert.character_to_cell(character)
        let characters_list = cell.get_characters_list()

        Alerts.generic_user_alert(user, 'cell-characters', characters_list)
    }

    export function local_actions(user: User) {
        const character = Convert.user_to_character(user)
        if (character == undefined) return
        const cell = Convert.character_to_cell(character)
        Alerts.map_action(user, 'hunt'          , cell.can_hunt())
        Alerts.map_action(user, 'clean'         , cell.can_clean())
        Alerts.map_action(user, 'gather_wood'   , cell.can_gather_wood())
    }

    export function map_related(user: User) {
        console.log('update map related')
        local_actions(user)
        local_characters(user)
        explored(user)
    }

    export function belongings(user: User) {
        stash(user)
        savings(user)
        equip(user)
    }
        
    //     // user.socket.emit('map-data-cells', this.world.constants.development)
    //     // user.socket.emit('map-data-terrain', this.world.constants.terrain)

    export function cell_probability(user: User) {
        const character = Convert.user_to_character(user)
        if (character == undefined) return

        Alerts.cell_action(user, 'hunt', CellActionProb.hunt(character))
    }
}


    // send_skills_info(character: Character) {
    //     
       

    //     
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

// function prepare_market_orders(market: Cell) {
//     let data = market.orders;
//     let orders_array = Array.from(data)
//     let responce: MarketOrderBulkJson[] = []
//     for (let order_id of orders_array) {

//         let order = this.world.get_order(order_id)
//         if (order.amount > 0) {
//             responce.push(order.get_json())
//         }
//     }
//     return responce
// }

    // update_market_info(market: Cell) {
    //     // console.log('sending market orders to client');
    //     let responce = this.prepare_market_orders(market)     

    //     for (let i of this.sockets) {
    //         if (i.current_user != null) {
    //             let char = i.current_user.character;
    //             try {
    //                 let cell1 = char.get_cell();
    //                 if (i.online & i.market_data && (cell1.id==market.id)) {
    //                     i.socket.emit('market-data', responce);
    //                 }
    //             } catch(error) {
    //                 console.log(i.current_user.login);
    //             }
    //         }
    //     }
    // }

    // send_item_market_update_to_character(character: Character) {
    //     let data = AuctionManagement.cell_id_to_orders_socket_data_list(this.world.entity_manager, character.cell_id)
    //     this.send_to_character_user(character, 'item-market-data', data)
    // }



