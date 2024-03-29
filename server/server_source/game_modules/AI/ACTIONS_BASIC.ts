import { money } from "@custom_types/common";
import { rooms } from "../DATA_LAYOUT_BUILDING";
import { CharacterAction } from "../actions/actions_00";
import { ActionManager } from "../actions/manager";
import { select_max, select_weighted, trim } from "../calculations/basic_functions";
import { Character } from "../character/character";
import { Data } from "../data";
import { Effect } from "../events/effects";
import { EventMarket } from "../events/market";
import { ScriptedValue } from "../events/scripted_values";
import { FOOD, MEAT, MaterialsManager, RAT_BONE, RAT_SKIN, material_index, materials } from "../manager_classes/materials_manager";
import { Cell } from "../map/DATA_LAYOUT_CELL";
// import { Cell } from "../map/cell";
import { MapSystem } from "../map/system";
import { Convert } from "../systems_communication";
// import { money } from "../types";
import { dp } from "./AI_CONSTANTS";
import { AItrade, base_price } from "./AI_SCRIPTED_VALUES";
import { coastal_constraints, simple_constraints, urban_constraints } from "./constraints";
import { GenericRest } from "./AI_ROUTINE_GENERIC";

const LOOT = [MEAT, RAT_SKIN, RAT_BONE];
export function loot(character: Character) {
    let tmp = 0;
    for (let tag of LOOT) {
        tmp += character.stash.get(tag) + character.trade_stash.get(tag);
    }
    return tmp;
}
export function sell_loot(character: Character) {
    for (let tag of LOOT) {
        sell_material(character, tag)
    }
}

export function remove_orders(character: Character) {
    EventMarket.remove_bulk_orders(character)
}


export function sell_all_stash(character: Character) {
    for (let tag of materials.get_materials_list()) {
        EventMarket.sell(
            character,
            tag,
            character.stash.get(tag),
            AItrade.sell_price_bulk(character, tag) as money
        );
    }
}

export function sell_material(character: Character, material: material_index) {
    let orders = Convert.cell_id_to_bulk_orders(character.cell_id);
    let best_order = undefined;
    let best_price = 0;
    for (let item of orders) {
        let order = Convert.id_to_bulk_order(item);
        if (order.typ == 'sell')
            continue;
        if (order.tag != material)
            continue;
        if ((best_price < order.price) && (order.amount > 0)) {
            best_price = order.price;
            best_order = order;
        }
    }

    if (best_order == undefined) {
        EventMarket.sell(
                character,
                material,
                character.stash.get(material),
                AItrade.sell_price_bulk(character, material) as money);
        return false;
    }

    EventMarket.execute_buy_order(character, best_order.id, 1);
    return true;
}

export function buy(character: Character, material_index: material_index) {
    let orders = Convert.cell_id_to_bulk_orders(character.cell_id);
    let best_order = undefined;
    let best_price = 9999;
    for (let item of orders) {
        let order = Convert.id_to_bulk_order(item);
        if (order.typ == 'buy')
            continue;
        if (order.tag != material_index)
            continue;
        if ((best_price > order.price) && (order.amount > 0)) {
            best_price = order.price;
            best_order = order;
        }
    }

    if (best_order == undefined)
        return false;

    if (character.savings.get() >= best_price) {
        EventMarket.execute_sell_order(character, best_order.id, 1);
        return true;
    }
    return false;
}

export function buy_random(character: Character) {
    let orders = Convert.cell_id_to_bulk_orders(character.cell_id);
    let best_order = undefined;
    let best_price = 9999;

    for (let item of orders) {
        let order = Convert.id_to_bulk_order(item);
        if (order.typ == 'buy')
            continue;
        if (order.tag != FOOD)
            continue;
        if ((best_price > order.price) && (order.amount > 0)) {
            best_price = order.price;
            best_order = order;
        }
    }

    if (best_order == undefined)
        return false;

    if (character.savings.get() >= best_price) {
        EventMarket.execute_sell_order(character, best_order?.id, 1);
        return true;
    }
    return false;
}

export function random_walk(char: Character, constraints: (cell: Cell) => boolean) {
    let cell = Convert.character_to_cell(char)
    let possible_moves = []
    for (let d of dp) {      
        let tmp: [number, number] = [d[0] + cell.x, d[1] + cell.y]
        let target_id = Data.World.coordinate_to_id(tmp)
        let target_cell = Data.Cells.from_id(target_id)
        if (target_cell != undefined) {
            if (MapSystem.can_move(tmp) && constraints(target_cell)) {
                possible_moves.push(tmp)
            }
        } 
    }
    // console.log(cell.x, cell.y)
    // console.log(possible_moves)
    if (possible_moves.length > 0) {
        let move_direction = possible_moves[Math.floor(Math.random() * possible_moves.length)]
        ActionManager.start_action(
            CharacterAction.MOVE, 
            char, 
            Data.World.coordinate_to_id(move_direction))  
    }
}

