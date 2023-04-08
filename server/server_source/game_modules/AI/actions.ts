import { CharacterAction } from "../action_types";
import { ActionManager } from "../actions/action_manager";
import { select_max, select_weighted, trim } from "../calculations/basic_functions";
import { Character } from "../character/character";
import { Data } from "../data";
import { Effect } from "../events/effects";
import { EventMarket } from "../events/market";
import { ScriptedValue } from "../events/scripted_values";
import { FOOD, MEAT, MaterialsManager, RAT_BONE, RAT_SKIN, materials } from "../manager_classes/materials_manager";
import { Cell } from "../map/cell";
import { MapSystem } from "../map/system";
import { Convert } from "../systems_communication";
import { money } from "../types";
import { dp } from "./AI_CONSTANTS";
import { AItrade } from "./AI_SCRIPTED_VALUES";
import { simple_constraints, urban_constraints } from "./constraints";

const LOOT = [MEAT, RAT_SKIN, RAT_BONE];
export function loot(character: Character) {
    let tmp = 0;
    for (let tag of LOOT) {
        tmp += character.stash.get(tag);
    }
    return tmp;
}
export function sell_loot(character: Character) {
    for (let tag of LOOT) {
        EventMarket.sell(
            character,
            tag,
            character.stash.get(tag),
            AItrade.sell_price_bulk(character, tag) - 1 as money
        );
    }
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

export function buy_food(character: Character) {
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

export function rat_walk(character: Character, constraints: (cell: Cell) => boolean) {
    let cell = Convert.character_to_cell(character)
    let potential_moves = MapSystem.neighbours_cells(cell.id).map((x) => 
        {return {item: x, weight: trim(x.rat_scent, 0, 20)}})
    let target = select_weighted(potential_moves, constraints)
    ActionManager.start_action(CharacterAction.MOVE, character, [target.x, target.y])
}

export function market_walk(character: Character) {
    let cell = Convert.character_to_cell(character)
    let potential_moves = MapSystem.neighbours_cells(cell.id).map((x) => {
        return {item: x, weight: x.market_scent}
    })
    let target = select_max(potential_moves, simple_constraints)
    ActionManager.start_action(CharacterAction.MOVE, character, [target?.x, target?.y])
}

export function urban_walk(character: Character) {
    random_walk(character, urban_constraints)
}

export function rat_go_home(character: Character, constraints: (cell: Cell) => boolean) {
    let cell = Convert.character_to_cell(character)
    let potential_moves = MapSystem.neighbours_cells(cell.id, ).map((x) => 
        {return {item: x, weight: x.rat_scent}})
    let target = select_max(potential_moves, constraints)
    if (target != undefined)
    if (cell.rat_scent > target.rat_scent) {
        ActionManager.start_action(CharacterAction.REST, character, [cell.x, cell.y])
    } else {
        ActionManager.start_action(CharacterAction.MOVE, character, [target.x, target.y])
    }
}

export function rest_building(character: Character, budget: money) {
    let cell = character.cell_id
    let buildings = Data.Buildings.from_cell_id(cell)

    if (buildings == undefined) return false

    let fatigue_utility = 1
    let money_utility = 10

    let best_utility = 0
    let target = undefined

    for (let item of buildings) {
        let price = ScriptedValue.room_price(item, character.id)
        let building = Data.Buildings.from_id(item)
        let fatigue_target = ScriptedValue.rest_target_fatigue(building.tier, building.durability, character.race())
        let fatigue_change = character.get_fatigue() - fatigue_target

        let utility = fatigue_change * fatigue_utility - price * money_utility

        if ((utility > best_utility) && (price < budget)) {
            target = item
            best_utility = utility
        }
    }

    if (target == undefined) return false

    Effect.rent_room(character.id, target)
    return true
}

export function rest_outside(character: Character) {
    ActionManager.start_action(CharacterAction.REST, character, [0, 0]);
}