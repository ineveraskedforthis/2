"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rat_go_home = exports.market_walk = exports.rat_walk = exports.random_walk = exports.buy_food = exports.sell_loot = exports.loot = void 0;
const action_types_1 = require("../action_types");
const action_manager_1 = require("../actions/action_manager");
const basic_functions_1 = require("../calculations/basic_functions");
const market_1 = require("../events/market");
const materials_manager_1 = require("../manager_classes/materials_manager");
const system_1 = require("../map/system");
const systems_communication_1 = require("../systems_communication");
const AI_CONSTANTS_1 = require("./AI_CONSTANTS");
const constraints_1 = require("./constraints");
const helpers_1 = require("./helpers");
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
        market_1.EventMarket.sell(character, tag, character.stash.get(tag), (0, helpers_1.base_price)(character, tag) - 1);
    }
}
exports.sell_loot = sell_loot;
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
