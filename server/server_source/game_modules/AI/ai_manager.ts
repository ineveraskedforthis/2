import { RAT_SKIN_ARMOUR_SKIN_NEEDED } from "../actions/actions_set_up/character_actions/craft_rat_armour";
import type { Character } from "../character/character"
import { hostile } from "../character/races/racial_hostility";
import { ActionManager, CharacterAction } from "../actions/action_manager";
import { ARROW_BONE, FOOD, MEAT, RAT_BONE, RAT_SKIN, WOOD } from "../manager_classes/materials_manager";
import { Convert } from "../systems_communication";
import { MapSystem } from "../map/system";
import { Cell } from "../map/cell";
import { AIhelper } from "./helpers";
import { Event } from "../events/events";
import { money } from "../types";
import { BulkOrders, ItemOrders } from "../market/system";
import { EventMarket } from "../events/market";
import { Craft } from "../calculations/craft";


// function MAYOR_AI(mayor: Character) {
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
function forest_constraints(cell: Cell) {
    return (cell.development['urban'] < 1) && (cell.development['wild'] < 1)
} 
function steppe_constraints(cell: Cell) {
    return (cell.development['urban'] < 1) && (cell.development['wild'] < 1)
}

export namespace CampaignAI {

    // constructor(world:World) {
    //     this.world = world
    // }

    // path_finding_calculations() {

    // }

    // move_toward_colony(char: Character) {

    // }

    export function random_walk(char: Character, constraints: (cell: Cell) => boolean) {
        let cell = Convert.character_to_cell(char)
        let possible_moves = []
        for (let d of dp) {      
            let tmp: [number, number] = [d[0] + cell.x, d[1] + cell.y]
            // let territory = this.world.get_territory(tmp[0], tmp[1])
            let target = MapSystem.coordinate_to_cell(tmp)
            if (target != undefined) {
                if (MapSystem.can_move(tmp) && constraints(target)) {
                    possible_moves.push(tmp)
                }
            } 
        }
        if (possible_moves.length > 0) {
            let move_direction = possible_moves[Math.floor(Math.random() * possible_moves.length)]
            ActionManager.start_action(CharacterAction.MOVE, char, move_direction)  
        }   
    }

    export function decision(char: Character) {
        // console.log(char.misc.ai_tag)
        if (char.is_player()) {
            return
        }

        if (char.in_battle()) {
            return
        }

        if (char.action != undefined) {
            return
        }

        let responce = AIhelper.check_battles_to_join(char)
        if (responce) return;

        switch(char.archetype.ai_map) {
            case 'steppe_walker_agressive': {
                if ((char.get_fatigue() > 30) || (char.get_stress() > 30)) {
                    ActionManager.start_action(CharacterAction.REST, char, [0, 0])
                } else {
                    let target = AIhelper.enemies_in_cell(char)
                    const target_char = Convert.id_to_character(target)
                    if (target_char != undefined) {
                        Event.start_battle(char, target_char)
                    } else {
                        random_walk(char, steppe_constraints)
                    }
                }
                break
            }

            case 'steppe_walker_passive': {
                if ((char.get_fatigue() > 30) || (char.get_stress() > 30)) {
                    ActionManager.start_action(CharacterAction.REST, char, [0, 0])
                } else {
                    random_walk(char, steppe_constraints)
                }
                break
            }

            case 'forest_walker': {
                if ((char.get_fatigue() > 30) || (char.get_stress() > 30)) {
                    ActionManager.start_action(CharacterAction.REST, char, [0, 0])
                } else {
                    random_walk(char, forest_constraints)
                }
                break
            }
        }

        if ((char.get_fatigue() > 90) || (char.get_stress() > 40)) {
            ActionManager.start_action(CharacterAction.REST, char, [0, 0])
            return
        }

        if ((char.skills.cooking > 40) || (char.perks.meat_master == true)) {
            AI.cook_food(char)
        }

        if ((char.skills.woodwork > 40) || (char.perks.fletcher == true)) {
            AI.make_arrow(char)
        }

        if ((char.skills.clothier > 40) ||(char.perks.skin_armour_master == true)) {
            AI.make_armour(char)
        }
    }
}

