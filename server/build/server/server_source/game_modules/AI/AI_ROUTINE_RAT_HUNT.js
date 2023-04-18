"use strict";
// This file is an attempt to make a simple instruction for agents
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatHunterRoutine = void 0;
const action_manager_1 = require("../actions/action_manager");
const action_types_1 = require("../action_types");
const events_1 = require("../events/events");
const materials_manager_1 = require("../manager_classes/materials_manager");
const systems_communication_1 = require("../systems_communication");
const helpers_1 = require("./helpers");
const constraints_1 = require("./constraints");
const triggers_1 = require("./triggers");
const actions_1 = require("./actions");
function RatHunterRoutine(character) {
    if (character.in_battle())
        return;
    if (character.action != undefined)
        return;
    if (character.is_player())
        return;
    if ((0, triggers_1.tired)(character)) {
        action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.REST, character, [0, 0]);
        return;
    }
    // character at market
    if (!character.trade_stash.is_empty()) {
        (0, actions_1.update_price_beliefs)(character);
        if (character.stash.get(materials_manager_1.FOOD) < 10) {
            (0, actions_1.buy_food)(character);
        }
        (0, actions_1.rest_building)(character, character.savings.get());
        if (Math.random() < 0.5) {
            (0, actions_1.remove_orders)(character);
            (0, actions_1.sell_loot)(character);
        }
        return;
    }
    if ((0, actions_1.loot)(character) > 10) {
        let cell = systems_communication_1.Convert.character_to_cell(character);
        if (cell.is_market()) {
            (0, actions_1.update_price_beliefs)(character);
            (0, actions_1.sell_loot)(character);
            character.ai_state = 1 /* AIstate.WaitSale */;
        }
        else {
            (0, actions_1.market_walk)(character);
        }
        return;
    }
    if ((character.stash.get(materials_manager_1.FOOD) > 0) && (0, triggers_1.low_hp)(character)) {
        action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.EAT, character, [0, 0]);
        return;
    }
    // finding rats if nothing else is needed
    let target = helpers_1.AIhelper.free_rats_in_cell(character);
    const target_char = systems_communication_1.Convert.id_to_character(target);
    if (target_char != undefined) {
        events_1.Event.start_battle(character, target_char);
    }
    else {
        (0, actions_1.random_walk)(character, constraints_1.simple_constraints);
    }
}
exports.RatHunterRoutine = RatHunterRoutine;
