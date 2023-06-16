"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update_price_beliefs = exports.roll_price_belief_sell_increase = exports.rest_outside = exports.rat_go_home = exports.urban_walk = exports.market_walk = exports.rat_walk = exports.random_walk = exports.buy_random = exports.buy_food = exports.sell_material = exports.sell_all_stash = exports.remove_orders = exports.sell_loot = exports.loot = void 0;
const action_types_1 = require("../action_types");
const action_manager_1 = require("../actions/action_manager");
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
        tmp += character.stash.get(tag);
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
function buy_food(character) {
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
        market_1.EventMarket.execute_sell_order(character, best_order.id, 1);
        return true;
    }
    return false;
}
exports.buy_food = buy_food;
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
            if (system_1.MapSystem.can_move(tmp) && constraints(cell)) {
                possible_moves.push(tmp);
            }
        }
    }
    if (possible_moves.length > 0) {
        let move_direction = possible_moves[Math.floor(Math.random() * possible_moves.length)];
        action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.MOVE, char, move_direction);
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
    action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.MOVE, character, [target.x, target.y]);
}
exports.rat_walk = rat_walk;
function market_walk(character) {
    let cell_ids = data_1.Data.World.neighbours(character.cell_id);
    let potential_moves = cell_ids.map((x) => {
        let cell = data_1.Data.Cells.from_id(x);
        return { item: cell, weight: cell.market_scent };
    });
    let target = (0, basic_functions_1.select_max)(potential_moves, constraints_1.simple_constraints);
    action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.MOVE, character, [target?.x, target?.y]);
}
exports.market_walk = market_walk;
function urban_walk(character) {
    random_walk(character, constraints_1.urban_constraints);
}
exports.urban_walk = urban_walk;
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
            action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.MOVE, character, [target.x, target.y]);
        }
}
exports.rat_go_home = rat_go_home;
function rest_outside(character) {
    action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.REST, character, [0, 0]);
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
            // console.log(`i think i can sell ${materials.index_to_material(order.tag).string_tag} for ${order.tag, character.ai_price_belief_sell.get(order.tag)}`)
        }
        if (order.typ == "sell") {
            let belief = character.ai_price_belief_buy.get(order.tag);
            if (belief == undefined) {
                character.ai_price_belief_buy.set(order.tag, order.price);
            }
            else {
                character.ai_price_belief_buy.set(order.tag, Math.round(order.price / 10 + belief * 9 / 10));
            }
            // console.log(`i think i can buy ${materials.index_to_material(order.tag).string_tag} for ${order.tag, character.ai_price_belief_buy.get(order.tag)}`)
        }
    }
    //adding a bit of healthy noise
    character.ai_price_belief_buy.forEach((value, key, map) => {
        if (value > 1) {
            let dice = Math.random();
            if (dice < 0.1) {
                map.set(key, value - 1);
            }
            if (dice > 0.9) {
                map.set(key, value + 1);
            }
        }
        else {
            let dice = Math.random();
            if (dice > 0.9) {
                map.set(key, value + 1);
            }
        }
    });
    character.ai_price_belief_sell.forEach((value, key, map) => {
        if (value > 1) {
            let dice = Math.random();
            if (dice < 0.1) {
                map.set(key, value - 1);
            }
            if (dice > 0.9) {
                map.set(key, value + 1);
            }
        }
        else {
            let dice = Math.random();
            if (dice > 0.9) {
                map.set(key, value + 1);
            }
        }
    });
}
exports.update_price_beliefs = update_price_beliefs;
