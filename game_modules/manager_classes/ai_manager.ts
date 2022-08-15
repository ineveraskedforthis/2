import { craft_bone_arrow_probability } from "../base_game_classes/character_actions/craft_bone_spear";
import { RAT_SKIN_ARMOUR_SKIN_NEEDED } from "../base_game_classes/character_actions/craft_rat_armour";
import type { CharacterGenericPart } from "../base_game_classes/character_generic_part"
import { hostile } from "../base_game_classes/races/racial_hostility";
import { money, Savings } from "../base_game_classes/savings";
import { AuctionManagement } from "../market/market_items";
import { ARMOUR_TYPE } from "../static_data/item_tags";
import { PgPool, World } from "../world";
import { ActionManager, CharacterAction } from "./action_manager";
import { ARROW_BONE, FOOD, MEAT, RAT_BONE, RAT_SKIN, WOOD } from "./materials_manager";


// function MAYOR_AI(mayor: CharacterGenericPart) {
//     let faction = mayor.get_faction()
//     let territories = faction.get_territories_list()
//     for (let ter of territories)  {
//         if (ter.is_contested(faction)) {
//             let enemy = ter.get_largest_enemy_faction(faction)
//             mayor.create_quest({quest_tag: "extermination", target_tag: enemy.get_tag(), territory: ter.tag}, {reputation: 1, money:1})
//         }
//     }
// }

// export const AI = {
//     'major' : MAYOR_AI
// }


let dp = [[0, 1], [0 ,-1] ,[1, 0] ,[-1 ,0],[1 ,1],[-1 ,-1]]


export class AiManager {
    world: World;
    constructor(world:World) {
        this.world = world
    }

    path_finding_calculations() {

    }

    move_toward_colony(char: CharacterGenericPart) {

    }

    enemies_in_cell(char: CharacterGenericPart) {
        let cell = char.get_cell()
        if (cell == undefined) return false
        let a = cell.get_characters_set()
        for (let id of a) {
            let target_char = this.world.get_char_from_id(id)
            if (hostile(char.get_tag(), target_char.get_tag())) {
                if (!target_char.in_battle() && !target_char.is_dead()) {
                    return target_char.id
                }                
            }
        } 
        return -1
    }

    async random_steppe_walk(char: CharacterGenericPart) {
        let cell = char.get_cell()
        if (cell == undefined) {
            return
        }
        let possible_moves = []
        for (let d of dp) {      
            let tmp = [d[0] + cell.i, d[1] + cell.j]
            let territory = this.world.get_territory(tmp[0], tmp[1])
            let new_cell = this.world.get_cell(tmp[0], tmp[1])
            if (new_cell != undefined) {
                if (this.world.can_move(tmp[0], tmp[1]) && (territory != 'colony') && (new_cell.development['wild'] < 1)) {
                    possible_moves.push(tmp)
                }
            } 
        }
        if (possible_moves.length > 0) {
            let move_direction = possible_moves[Math.floor(Math.random() * possible_moves.length)]
            await this.world.action_manager.start_action(CharacterAction.MOVE, char, {x: move_direction[0], y: move_direction[1]})  
        }   
    }

    async random_forest_walk(char: CharacterGenericPart) {
        let cell = char.get_cell()
        if (cell == undefined) {
            return
        }
        let possible_moves = []
        for (let d of dp) {      
            let tmp = [d[0] + cell.i, d[1] + cell.j]
            let territory = this.world.get_territory(tmp[0], tmp[1])
            let new_cell = this.world.get_cell(tmp[0], tmp[1])
            if (new_cell != undefined) {
                if (this.world.can_move(tmp[0], tmp[1]) && (territory != 'colony') && (new_cell.development['wild'] > 0)) {
                    possible_moves.push(tmp)
                }
            } 
        }
        if (possible_moves.length > 0) {
            let move_direction = possible_moves[Math.floor(Math.random() * possible_moves.length)]
            await this.world.action_manager.start_action(CharacterAction.MOVE, char, {x: move_direction[0], y: move_direction[1]})  
        }
    }

