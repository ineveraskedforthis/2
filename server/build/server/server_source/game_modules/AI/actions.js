"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update_price_beliefs = exports.roll_price_belief_sell_increase = exports.rest_outside = exports.rest_building = exports.rat_go_home = exports.urban_walk = exports.market_walk = exports.rat_walk = exports.random_walk = exports.buy_random = exports.buy_food = exports.sell_material = exports.sell_all_stash = exports.remove_orders = exports.sell_loot = exports.loot = void 0;
const DATA_LAYOUT_BUILDING_1 = require("../DATA_LAYOUT_BUILDING");
const action_types_1 = require("../action_types");
const action_manager_1 = require("../actions/action_manager");
const basic_functions_1 = require("../calculations/basic_functions");
const data_1 = require("../data");
const effects_1 = require("../events/effects");
const market_1 = require("../events/market");
const scripted_values_1 = require("../events/scripted_values");
const materials_manager_1 = require("../manager_classes/materials_manager");
// import { Cell } from "../map/cell";
const system_1 = require("../map/system");
const systems_communication_1 = require("../systems_communication");
// import { money } from "../types";
const AI_CONSTANTS_1 = require("./AI_CONSTANTS");
const AI_SCRIPTED_VALUES_1 = require("./AI_SCRIPTED_VALUES");
const constraints_1 = require("./constraints");
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
            rest_building(character, character.savings.get());
            // ActionManager.start_action(CharacterAction.REST, character, [cell.x, cell.y])
        }
        else {
            // console.log('keep moving')
            action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.MOVE, character, [target.x, target.y]);
        }
}
exports.rat_go_home = rat_go_home;
function rest_building(character, budget) {
    let cell = character.cell_id;
    let buildings = data_1.Data.Buildings.from_cell_id(cell);
    if (buildings == undefined)
        return false;
    let fatigue_utility = 1;
    let money_utility = 10;
    let best_utility = 0;
    let target = undefined;
    for (let item of buildings) {
        let price = scripted_values_1.ScriptedValue.room_price(item, character.id);
        let building = data_1.Data.Buildings.from_id(item);
        let tier = scripted_values_1.ScriptedValue.building_rest_tier(building.type, character);
        let fatigue_target = scripted_values_1.ScriptedValue.rest_target_fatigue(tier, building.durability, character.race());
        let fatigue_change = character.get_fatigue() - fatigue_target;
        let utility = fatigue_change * fatigue_utility - price * money_utility;
        if ((utility > best_utility) && (price <= budget) && (data_1.Data.Buildings.occupied_rooms(item) < (0, DATA_LAYOUT_BUILDING_1.rooms)(building.type))) {
            target = item;
            best_utility = utility;
        }
    }
    if (target == undefined)
        return false;
    effects_1.Effect.rent_room(character.id, target);
    return true;
}
exports.rest_building = rest_building;
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