export function rat_walk(character: Character, constraints: (cell: Cell) => boolean) {
    let cell_ids = Data.World.neighbours(character.cell_id)
    let potential_moves = cell_ids.map((x) => {   
        let cell = Data.Cells.from_id(x)
        return {item: cell, weight: trim(cell.rat_scent, 0, 5)}
    })
    let target = select_weighted(potential_moves, constraints)
    ActionManager.start_action(CharacterAction.MOVE, character, target.id)
}

export function home_walk(character: Character) {
    if (character.home_cell_id == undefined) {
        let cell_ids = Data.World.neighbours(character.cell_id)
        let potential_moves = cell_ids.map((x) => {   
            let cell = Data.Cells.from_id(x)
            return {item: cell, weight: cell.market_scent}
        })
        let target = select_max(potential_moves, simple_constraints)
        ActionManager.start_action(CharacterAction.MOVE, character, target.id)
    } else {
        let next_cell = MapSystem.find_path(character.cell_id, character.home_cell_id)
        if (next_cell != undefined) {
            ActionManager.start_action(CharacterAction.MOVE, character, next_cell);
        } else {
            console.log('character tries to move home to sell loot but can\'t')
        }
    }
}

export function urban_walk(character: Character) {
    random_walk(character, urban_constraints)
}

export function coast_walk(character: Character) {
    random_walk(character, coastal_constraints)
}

export function rat_go_home(character: Character, constraints: (cell: Cell) => boolean) {
    let cell = Convert.character_to_cell(character)
    let potential_moves = Data.World.neighbours(character.cell_id).map((x) => {return Data.Cells.from_id(x)}).map((x) => 
        {return {item: x, weight: x.rat_scent}})
    let target = select_max(potential_moves, constraints)
    if (target != undefined)
    if (cell.rat_scent > target.rat_scent) {
        // console.log('at home')
        GenericRest(character)
        // ActionManager.start_action(CharacterAction.REST, character, [cell.x, cell.y])
    } else {
        // console.log('keep moving')
        ActionManager.start_action(CharacterAction.MOVE, character, target.id)
    }
}


export function rest_outside(character: Character) {
    ActionManager.start_action(CharacterAction.REST, character, character.cell_id);
}

export function roll_price_belief_sell_increase(character: Character, material: material_index, probability: number) {
    let dice = Math.random()
    let current = character.ai_price_belief_sell.get(material)
    if (current == undefined) {
        character.ai_price_belief_sell.set(material, 1 as money)
    } else if (dice < probability) {
        character.ai_price_belief_sell.set(material, current + 1 as money)
    }
}

export function update_price_beliefs(character: Character) {
    let orders = Convert.cell_id_to_bulk_orders(character.cell_id)
    // initialisation
    
    for (let material of materials.list_of_indices) {
        let value_buy = character.ai_price_belief_buy.get(material)
        let value_sell = character.ai_price_belief_sell.get(material)

        if (value_buy == undefined) {
            character.ai_price_belief_buy.set(material, base_price(character.cell_id, material))
        }
        if (value_sell == undefined) {
            character.ai_price_belief_sell.set(material, base_price(character.cell_id, material))
        }
    }
    
    // updating price beliefs as you go
    for (let item of orders) {
        let order = Data.BulkOrders.from_id(item)
        if (order.typ == "buy") {
            let belief = character.ai_price_belief_sell.get(order.tag)
            if (belief == undefined) {
                character.ai_price_belief_sell.set(order.tag, order.price)
            } else {
                character.ai_price_belief_sell.set(order.tag, Math.round(order.price / 10 + belief * 9 / 10) as money)
            }
            }

        if (order.typ == "sell") {
            let belief = character.ai_price_belief_buy.get(order.tag)
            if (belief == undefined) {
                character.ai_price_belief_buy.set(order.tag, order.price)
            } else {
                character.ai_price_belief_buy.set(order.tag, Math.round(order.price / 10 + belief * 9 / 10) as money)
            }
        }
    }

    //adding a bit of healthy noise
    character.ai_price_belief_buy.forEach((value, key, map) => {
        if (value > 1) {
            if (character.trade_stash.get(key) > 0) {
                let amount = character.trade_stash.get(key) + character.stash.get(key) - 10
                let dice = Math.random()
                if (dice < amount / 30) {
                    map.set(key, value - 1 as money)
                }
            }
            let dice = Math.random()
            if (dice < 0.2) {
                map.set(key, value - 1 as money)
            }
            if (dice > 0.8) {
                map.set(key, value + 1 as money)
            }
        } else {
            let dice = Math.random()
            if (dice > 0.8) {
                map.set(key, value + 1 as money)
            }
        }
    });

    character.ai_price_belief_sell.forEach((value, key, map) => {
        if (value > 1) {
            let dice = Math.random()
            if (dice < 0.2) {
                map.set(key, value - 1 as money)
            }
            if (dice > 0.8) {
                map.set(key, value + 1 as money)
            }
        } else {
            let dice = Math.random()
            if (dice > 0.8) {
                map.set(key, value + 1 as money)
            }
        }
    });
}