    async decision(pool: PgPool, char: CharacterGenericPart) {
        // console.log(char.misc.ai_tag)
        if (char.is_player()) {
            return
        }

        if (char.in_battle()) {
            return
        }

        if (char.action_started) {
            return
        }

        switch(char.misc.ai_tag) {
            case 'steppe_walker_agressive': {
                if ((char.get_fatigue() > 30) || (char.get_stress() > 30)) {
                    await this.world.action_manager.start_action(CharacterAction.REST, char, undefined)
                } else {
                    let target = this.enemies_in_cell(char)
                    if (target != -1) {
                        await this.world.action_manager.start_action(CharacterAction.ATTACK, char, target)
                    } else {
                        await this.random_steppe_walk(char)
                    }
                }
                return
            }
            case 'steppe_walker_passive': {
                if ((char.get_fatigue() > 30) || (char.get_stress() > 30)) {
                    await this.world.action_manager.start_action(CharacterAction.REST, char, undefined)
                } else {
                    await this.random_steppe_walk(char)
                }
                return
            }
            case 'forest_walker': {
                if ((char.get_fatigue() > 30) || (char.get_stress() > 30)) {
                    await this.world.action_manager.start_action(CharacterAction.REST, char, undefined)
                } else {
                    await this.random_forest_walk(char)
                }
                return
            }
        }

        if ((char.get_fatigue() > 90) || (char.get_stress() > 40)) {
            await this.world.action_manager.start_action(CharacterAction.REST, char, undefined)
            return
        }

        if ((char.skills.cooking.practice > 40) || (char.skills.perks.meat_master == true)) {
            await AI.cook_food(pool, this.world.action_manager, char)
        }

        if ((char.skills.woodwork.practice > 40) || (char.skills.perks.fletcher == true)) {
            await AI.make_arrow(pool, this.world.action_manager, char)
        }

        if ((char.skills.perks.skin_armour_master == true)) {
            await AI.make_armour(pool, this.world.action_manager, char)
        }
    }
}

namespace AI {
    export async function cook_food(pool:PgPool, action_manager:ActionManager, character:CharacterGenericPart) {
        let prepared_meat = character.trade_stash.get(FOOD) + character.stash.get(FOOD)
        let resource = character.stash.get(MEAT)
        let food_in_stash = character.stash.get(FOOD)
        let base_buy_price = 5 as money
        let base_sell_price = 10 as money
        let savings = character.savings.get()
        // console.log("AI tick")
        // console.log(prepared_meat, resource, food_in_stash, savings)

        // await character.world.entity_manager.remove_orders(pool, character)

        if ((resource < 5) && (savings > base_buy_price)) {
            await character.world.entity_manager.remove_orders_by_tag(pool, character, MEAT)
            // console.log(Math.floor(savings / base_buy_price), base_buy_price)
            await character.buy(pool, MEAT, Math.floor(savings / base_buy_price), base_buy_price)
        }

        if (prepared_meat < 10) {
            await action_manager.start_action(CharacterAction.COOK_MEAT, character, undefined)
        }

        if (food_in_stash > 0) {
            await character.world.entity_manager.remove_orders_by_tag(pool, character, FOOD)
            await character.sell(pool, FOOD, food_in_stash, base_sell_price)
        }
    }

