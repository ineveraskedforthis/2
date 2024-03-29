"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update_price_beliefs = exports.roll_price_belief_sell_increase = exports.rest_outside = exports.rat_go_home = exports.coast_walk = exports.urban_walk = exports.home_walk = exports.rat_walk = exports.random_walk = exports.buy_random = exports.buy = exports.sell_material = exports.sell_all_stash = exports.remove_orders = exports.sell_loot = exports.loot = void 0;
const actions_00_1 = require("../actions/actions_00");
const manager_1 = require("../actions/manager");
const basic_functions_1 = require("../calculations/basic_functions");
const data_1 = require("../data");
const market_1 = require("../events/market");
const materials_manager_1 = require("../manager_classes/materials_manager");
// import { Cell } from "../map/cell";
const system_1 = require("../map/system");
const systems_communication_1 = require("../systems_communication");
// import { money } from "../types";
const AI_CONSTANTS_1 = require("./AI_CONSTANTS");
const AI_SCRIPTED_VALUES_1 = require("./AI_SCRIPTED_VALUES");
const constraints_1 = require("./constraints");
const AI_ROUTINE_GENERIC_1 = require("./AI_ROUTINE_GENERIC");
const LOOT = [materials_manager_1.MEAT, materials_manager_1.RAT_SKIN, materials_manager_1.RAT_BONE];
function loot(character) {
    let tmp = 0;
    for (let tag of LOOT) {
        tmp += character.stash.get(tag) + character.trade_stash.get(tag);
    }
    return tmp;
}
exports.loot = loot;
function sell_loot(character) {
    for (let tag of LOOT) {
        sell_material(character, tag);
    }
}
exports.sell_loot = sell_loot;
function remove_orders(character) {
    market_1.EventMarket.remove_bulk_orders(character);
}
exports.remove_orders = remove_orders;
function sell_all_stash(character) {
    for (let tag of materials_manager_1.materials.get_materials_list()) {
        market_1.EventMarket.sell(character, tag, character.stash.get(tag), AI_SCRIPTED_VALUES_1.AItrade.sell_price_bulk(character, tag));
    }
}
exports.sell_all_stash = sell_all_stash;
function sell_material(character, material) {
    let orders = systems_communication_1.Convert.cell_id_to_bulk_orders(character.cell_id);
    let best_order = undefined;
    let best_price = 0;
    for (let item of orders) {
        let order = systems_communication_1.Convert.id_to_bulk_order(item);
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
        market_1.EventMarket.sell(character, material, character.stash.get(material), AI_SCRIPTED_VALUES_1.AItrade.sell_price_bulk(character, material));
        return false;
    }
    market_1.EventMarket.execute_buy_order(character, best_order.id, 1);
    return true;
}
exports.sell_material = sell_material;
function buy(character, material_index) {
    let orders = systems_communication_1.Convert.cell_id_to_bulk_orders(character.cell_id);
    let best_order = undefined;
    let best_price = 9999;
    for (let item of orders) {
        let order = systems_communication_1.Convert.id_to_bulk_order(item);
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
        market_1.EventMarket.execute_sell_order(character, best_order.id, 1);
        return true;
    }
    return false;
}
exports.buy = buy;
function buy_random(character) {
    let orders = systems_communication_1.Convert.cell_id_to_bulk_orders(character.cell_id);
    let best_order = undefined;
    let best_price = 9999;
    for (let item of orders) {
        let order = systems_communication_1.Convert.id_to_bulk_order(item);
        if (order.typ == 'buy')
            continue;
        if (order.tag != materials_manager_1.FOOD)
            continue;
        if ((best_price > order.price) && (order.amount > 0)) {
            best_price = order.price;
            best_order = order;
        }
    }
    if (best_order == undefined)
        return false;
    if (character.savings.get() >= best_price) {
        market_1.EventMarket.execute_sell_order(character, best_order?.id, 1);
        return true;
    }
    return false;
}
exports.buy_random = buy_random;
function random_walk(char, constraints) {
    let cell = systems_communication_1.Convert.character_to_cell(char);
    let possible_moves = [];
    for (let d of AI_CONSTANTS_1.dp) {
        let tmp = [d[0] + cell.x, d[1] + cell.y];
        let target_id = data_1.Data.World.coordinate_to_id(tmp);
        let target_cell = data_1.Data.Cells.from_id(target_id);
        if (target_cell != undefined) {
            if (system_1.MapSystem.can_move(tmp) && constraints(target_cell)) {
                possible_moves.push(tmp);
            }
        }
    }
    // console.log(cell.x, cell.y)
    // console.log(possible_moves)
    if (possible_moves.length > 0) {
        let move_direction = possible_moves[Math.floor(Math.random() * possible_moves.length)];
        manager_1.ActionManager.start_action(actions_00_1.CharacterAction.MOVE, char, data_1.Data.World.coordinate_to_id(move_direction));
    }
}
exports.random_walk = random_walk;
function rat_walk(character, constraints) {
    let cell_ids = data_1.Data.World.neighbours(character.cell_id);
    let potential_moves = cell_ids.map((x) => {
        let cell = data_1.Data.Cells.from_id(x);
        return { item: cell, weight: (0, basic_functions_1.trim)(cell.rat_scent, 0, 5) };
    });
    let target = (0, basic_functions_1.select_weighted)(potential_moves, constraints);
    manager_1.ActionManager.start_action(actions_00_1.CharacterAction.MOVE, character, target.id);
}
exports.rat_walk = rat_walk;
function home_walk(character) {
    if (character.home_cell_id == undefined) {
        let cell_ids = data_1.Data.World.neighbours(character.cell_id);
        let potential_moves = cell_ids.map((x) => {
            let cell = data_1.Data.Cells.from_id(x);
            return { item: cell, weight: cell.market_scent };
        });
        let target = (0, basic_functions_1.select_max)(potential_moves, constraints_1.simple_constraints);
        manager_1.ActionManager.start_action(actions_00_1.CharacterAction.MOVE, character, target.id);
    }
    else {
        let next_cell = system_1.MapSystem.find_path(character.cell_id, character.home_cell_id);
        if (next_cell != undefined) {
            manager_1.ActionManager.start_action(actions_00_1.CharacterAction.MOVE, character, next_cell);
        }
        else {
            console.log('character tries to move home to sell loot but can\'t');
        }
    }
}
exports.home_walk = home_walk;
function urban_walk(character) {
    random_walk(character, constraints_1.urban_constraints);
}
exports.urban_walk = urban_walk;
function coast_walk(character) {
    random_walk(character, constraints_1.coastal_constraints);
}
exports.coast_walk = coast_walk;
function rat_go_home(character, constraints) {
    let cell = systems_communication_1.Convert.character_to_cell(character);
    let potential_moves = data_1.Data.World.neighbours(character.cell_id).map((x) => { return data_1.Data.Cells.from_id(x); }).map((x) => { return { item: x, weight: x.rat_scent }; });
    let target = (0, basic_functions_1.select_max)(potential_moves, constraints);
    if (target != undefined)
        if (cell.rat_scent > target.rat_scent) {
            // console.log('at home')
            (0, AI_ROUTINE_GENERIC_1.GenericRest)(character);
            // ActionManager.start_action(CharacterAction.REST, character, [cell.x, cell.y])
        }
        else {
            // console.log('keep moving')
            manager_1.ActionManager.start_action(actions_00_1.CharacterAction.MOVE, character, target.id);
        }
}
exports.rat_go_home = rat_go_home;
function rest_outside(character) {
    manager_1.ActionManager.start_action(actions_00_1.CharacterAction.REST, character, character.cell_id);
}
exports.rest_outside = rest_outside;
function roll_price_belief_sell_increase(character, material, probability) {
    let dice = Math.random();
    let current = character.ai_price_belief_sell.get(material);
    if (current == undefined) {
        character.ai_price_belief_sell.set(material, 1);
    }
    else if (dice < probability) {
        character.ai_price_belief_sell.set(material, current + 1);
    }
}
exports.roll_price_belief_sell_increase = roll_price_belief_sell_increase;
function update_price_beliefs(character) {
    let orders = systems_communication_1.Convert.cell_id_to_bulk_orders(character.cell_id);
    // initialisation
    for (let material of materials_manager_1.materials.list_of_indices) {
        let value_buy = character.ai_price_belief_buy.get(material);
        let value_sell = character.ai_price_belief_sell.get(material);
        if (value_buy == undefined) {
            character.ai_price_belief_buy.set(material, (0, AI_SCRIPTED_VALUES_1.base_price)(character.cell_id, material));
        }
        if (value_sell == undefined) {
            character.ai_price_belief_sell.set(material, (0, AI_SCRIPTED_VALUES_1.base_price)(character.cell_id, material));
        }
    }
    // updating price beliefs as you go
    for (let item of orders) {
        let order = data_1.Data.BulkOrders.from_id(item);
        if (order.typ == "buy") {
            let belief = character.ai_price_belief_sell.get(order.tag);
            if (belief == undefined) {
                character.ai_price_belief_sell.set(order.tag, order.price);
            }
            else {
                character.ai_price_belief_sell.set(order.tag, Math.round(order.price / 10 + belief * 9 / 10));
            }
        }
        if (order.typ == "sell") {
            let belief = character.ai_price_belief_buy.get(order.tag);
            if (belief == undefined) {
                character.ai_price_belief_buy.set(order.tag, order.price);
            }
            else {
                character.ai_price_belief_buy.set(order.tag, Math.round(order.price / 10 + belief * 9 / 10));
            }
        }
    }
    //adding a bit of healthy noise
    character.ai_price_belief_buy.forEach((value, key, map) => {
        if (value > 1) {
            if (character.trade_stash.get(key) > 0) {
                let amount = character.trade_stash.get(key) + character.stash.get(key) - 10;
                let dice = Math.random();
                if (dice < amount / 30) {
                    map.set(key, value - 1);
                }
            }
            let dice = Math.random();
            if (dice < 0.2) {
                map.set(key, value - 1);
            }
            if (dice > 0.8) {
                map.set(key, value + 1);
            }
        }
        else {
            let dice = Math.random();
            if (dice > 0.8) {
                map.set(key, value + 1);
            }
        }
    });
    character.ai_price_belief_sell.forEach((value, key, map) => {
        if (value > 1) {
            let dice = Math.random();
            if (dice < 0.2) {
                map.set(key, value - 1);
            }
            if (dice > 0.8) {
                map.set(key, value + 1);
            }
        }
        else {
            let dice = Math.random();
            if (dice > 0.8) {
                map.set(key, value + 1);
            }
        }
    });
}
exports.update_price_beliefs = update_price_beliefs;