export namespace AI {
    export  function cook_food(character:Character) {
        let prepared_meat = character.trade_stash.get(FOOD) + character.stash.get(FOOD)
        let resource = character.stash.get(MEAT)
        let food_in_stash = character.stash.get(FOOD)
        let base_buy_price = 5 as money
        let base_sell_price = 10 as money
        let savings = character.savings.get()
        // console.log("AI tick")
        // console.log(prepared_meat, resource, food_in_stash, savings)

        //  character.world.entity_manager.remove_orders(character)

        if ((resource < 5) && (savings > base_buy_price)) {
            BulkOrders.remove_by_condition(character, MEAT)
            // console.log(Math.floor(savings / base_buy_price), base_buy_price)
            EventMarket.buy(character, MEAT, Math.floor(savings / base_buy_price), base_buy_price)
        }

        if (prepared_meat < 10) {
            ActionManager.start_action(CharacterAction.COOK.MEAT, character, [0, 0])
        }

        if (food_in_stash > 0) {
            BulkOrders.remove_by_condition(character, FOOD)
            EventMarket.sell(character, FOOD, food_in_stash, base_sell_price)
        }
    }

    export  function make_arrow(character:Character) {
        BulkOrders.remove_by_condition(character, WOOD)
        BulkOrders.remove_by_condition(character, RAT_BONE)

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

        let sell_price = Math.floor(input_price * (1 + profit) / Craft.Amount.arrow(character)) + 1 as money

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
            // console.log(savings, bones, wood)
            // console.log(wood_to_buy, bones_to_buy)

            if ((wood_to_buy >= 1) && (bones_to_buy >= 1)) {
                EventMarket.buy(character, WOOD, Math.floor(wood_to_buy), base_price_wood)
                EventMarket.buy(character, RAT_BONE, Math.floor(bones_to_buy), base_price_bones)
            } else if ((wood_to_buy >= 1) && (bones_to_buy < 1)) {
                EventMarket.buy(character, WOOD, Math.floor(savings / base_price_wood), base_price_wood)
            } else if ((wood_to_buy < 1) && (bones_to_buy >= 1)) {
                EventMarket.buy(character, RAT_BONE, Math.floor(savings / base_price_bones), base_price_bones)
            } 
        }

        if (arrows < 100) {
             ActionManager.start_action(CharacterAction.CRAFT.BONE_ARROW, character, [0, 0])
        }
        
        if (arrows_in_stash > 0) {
            BulkOrders.remove_by_condition(character, ARROW_BONE)
            arrows_in_stash = character.stash.get(ARROW_BONE)
            EventMarket.sell(character, ARROW_BONE, arrows_in_stash, sell_price)
        }
    }

    export  function make_armour(character:Character) {
        let base_price_skin = 10 as money

        let resource = character.stash.get(RAT_SKIN)
        let savings = character.savings.get()
        

        let skin_to_buy = Math.floor(savings / base_price_skin)

        // console.log('armour')
        // console.log(resource, savings, skin_to_buy)
        if (skin_to_buy > 5) {
            BulkOrders.remove_by_condition(character, RAT_SKIN)
            EventMarket.sell(character, RAT_SKIN, skin_to_buy, base_price_skin)
        }

        if (resource > RAT_SKIN_ARMOUR_SKIN_NEEDED) {
             ActionManager.start_action(CharacterAction.CRAFT.RAT_ARMOUR, character, [0, 0])
        }

        let data = character.equip.data.backpack.items
        for (let [index, item] of Object.entries(data) ) {
            if (item?.slot == 'body') {
                let price = Math.floor(base_price_skin * RAT_SKIN_ARMOUR_SKIN_NEEDED * 1.5) as money
                EventMarket.sell_item(character, Number(index), price)
            }
        }
    }
}