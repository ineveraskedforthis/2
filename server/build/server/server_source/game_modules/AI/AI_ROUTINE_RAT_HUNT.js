"use strict";
// This file is an attempt to make a simple instruction for agents
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatHunterRoutine = void 0;
const manager_1 = require("../actions/manager");
const actions_00_1 = require("../actions/actions_00");
const materials_manager_1 = require("../manager_classes/materials_manager");
const systems_communication_1 = require("../systems_communication");
const helpers_1 = require("./helpers");
const constraints_1 = require("./constraints");
const triggers_1 = require("./triggers");
const actions_1 = require("./actions");
const system_1 = require("../map/system");
const AI_ROUTINE_GENERIC_1 = require("./AI_ROUTINE_GENERIC");
const system_2 = require("../battle/system");
const actions_hunter_gathering_1 = require("../actions/actions_hunter_gathering");
function fight(character) {
    // console.log(character.name, character.id, 'looking for a fight')
    let target = helpers_1.AIhelper.enemies_in_cell(character);
    const target_char = systems_communication_1.Convert.id_to_character(target);
    if (target_char != undefined) {
        system_2.BattleSystem.start_battle(character, target_char);
        return;
    }
}
function buy_stuff(character) {
    // console.log(character.name, character.id, 'buys stuff')
    if (!system_1.MapSystem.has_market(character.cell_id)) {
        (0, actions_1.market_walk)(character);
        return;
    }
    (0, actions_1.update_price_beliefs)(character);
    let flag_food = false;
    if ((character.stash.get(materials_manager_1.FOOD) < 30) && (character.savings.get() > 100)) {
        flag_food = (0, actions_1.buy)(character, materials_manager_1.FOOD);
    }
    let flag_arrow = false;
    if ((character.stash.get(materials_manager_1.ARROW_BONE) < 100) && (character.savings.get() > 100)) {
        flag_arrow = (0, actions_1.buy)(character, materials_manager_1.ARROW_BONE);
    }
    if (flag_food || flag_arrow) {
        return;
    }
    character.ai_state = "idle" /* AIstate.Idle */;
    character.ai_memories.push("was_on_market" /* AImemory.WAS_ON_MARKET */);
}
function rest_at_home(character) {
    // console.log(character.name, character.id, 'rests')
    if (character.ai_memories.indexOf("no_money" /* AImemory.NO_MONEY */) >= 0) {
        character.ai_state = "patrol" /* AIstate.Patrol */;
    }
    if (!(0, triggers_1.tired)(character)) {
        character.ai_state = "idle" /* AIstate.Idle */;
        return;
    }
    if (!system_1.MapSystem.has_market(character.cell_id)) {
        (0, actions_1.market_walk)(character);
        return;
    }
    else {
        (0, AI_ROUTINE_GENERIC_1.GenericRest)(character);
        return;
    }
}
function patrol(character) {
    // console.log(character.name, character.id, 'patrols')
    // console.log(character.ai_state)
    // console.log('loot:', loot(character))
    // console.log('tired:', tired(character))
    // console.log('low_hp:', low_hp(character))
    // console.log('memories:', character.ai_memories)
    let target = helpers_1.AIhelper.free_rats_in_cell(character);
    const target_char = systems_communication_1.Convert.id_to_character(target);
    if (target_char != undefined) {
        system_2.BattleSystem.start_battle(character, target_char);
    }
    else {
        manager_1.ActionManager.start_action(actions_hunter_gathering_1.hunt, character, character.cell_id);
        (0, actions_1.random_walk)(character, constraints_1.simple_constraints);
    }
    if ((0, actions_1.loot)(character) > 10) {
        // console.log('character goes to market now')
        character.ai_state = "go_to_market" /* AIstate.GoToMarket */;
        return;
    }
    if (character.ai_memories.indexOf("no_money" /* AImemory.NO_MONEY */) >= 0) {
        return;
    }
    if ((0, triggers_1.low_hp)(character)) {
        character.ai_state = "go_to_market" /* AIstate.GoToMarket */;
        return;
    }
    if ((0, triggers_1.tired)(character)) {
        character.ai_state = "go_to_rest" /* AIstate.GoToRest */;
        return;
    }
}
function sell_at_market(character) {
    // console.log(character.name, character.id, 'sells goods')
    if (system_1.MapSystem.has_market(character.cell_id)) {
        (0, actions_1.update_price_beliefs)(character);
        (0, actions_1.sell_loot)(character);
        character.ai_state = "wait_sale" /* AIstate.WaitSale */;
    }
    else {
        (0, actions_1.market_walk)(character);
    }
    return;
}
function waiting_sells(character) {
    {
        (0, actions_1.update_price_beliefs)(character);
        (0, actions_1.remove_orders)(character);
        (0, actions_1.sell_loot)(character);
    }
    if (character.trade_stash.is_empty()) {
        character.ai_state = "idle" /* AIstate.Idle */;
        return;
    }
}
function RatHunterRoutine(character) {
    if (character.in_battle())
        return;
    if (character.action != undefined)
        return;
    if (character.is_player())
        return;
    if (Math.random() < 0.1) {
        character.ai_memories.shift();
    }
    if ((character.stash.get(materials_manager_1.FOOD) > 0) && ((0, triggers_1.low_hp)(character) || character.get_stress() > 20)) {
        console.log(character.get_name(), " I AM EEEAATING FOOD");
        manager_1.ActionManager.start_action(actions_00_1.CharacterAction.EAT, character, character.cell_id);
    }
    fight(character);
    if (character.ai_state == "go_to_rest" /* AIstate.GoToRest */) {
        rest_at_home(character);
        return;
    }
    if (character.ai_state == "patrol" /* AIstate.Patrol */) {
        patrol(character);
        return;
    }
    if (character.ai_state == "go_to_market" /* AIstate.GoToMarket */) {
        sell_at_market(character);
        return;
    }
    if (character.ai_state == "wait_sale" /* AIstate.WaitSale */) {
        waiting_sells(character);
        return;
    }
    if ((character.ai_state == "idle" /* AIstate.Idle */) && (character.ai_memories.indexOf("was_on_market" /* AImemory.WAS_ON_MARKET */) < 0)) {
        buy_stuff(character);
        return;
    }
    else if (character.ai_state == "idle" /* AIstate.Idle */) {
        character.ai_state = "patrol" /* AIstate.Patrol */;
    }
    if ((0, triggers_1.tired)(character)) {
        character.ai_state = "go_to_rest" /* AIstate.GoToRest */;
    }
}
exports.RatHunterRoutine = RatHunterRoutine;
