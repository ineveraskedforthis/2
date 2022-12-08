import { RAT_SKIN_ARMOUR_SKIN_NEEDED, RAT_SKIN_BOOTS_SKIN_NEEDED, RAT_SKIN_PANTS_SKIN_NEEDED } from "../actions/actions_set_up/character_actions/craft_rat_armour";
import type { Character } from "../character/character"
import { hostile } from "../character/races/racial_hostility";
import { ActionManager, CharacterAction } from "../actions/action_manager";
import { ARROW_BONE, ELODINO_FLESH, FOOD, MEAT, RAT_BONE, RAT_SKIN, WOOD, ZAZ } from "../manager_classes/materials_manager";
import { Convert } from "../systems_communication";
import { MapSystem } from "../map/system";
import { Cell } from "../map/cell";
import { AIhelper } from "./helpers";
import { Event } from "../events/events";
import { money } from "../types";
import { BulkOrders, ItemOrders } from "../market/system";
import { EventMarket } from "../events/market";
import { Craft } from "../calculations/craft";
import { trim } from "../calculations/basic_functions";
import { Data } from "../data";
import { COOKING_TIER, ELODINO_TIER } from "../actions/actions_set_up/character_actions/cook_meat";
import { ARROW_TIER } from "../actions/actions_set_up/character_actions/craft_bone_arrow";


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
    return (cell.development['urban'] < 1) && (cell.development['wild'] > 0)
} 
function steppe_constraints(cell: Cell) {
    return (cell.development['urban'] < 1) && (cell.development['wild'] < 1)
}

export namespace CampaignAI {

    const base_price_wood = 10 as money
    const base_price_bones = 3 as money
    const base_price_skin = 10 as money
    const base_price_elodino = 50 as money

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
                if ((char.get_fatigue() > 60) || (char.get_stress() > 30)) {
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
                if ((char.get_fatigue() > 60) || (char.get_stress() > 30)) {
                    ActionManager.start_action(CharacterAction.REST, char, [0, 0])
                } else {
                    random_walk(char, steppe_constraints)
                }
                break
            }

            case 'forest_walker': {
                if ((char.get_fatigue() > 60) || (char.get_stress() > 30)) {
                    ActionManager.start_action(CharacterAction.REST, char, [0, 0])
                } else {
                    random_walk(char, forest_constraints)
                }
                break
            }
        }

        if ((char.get_fatigue() > 60) || (char.get_stress() > 40)) {
            ActionManager.start_action(CharacterAction.REST, char, [0, 0])
            return
        }

        if ((char.skills.cooking > 40) || (char.perks.meat_master == true)) {
            AI.cook_food(char)
        }

        if ((char.skills.woodwork > 40) && (char.perks.fletcher == true)) {
            AI.make_arrow(char, base_price_wood, base_price_bones)
        }

        if ((char.skills.woodwork > 40) && (char.perks.weapon_maker == true)) {
            AI.make_wooden_weapon(char, base_price_wood)
        }

        if ((char.skills.bone_carving > 40) && (char.perks.weapon_maker == true)) {
            AI.make_bone_weapon(char, base_price_bones)
        }

        if ((char.skills.clothier > 40) && (char.perks.skin_armour_master == true)) {
            AI.make_armour(char, base_price_skin)
        }

        if ((char.perks.alchemist)) {
            AI.extract_zaz(char, base_price_elodino)
        }
    }
}

