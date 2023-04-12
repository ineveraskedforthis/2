"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update_price_beliefs = exports.rest_outside = exports.rest_building = exports.rat_go_home = exports.urban_walk = exports.market_walk = exports.rat_walk = exports.random_walk = exports.buy_random = exports.buy_food = exports.sell_all_stash = exports.sell_loot = exports.loot = void 0;
const action_types_1 = require("../action_types");
const action_manager_1 = require("../actions/action_manager");
const basic_functions_1 = require("../calculations/basic_functions");
const data_1 = require("../data");
const effects_1 = require("../events/effects");
const market_1 = require("../events/market");
const scripted_values_1 = require("../events/scripted_values");
const materials_manager_1 = require("../manager_classes/materials_manager");
const system_1 = require("../map/system");
const systems_communication_1 = require("../systems_communication");
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
        market_1.EventMarket.sell(character, tag, character.stash.get(tag), AI_SCRIPTED_VALUES_1.AItrade.sell_price_bulk(character, tag) - 1);
    }
}
exports.sell_loot = sell_loot;
function sell_all_stash(character) {
    for (let tag of materials_manager_1.materials.get_materials_list()) {
        market_1.EventMarket.sell(character, tag, character.stash.get(tag), AI_SCRIPTED_VALUES_1.AItrade.sell_price_bulk(character, tag));
    }
}
exports.sell_all_stash = sell_all_stash;
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
        market_1.EventMarket.execute_sell_order(character, best_order?.id, 1);
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
        // let territory = this.world.get_territory(tmp[0], tmp[1])
        let target = system_1.MapSystem.coordinate_to_cell(tmp);
        if (target != undefined) {
            if (system_1.MapSystem.can_move(tmp) && constraints(target)) {
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
    let cell = systems_communication_1.Convert.character_to_cell(character);
    let potential_moves = system_1.MapSystem.neighbours_cells(cell.id).map((x) => { return { item: x, weight: (0, basic_functions_1.trim)(x.rat_scent, 0, 20) }; });
    let target = (0, basic_functions_1.select_weighted)(potential_moves, constraints);
    action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.MOVE, character, [target.x, target.y]);
}
exports.rat_walk = rat_walk;
function market_walk(character) {
    let cell = systems_communication_1.Convert.character_to_cell(character);
    let potential_moves = system_1.MapSystem.neighbours_cells(cell.id).map((x) => {
        return { item: x, weight: x.market_scent };
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
    let potential_moves = system_1.MapSystem.neighbours_cells(cell.id).map((x) => { return { item: x, weight: x.rat_scent }; });
    let target = (0, basic_functions_1.select_max)(potential_moves, constraints);
    if (target != undefined)
        if (cell.rat_scent > target.rat_scent) {
            action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.REST, character, [cell.x, cell.y]);
        }
        else {
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
        let fatigue_target = scripted_values_1.ScriptedValue.rest_target_fatigue(building.tier, building.durability, character.race());
        let fatigue_change = character.get_fatigue() - fatigue_target;
        let utility = fatigue_change * fatigue_utility - price * money_utility;
        if ((utility > best_utility) && (price < budget)) {
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
                character.ai_price_belief_sell.set(order.tag, order.price / 10 + belief * 9 / 10);
            }
            // console.log(`i think i can sell ${materials.index_to_material(order.tag).string_tag} for ${order.tag, character.ai_price_belief_sell.get(order.tag)}`)
        }
        if (order.typ == "sell") {
            let belief = character.ai_price_belief_buy.get(order.tag);
            if (belief == undefined) {
                character.ai_price_belief_buy.set(order.tag, order.price);
            }
            else {
                character.ai_price_belief_buy.set(order.tag, order.price / 10 + belief * 9 / 10);
            }
            // console.log(`i think i can buy ${materials.index_to_material(order.tag).string_tag} for ${order.tag, character.ai_price_belief_buy.get(order.tag)}`)
        }
    }
}
exports.update_price_beliefs = update_price_beliefs;
