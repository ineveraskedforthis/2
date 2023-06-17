"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fish = exports.hunt = exports.gather_cotton = exports.gather_wood = void 0;
const effects_1 = require("../events/effects");
const events_1 = require("../events/events");
const materials_manager_1 = require("../manager_classes/materials_manager");
const systems_communication_1 = require("../systems_communication");
const data_1 = require("../data");
const generator_1 = require("./generator");
const system_1 = require("../character/system");
const generic_functions_1 = require("./generic_functions");
const FATIGUE_COST_WOOD = 5;
const FATIGUE_COST_COTTON = 1;
const FATIGUE_COST_HUNT = 5;
const FATIGUE_COST_FISH = 3;
function gather_wood_duration_modifier(character) {
    const slice_damage = system_1.CharacterSystem.melee_damage_raw(character, 'slice');
    const damage_mod = (1 + slice_damage.slice / 50);
    return 10 / system_1.CharacterSystem.phys_power(character) / damage_mod;
}
function hunt_duration_modifier(character) {
    const skill = system_1.CharacterSystem.skill(character, 'hunt');
    return (150 - skill) / 100;
}
function fishing_duration_modifier(char) {
    const skill = system_1.CharacterSystem.skill(char, 'fishing');
    return (150 - skill) / 100;
}
function gather_wood_trigger(character, cell) {
    // console.log('gather_wood_trigger')
    if (data_1.Data.Cells.has_forest(cell)) {
        return { response: "OK" };
    }
    else {
        return { response: "NO_RESOURCE" };
    }
}
function gather_cotton_trigger(character, cell) {
    if (data_1.Data.Cells.has_cotton(cell)) {
        return { response: "OK" };
    }
    else {
        return { response: "NO_RESOURCE" };
    }
}
function hunt_trigger(character, cell) {
    if (data_1.Data.Cells.has_game(cell)) {
        return { response: "OK" };
    }
    else {
        return { response: "NO_RESOURCE" };
    }
}
function fishing_trigger(character, cell) {
    if (data_1.Data.Cells.has_fish(cell)) {
        return { response: "OK" };
    }
    else {
        return { response: "NO_RESOURCE" };
    }
}
function gather_wood_effect(character, cell) {
    // console.log('gather_wood_effect')
    events_1.Event.remove_tree(cell);
    events_1.Event.change_stash(character, materials_manager_1.WOOD, 1);
}
function gather_cotton_effect(character, cell) {
    const cell_obj = systems_communication_1.Convert.character_to_cell(character);
    cell_obj.cotton -= 1;
    events_1.Event.change_stash(character, materials_manager_1.COTTON, 1);
}
function hunt_skill_upgrade_roll(character) {
    const skill = system_1.CharacterSystem.pure_skill(character, 'hunt');
    const skinning_skill = system_1.CharacterSystem.pure_skill(character, 'skinning');
    if (Math.random() * Math.random() > skill / 100) {
        effects_1.Effect.Change.skill(character, 'hunt', 1);
        effects_1.Effect.Change.stress(character, 1);
    }
    if (Math.random() > skinning_skill / 20) {
        effects_1.Effect.Change.skill(character, 'skinning', 1);
    }
}
function hunt_effect(character, cell) {
    const skill = system_1.CharacterSystem.skill(character, 'hunt');
    const skinning_skill = system_1.CharacterSystem.skill(character, 'skinning');
    let amount_meat = Math.floor(skill / 10) + 1;
    let amount_skin = Math.floor(Math.max(amount_meat * skinning_skill / 100));
    if (Math.random() < 0.1) {
        amount_meat += 10;
        amount_skin += 1;
    }
    hunt_skill_upgrade_roll(character);
    const cell_obj = data_1.Data.Cells.from_id(cell);
    cell_obj.game -= 1;
    events_1.Event.change_stash(character, materials_manager_1.MEAT, amount_meat);
    events_1.Event.change_stash(character, materials_manager_1.RAT_SKIN, amount_skin);
}
function fishing_effect(character, cell) {
    const skill = system_1.CharacterSystem.skill(character, 'fishing');
    let amount = Math.floor(skill / 20) + 1;
    if (Math.random() < 0.01) {
        amount += 10;
    }
    if (Math.random() < 0.0001) {
        amount += 100;
    }
    if (Math.random() * Math.random() > skill / 100) {
        effects_1.Effect.Change.skill(character, 'fishing', 1);
        effects_1.Effect.Change.stress(character, 1);
    }
    const cell_obj = data_1.Data.Cells.from_id(cell);
    cell_obj.fish -= 1;
    events_1.Event.change_stash(character, materials_manager_1.FISH, amount);
}
exports.gather_wood = (0, generator_1.generate_action)(FATIGUE_COST_WOOD, gather_wood_duration_modifier, gather_wood_trigger, gather_wood_effect, generic_functions_1.dummy_effect);
exports.gather_cotton = (0, generator_1.generate_action)(FATIGUE_COST_COTTON, generic_functions_1.basic_duration_modifier, gather_cotton_trigger, gather_cotton_effect, generic_functions_1.dummy_effect);
exports.hunt = (0, generator_1.generate_action)(FATIGUE_COST_HUNT, hunt_duration_modifier, hunt_trigger, hunt_effect, generic_functions_1.dummy_effect);
exports.fish = (0, generator_1.generate_action)(FATIGUE_COST_FISH, fishing_duration_modifier, fishing_trigger, fishing_effect, generic_functions_1.dummy_effect);