export namespace AI {
    export function extract_zaz(character: Character, price_elo: money) {
        const zaz_price = Math.round(2 * price_elo / Craft.Amount.elodino_zaz_extraction(character, ELODINO_TIER)) as money

        const current_zaz = character.stash.get(ZAZ)
        if (current_zaz > 0) {
            BulkOrders.remove_by_condition(character, ZAZ)
            let total_amount = character.stash.get(ZAZ)
            EventMarket.sell(character, ZAZ, total_amount, zaz_price)
        }

        BulkOrders.remove_by_condition(character, ELODINO_FLESH)
        const savings = character.savings.get()
        const resource = character.stash.get(ELODINO_FLESH)
        const want_to_buy = trim(20 - resource, 0, savings / price_elo)       
        if ((want_to_buy > 5)) {
            EventMarket.buy(character, ELODINO_FLESH, want_to_buy, price_elo)
        }

        if (resource > 0) {
            ActionManager.start_action(CharacterAction.COOK.ELODINO, character, [0, 0])
        }

        let food_in_stash = character.stash.get(FOOD)
        if (food_in_stash > 0) {
            BulkOrders.remove_by_condition(character, FOOD)
            EventMarket.sell(character, FOOD, food_in_stash, 0 as money) //alchemist sells very cheap food
        }
    }

