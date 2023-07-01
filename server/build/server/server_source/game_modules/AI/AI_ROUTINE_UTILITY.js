"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rat_hunter_decision = void 0;
const actions_00_1 = require("../actions/actions_00");
const manager_1 = require("../actions/manager");
const materials_manager_1 = require("../manager_classes/materials_manager");
const AI_ROUTINE_RAT_HUNT_1 = require("./AI_ROUTINE_RAT_HUNT");
const actions_1 = require("./actions");
function has_memory(character, memory) {
    return character.ai_memories.indexOf(memory) >= 0;
}
function rest_utility(character) {
    if (has_memory(character, "rested" /* AImemory.RESTED */))
        return 0;
    return (character.get_stress() + character.get_fatigue()) / 200;
}
function eat_utility(character) {
    // if (has_memory(character, AImemory.NO_FOOD)) return 0
    if (character.stash.get(materials_manager_1.FOOD) < 1)
        return 0;
    return 1 - character.get_hp() / character.get_max_hp();
}
function rat_hunt_utility(character) {
    if (character.ai_map == 'rat_hunter') {
        return 0.4;
    }
    return 0;
}
function sell_loot_utility(character) {
    return (0, actions_1.loot)(character) / 20;
}
function buy_stuff_utility(character) {
    if (has_memory(character, "no_money" /* AImemory.NO_MONEY */))
        return 0;
    if (character.savings.get() < 100)
        return 0;
    const required_food = 30;
    const required_arrows = 50;
    const current_food = character.stash.get(materials_manager_1.FOOD);
    const current_arrows = character.stash.get(materials_manager_1.ARROW_BONE);
    return Math.max((required_arrows - current_arrows) / required_arrows, (current_food - required_food) / required_food);
}
function rat_hunter_decision(character) {
    let rest = rest_utility(character);
    let eat = eat_utility(character);
    let rat_hunt = rat_hunt_utility(character);
    let sell_loot = sell_loot_utility(character);
    let buy_stuff = buy_stuff_utility(character);
    let max = Math.max(...[rest, eat, rat_hunt, sell_loot, buy_stuff]);
    // console.log([rest, eat, rat_hunt, sell_loot, buy_stuff])
    if (rest == max) {
        (0, AI_ROUTINE_RAT_HUNT_1.rest_at_home)(character);
        return;
    }
    if (eat == max) {
        manager_1.ActionManager.start_action(actions_00_1.CharacterAction.EAT, character, character.cell_id);
        return;
    }
    if (rat_hunt == max) {
        (0, AI_ROUTINE_RAT_HUNT_1.rat_patrol)(character);
        return;
    }
    if (sell_loot == max) {
        (0, AI_ROUTINE_RAT_HUNT_1.sell_at_market)(character);
        return;
    }
    if (buy_stuff == max) {
        (0, AI_ROUTINE_RAT_HUNT_1.buy_food_arrows)(character);
        return;
    }
}
exports.rat_hunter_decision = rat_hunter_decision;
