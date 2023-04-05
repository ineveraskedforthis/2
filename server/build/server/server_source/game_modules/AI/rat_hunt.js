"use strict";
// This file is an attempt to make a simple instruction for agents
Object.defineProperty(exports, "__esModule", { value: true });
exports.RatHunter = void 0;
const action_manager_1 = require("../actions/action_manager");
const action_types_1 = require("../action_types");
const events_1 = require("../events/events");
const market_1 = require("../events/market");
const materials_manager_1 = require("../manager_classes/materials_manager");
const systems_communication_1 = require("../systems_communication");
const ai_manager_1 = require("./ai_manager");
const helpers_1 = require("./helpers");
const constraints_1 = require("./constraints");
function tired(character) {
    return (character.get_fatigue() > 70) || (character.get_stress() > 30);
}
function low_hp(character) {
    return character.get_hp() < 0.5 * character.get_max_hp();
}
const LOOT = [materials_manager_1.MEAT, materials_manager_1.RAT_SKIN, materials_manager_1.RAT_BONE];
function loot(character) {
    let tmp = 0;
    for (let tag of LOOT) {
        tmp += character.stash.get(tag);
    }
    return tmp;
}
function sell_loot(character) {
    for (let tag of LOOT) {
        market_1.EventMarket.sell(character, tag, character.stash.get(tag), (0, helpers_1.base_price)(character, tag) - 1);
    }
}
function RatHunter(character) {
    if (character.in_battle())
        return;
    if (character.action != undefined)
        return;
    if (character.is_player())
        return;
    if (tired(character)) {
        action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.REST, character, [0, 0]);
        console.log('resting');
        return;
    }
    if (character.ai_state == 1 /* AIstate.WaitSale */) {
        console.log('waiting for someone to buy my loot');
        return;
    }
    if (loot(character) > 10) {
        let cell = systems_communication_1.Convert.character_to_cell(character);
        if (cell.is_market()) {
            console.log('selling loot');
            sell_loot(character);
            character.ai_state = 1 /* AIstate.WaitSale */;
        }
        else {
            console.log('walking toward market');
            ai_manager_1.CampaignAI.market_walk(character);
        }
        return;
    }
    if ((character.stash.get(materials_manager_1.FOOD) > 0) && low_hp(character)) {
        console.log('low hp -> eating');
        action_manager_1.ActionManager.start_action(action_types_1.CharacterAction.EAT, character, [0, 0]);
        return;
    }
    // finding rats if nothing else is needed
    let target = helpers_1.AIhelper.free_rats_in_cell(character);
    const target_char = systems_communication_1.Convert.id_to_character(target);
    if (target_char != undefined) {
        console.log('found a rat, starting a fight');
        events_1.Event.start_battle(character, target_char);
    }
    else {
        console.log('looking for rats');
        ai_manager_1.CampaignAI.random_walk(character, constraints_1.simple_constraints);
    }
}
exports.RatHunter = RatHunter;