    export  function cook_food(character:Character) {
        let prepared_meat = character.trade_stash.get(FOOD) + character.stash.get(FOOD)
        let resource = character.stash.get(MEAT)
        let food_in_stash = character.stash.get(FOOD)
        let base_buy_price = 5 as money
        // let base_sell_price = 10 as money
        const profit = 1.5

        let sell_price = Math.round(base_buy_price * (1 + profit) / Craft.Amount.Cooking.meat(character, COOKING_TIER)) + 1 as money

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
            EventMarket.sell(character, FOOD, food_in_stash, sell_price)
        }
    }



    export  function make_arrow(character:Character, price_wood: money, price_bones: money) {
        BulkOrders.remove_by_condition(character, WOOD)
        BulkOrders.remove_by_condition(character, RAT_BONE)

        let arrows = character.trade_stash.get(ARROW_BONE) + character.stash.get(ARROW_BONE)
        let wood = character.stash.get(WOOD)
        let bones = character.stash.get(RAT_BONE)
        let savings = character.savings.get()
        let trade_savings = character.trade_savings.get()

        let reserve_units = Math.min(wood, bones / 10)

        let arrows_in_stash = character.stash.get(ARROW_BONE)
        let local_price_wood = price_wood
        let cell = Convert.character_to_cell(character)
        if (cell.can_gather_wood()) local_price_wood = 3 as money

        let input_price = (local_price_wood + 10 * price_bones)
        let profit = 3

        let sell_price = Math.floor(input_price * (1 + profit) / Craft.Amount.arrow(character, ARROW_TIER)) + 1 as money

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
            
            let wood_to_buy = -((-bones + 10 * wood) * price_bones - savings) / (10 * price_bones + local_price_wood)
            let bones_to_buy = (savings - wood_to_buy * local_price_wood) / price_bones
            // console.log(savings, bones, wood)
            // console.log(wood_to_buy, bones_to_buy)

            if ((wood_to_buy >= 1) && (bones_to_buy >= 1)) {
                EventMarket.buy(character, WOOD, Math.floor(wood_to_buy), local_price_wood)
                EventMarket.buy(character, RAT_BONE, Math.floor(bones_to_buy), price_bones)
            } else if ((wood_to_buy >= 1) && (bones_to_buy < 1)) {
                EventMarket.buy(character, WOOD, Math.floor(savings / local_price_wood), local_price_wood)
            } else if ((wood_to_buy < 1) && (bones_to_buy >= 1)) {
                EventMarket.buy(character, RAT_BONE, Math.floor(savings / price_bones), price_bones)
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



    export  function make_armour(character:Character, price_skin: money) {
        BulkOrders.remove_by_condition(character, RAT_SKIN)
        let resource = character.stash.get(RAT_SKIN)
        let savings = character.savings.get()

        let skin_to_buy = Math.floor(savings / price_skin)

        // console.log('armour')
        // console.log(resource, savings, skin_to_buy)
        if (skin_to_buy > 5) {
            BulkOrders.remove_by_condition(character, RAT_SKIN)
            EventMarket.buy(character, RAT_SKIN, trim(skin_to_buy, 0, 50), price_skin)
        }

        if (resource > RAT_SKIN_ARMOUR_SKIN_NEEDED) {
            const flags = check_if_set_is_ready(character)
            if (!flags.body) ActionManager.start_action(CharacterAction.CRAFT.RAT_ARMOUR, character, [0, 0])
            else if (!flags.legs) ActionManager.start_action(CharacterAction.CRAFT.RAT_PANTS, character, [0, 0])
            else if (!flags.foot) ActionManager.start_action(CharacterAction.CRAFT.RAT_BOOTS, character, [0, 0])
            else sell_armour_set(character, price_skin)
        }
    }

    function check_if_set_is_ready(character:Character) {
        let flags = {'legs': false, 'body': false, 'foot': false}

        let data = character.equip.data.backpack.items
        for (let [index, item] of Object.entries(data) ) {
            if (item?.slot == 'body') {
                flags.body = true
            }
            if (item?.slot == 'legs') {
                flags.legs = true
            }
            if (item?.slot == 'foot') {
                flags.foot = true
            }
        }

        // console.log(flags)
        return flags
    }

    function sell_armour_set(character: Character, price_skin: money) {
        let data = character.equip.data.backpack.items
        for (let [index, item] of Object.entries(data) ) {
            if (item?.slot == 'body') {
                let price = Math.floor(price_skin * RAT_SKIN_ARMOUR_SKIN_NEEDED * 2) as money
                EventMarket.sell_item(character, Number(index), price)
            }

            if (item?.slot == 'foot') {
                let price = Math.floor(price_skin * RAT_SKIN_BOOTS_SKIN_NEEDED * 2) as money
                EventMarket.sell_item(character, Number(index), price)
            }

            if (item?.slot == 'legs') {
                let price = Math.floor(price_skin * RAT_SKIN_PANTS_SKIN_NEEDED * 2) as money
                EventMarket.sell_item(character, Number(index), price)
            }
        }
    }

    function sell_weapons(character: Character) {
        let data = character.equip.data.backpack.items
        for (let [index, item] of Object.entries(data) ) {
            if (item?.slot == 'weapon') {
                const price_noise = Math.random() * 100
                let price = Math.floor(150 + price_noise) as money
                EventMarket.sell_item(character, Number(index), price)
            }
        }
    }

    export function make_wooden_weapon(character: Character, price_wood: money) {
        BulkOrders.remove_by_condition(character, WOOD)

        let savings = character.savings.get()
        let wood_to_buy = Math.floor(savings / price_wood)
        if (wood_to_buy > 5) {
            BulkOrders.remove_by_condition(character, WOOD)
            EventMarket.buy(character, WOOD, trim(wood_to_buy, 0, 50), price_wood)
        }

        let resource = character.stash.get(WOOD)
        if (resource > 20) {
            const dice = Math.random()
            if (dice < 0.5) ActionManager.start_action(CharacterAction.CRAFT.SPEAR, character, [0, 0])
            else if (dice < 0.8) ActionManager.start_action(CharacterAction.CRAFT.MACE, character, [0, 0])
            else ActionManager.start_action(CharacterAction.CRAFT.WOOD_BOW, character, [0, 0])
        }

        sell_weapons(character)
    }


    export function make_bone_weapon(character: Character, bone_price: money) {
        BulkOrders.remove_by_condition(character, RAT_BONE)

        let savings = character.savings.get()
        let bones_to_buy = Math.floor(savings / bone_price)
        if (bones_to_buy > 5) {
            BulkOrders.remove_by_condition(character, RAT_BONE)
            EventMarket.buy(character, RAT_BONE, trim(bones_to_buy, 0, 50), bone_price)
        }

        let resource = character.stash.get(RAT_BONE)
        if (resource > 20) {
            const dice = Math.random()
            if (dice < 1) ActionManager.start_action(CharacterAction.CRAFT.DAGGER, character, [0, 0])
        }

        sell_weapons(character)
    }
}