    export async function make_arrow(pool:PgPool, action_manager:ActionManager, character:CharacterGenericPart) {
        await character.world.entity_manager.remove_orders_by_tag(pool, character, WOOD)
        await character.world.entity_manager.remove_orders_by_tag(pool, character, RAT_BONE)

        let arrows = character.trade_stash.get(ARROW_BONE) + character.stash.get(ARROW_BONE)
        let wood = character.stash.get(WOOD)
        let bones = character.stash.get(RAT_BONE)
        let savings = character.savings.get()
        let trade_savings = character.trade_savings.get()

        let reserve_units = Math.min(wood, bones / 10)

        let arrows_in_stash = character.stash.get(ARROW_BONE)
        let base_price_wood = 5 as money
        let base_price_bones = 1 as money
        let input_price = (base_price_wood + 10 * base_price_bones)
        let profit = 0.5

        let sell_price = Math.floor(input_price * (1 + profit) / craft_bone_arrow_probability(character) / 10) + 1 as money

        // bones_to_buy * b_p + wood_to_buy * w_p = savings
        // (bones_to_buy + bones) - 10 (wood_to_buy + wood) = 0

        // so
        // bones_to_buy * b_p + wood_to_buy * w_p            = savings
        // bones_to_buy       - wood_to_buy * 10             = -bones + 10 * wood

        // bones_to_buy * b_p + wood_to_buy * w_p            = savings
        // bones_to_buy * b_p - wood_to_buy * 10 b_p         = (-bones + 10 * wood) * b_p

        // bones_to_buy * b_p + wood_to_buy * w_p            = savings
        //                    - wood_to_buy * (10 b_p + w_p) = (-bones + 10 * wood) * b_p - savings

        // bones_to_buy * b_p + wood_to_buy * w_p            = savings
        //                    - wood_to_buy                  = ((-bones + 10 * wood) * b_p - savings) / (10 b_p + w_p)

        // bones_to_buy                                      = (savings - wood_to_buy * w_p) / b_p
        //                    - wood_to_buy                  = ((-bones + 10 * wood) * b_p - savings) / (10 b_p + w_p)
        // makes sense only if results are not negative

        if (reserve_units < 5) {

            let savings = character.savings.get()
            
            let wood_to_buy = -((-bones + 10 * wood) * base_price_bones - savings) / (10 * base_price_bones + base_price_wood)
            let bones_to_buy = (savings - wood_to_buy * base_price_wood) / base_price_bones
            console.log(savings, bones, wood)
            console.log(wood_to_buy, bones_to_buy)

            if ((wood_to_buy >= 1) && (bones_to_buy >= 1)) {
                await character.buy(pool, WOOD, Math.floor(wood_to_buy), base_price_wood)
                await character.buy(pool, RAT_BONE, Math.floor(bones_to_buy), base_price_bones)
            } else if ((wood_to_buy >= 1) && (bones_to_buy < 1)) {
                await character.buy(pool, WOOD, Math.floor(savings / base_price_wood), base_price_wood)
            } else if ((wood_to_buy < 1) && (bones_to_buy >= 1)) {
                await character.buy(pool, RAT_BONE, Math.floor(savings / RAT_BONE), base_price_bones)
            } 
        }

        if (arrows < 100) {
            await action_manager.start_action(CharacterAction.CRAFT_BONE_ARROW, character, undefined)
        }
        
        if (arrows_in_stash > 0) {
            await character.world.entity_manager.remove_orders_by_tag(pool, character, ARROW_BONE)
            arrows_in_stash = character.stash.get(ARROW_BONE)
            await character.sell(pool, ARROW_BONE, arrows_in_stash, sell_price)
        }
    }

    export async function make_armour(pool:PgPool, action_manager:ActionManager, character:CharacterGenericPart) {
        let base_price_skin = 10 as money

        let resource = character.stash.get(RAT_SKIN)
        let savings = character.savings.get()
        

        let skin_to_buy = Math.floor(savings / base_price_skin)

        console.log('armour')
        console.log(resource, savings, skin_to_buy)
        if (skin_to_buy > 5) {
            await character.world.entity_manager.remove_orders_by_tag(pool, character, RAT_SKIN)

            await character.buy(pool, RAT_SKIN, skin_to_buy, base_price_skin)
        }

        if (resource > RAT_SKIN_ARMOUR_SKIN_NEEDED) {
            await action_manager.start_action(CharacterAction.CRAFT_RAT_ARMOUR, character, undefined)
        }

        let data = character.equip.data.backpack.armours
        for (let index in data ) {
            index = index as any
            if (data[index]?.type == ARMOUR_TYPE.BODY) {
                let price = Math.floor(base_price_skin * RAT_SKIN_ARMOUR_SKIN_NEEDED * 1.5) as money
                await AuctionManagement.sell(pool, character.world.entity_manager, character.world.socket_manager, character, "armour", index as any, price, price)
            }
        }
    }
}