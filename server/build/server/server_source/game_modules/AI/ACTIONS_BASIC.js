"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update_price_beliefs = exports.roll_price_belief_sell_increase = exports.rest_outside = exports.rat_go_home = exports.coast_walk = exports.urban_walk = exports.home_walk = exports.rat_walk = exports.random_walk = exports.buy_random = exports.buy = exports.sell_material = exports.sell_all_stash = exports.remove_orders = exports.sell_loot = exports.loot = void 0;
const actions_00_1 = require("../actions/actions_00");
const manager_1 = require("../actions/manager");
const basic_functions_1 = require("../calculations/basic_functions");
const market_1 = require("../events/market");
const system_1 = require("../map/system");
const systems_communication_1 = require("../systems_communication");
const AI_CONSTANTS_1 = require("./AI_CONSTANTS");
const AI_SCRIPTED_VALUES_1 = require("./AI_SCRIPTED_VALUES");
const constraints_1 = require("./constraints");
const AI_ROUTINE_GENERIC_1 = require("./AI_ROUTINE_GENERIC");
const data_objects_1 = require("../data/data_objects");
const data_id_1 = require("../data/data_id");
const effects_1 = require("../events/effects");
const content_1 = require("@content/content");
const LOOT = [18 /* MATERIAL.MEAT_RAT */, 10 /* MATERIAL.SKIN_RAT */, 7 /* MATERIAL.BONE_RAT */, 4 /* MATERIAL.SMALL_BONE_RAT */, 26 /* MATERIAL.FISH_OKU */];
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
    for (let tag of content_1.MaterialConfiguration.MATERIAL) {
        market_1.EventMarket.sell(character, tag, character.stash.get(tag), AI_SCRIPTED_VALUES_1.AItrade.sell_price_bulk(character, tag));
    }
}
exports.sell_all_stash = sell_all_stash;
function sell_material(character, material) {
    let orders = data_id_1.DataID.Cells.market_order_id_list(character.cell_id);
    let best_order = undefined;
    let best_price = 0;
    for (let item of orders) {
        let order = data_objects_1.Data.MarketOrders.from_id(item);
        if (order.typ == 'sell')
            continue;
        if (order.material != material)
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
function buy(character, material) {
    let orders = data_id_1.DataID.Cells.market_order_id_list(character.cell_id);
    let best_order = undefined;
    let best_price = 9999;
    for (let item of orders) {
        let order = data_objects_1.Data.MarketOrders.from_id(item);
        if (order.typ == 'buy')
            continue;
        if (order.material != material)
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
    let orders = data_id_1.DataID.Cells.market_order_id_list(character.cell_id);
    let best_order = undefined;
    let best_price = 9999;
    for (let item of orders) {
        let order = data_objects_1.Data.MarketOrders.from_id(item);
        if (order.typ == 'buy')
            continue;
        const material = content_1.MaterialStorage.get(order.material);
        if (material.category != 8 /* MATERIAL_CATEGORY.FOOD */)
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
    //with high probability we will simply stay in our cell, while travelling from location to location:
    if (Math.random() < 0.8) {
        const location_id = (0, basic_functions_1.select_weighted_callback)(data_id_1.DataID.Cells.locations(cell.id), (item) => 1);
        effects_1.Effect.enter_location(char.id, location_id);
    }
    let possible_moves = [];
    for (let d of AI_CONSTANTS_1.dp) {
        let tmp = [d[0] + cell.x, d[1] + cell.y];
        let target_id = data_objects_1.Data.World.coordinate_to_id(tmp);
        let target_cell = data_objects_1.Data.Cells.from_id(target_id);
        if (target_cell != undefined) {
            if (system_1.MapSystem.can_move(tmp) && constraints(target_cell)) {
                possible_moves.push(tmp);
            }
        }
    }
    if (possible_moves.length > 0) {
        let move_direction = possible_moves[Math.floor(Math.random() * possible_moves.length)];
        manager_1.ActionManager.start_action(actions_00_1.CharacterAction.MOVE, char, data_objects_1.Data.World.coordinate_to_id(move_direction));
    }
}
exports.random_walk = random_walk;
function rat_walk(character, constraints) {
    //with high probability we will simply stay in our cell, while travelling from location to location:
    if (Math.random() < 0.8) {
        const location_id = (0, basic_functions_1.select_weighted_callback)(data_id_1.DataID.Cells.locations(character.cell_id), (item) => 1);
        effects_1.Effect.enter_location(character.id, location_id);
    }
    let cell_ids = data_objects_1.Data.World.neighbours(character.cell_id);
    let potential_moves = cell_ids.map((x) => {
        let cell = data_objects_1.Data.Cells.from_id(x);
        return { item: cell, weight: (0, basic_functions_1.trim)(cell.rat_scent, 0, 5) };
    });
    let target = (0, basic_functions_1.select_weighted)(potential_moves, constraints);
    manager_1.ActionManager.start_action(actions_00_1.CharacterAction.MOVE, character, target.id);
}
exports.rat_walk = rat_walk;
function home_walk(character) {
    if (character.home_location_id == undefined) {
        let cell_ids = data_objects_1.Data.World.neighbours(character.cell_id);
        let potential_moves = cell_ids.map((x) => {
            let cell = data_objects_1.Data.Cells.from_id(x);
            return { item: cell, weight: 1 };
        });
        let target = (0, basic_functions_1.select_max)(potential_moves, constraints_1.simple_constraints);
        manager_1.ActionManager.start_action(actions_00_1.CharacterAction.MOVE, character, target.id);
    }
    else {
        if (character.cell_id == data_id_1.DataID.Location.cell_id(character.home_location_id)) {
            effects_1.Effect.enter_location(character.id, character.home_location_id);
            return;
        }
        let next_cell = system_1.MapSystem.find_path(character.cell_id, data_id_1.DataID.Location.cell_id(character.home_location_id));
        if (next_cell != undefined) {
            manager_1.ActionManager.start_action(actions_00_1.CharacterAction.MOVE, character, next_cell);
        }
        else {
            console.log('character tries to move home to sell loot but can\'t');
            console.log(character.cell_id);
            console.log(data_id_1.DataID.Location.cell_id(character.home_location_id));
            console.log(character.home_location_id);
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
    let potential_moves = data_objects_1.Data.World.neighbours(character.cell_id).map((x) => { return data_objects_1.Data.Cells.from_id(x); }).map((x) => { return { item: x, weight: x.rat_scent }; });
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
    let orders = data_id_1.DataID.Cells.market_order_id_list(character.cell_id);
    // initialisation
    for (let material of content_1.MaterialConfiguration.MATERIAL) {
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
        let order = data_objects_1.Data.MarketOrders.from_id(item);
        if (order.typ == "buy") {
            let belief = character.ai_price_belief_sell.get(order.material);
            if (belief == undefined) {
                character.ai_price_belief_sell.set(order.material, order.price);
            }
            else {
                character.ai_price_belief_sell.set(order.material, Math.round(order.price / 10 + belief * 9 / 10));
            }
        }
        if (order.typ == "sell") {
            let belief = character.ai_price_belief_buy.get(order.material);
            if (belief == undefined) {
                character.ai_price_belief_buy.set(order.material, order.price);
            }
            else {
                character.ai_price_belief_buy.set(order.material, Math.round(order.price / 10 + belief * 9 / 10));
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
