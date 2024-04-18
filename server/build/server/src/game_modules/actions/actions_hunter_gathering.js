"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fish = exports.hunt = exports.gather_cotton = exports.gather_wood = void 0;
const effects_1 = require("../effects/effects");
const events_1 = require("../events/events");
const generator_1 = require("./generator");
const system_1 = require("../character/system");
const generic_functions_1 = require("./generic_functions");
const data_objects_1 = require("../data/data_objects");
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
function gather_wood_trigger(character) {
    const data = data_objects_1.Data.Locations.from_id(character.location_id);
    if (data.forest > 0) {
        return { response: "OK" };
    }
    else {
        return { response: "Notification:", value: "There is no more trees in the location. Check other locations in map window." };
    }
}
function gather_cotton_trigger(character) {
    const data = data_objects_1.Data.Locations.from_id(character.location_id);
    if (data.cotton > 0) {
        return { response: "OK" };
    }
    else {
        return { response: "Notification:", value: "There is no more cotton in the location. Check other locations in map window." };
    }
}
function hunt_trigger(character) {
    const data = data_objects_1.Data.Locations.from_id(character.location_id);
    if (data.small_game > 0) {
        return { response: "OK" };
    }
    else {
        return { response: "Notification:", value: "There is no more prey in the location. Check other locations in map window." };
    }
}
function fishing_trigger(character) {
    const data = data_objects_1.Data.Locations.from_id(character.location_id);
    if (data.fish > 0) {
        return { response: "OK" };
    }
    else {
        return { response: "Notification:", value: "There is no more fish in the location. Check other locations in map window." };
    }
}
function gather_wood_effect(character) {
    events_1.Event.remove_tree(character.location_id);
    events_1.Event.change_stash(character, 31 /* MATERIAL.WOOD_RED */, 1);
}
function gather_cotton_effect(character) {
    data_objects_1.Data.Locations.from_id(character.location_id).cotton -= 1;
    events_1.Event.change_stash(character, 2 /* MATERIAL.COTTON */, 1);
}
function hunt_skill_upgrade_roll(character) {
    const skill = system_1.CharacterSystem.pure_skill(character, 'hunt');
    const skinning_skill = system_1.CharacterSystem.pure_skill(character, 'skinning');
    if (Math.random() * Math.random() > skill / 100) {
        effects_1.Effect.Change.skill(character, 'hunt', 1, "Hunting" /* CHANGE_REASON.HUNTING */);
        effects_1.Effect.Change.stress(character, 1, "Hunting" /* CHANGE_REASON.HUNTING */);
    }
    if (Math.random() > skinning_skill / 20) {
        effects_1.Effect.Change.skill(character, 'skinning', 1, "Hunting" /* CHANGE_REASON.HUNTING */);
    }
}
function hunt_effect(character) {
    const skill = system_1.CharacterSystem.skill(character, 'hunt');
    const skinning_skill = system_1.CharacterSystem.skill(character, 'skinning');
    let amount_meat = Math.floor(skill / 10) + 1;
    let amount_skin = Math.floor(Math.max(amount_meat * skinning_skill / 100));
    if (Math.random() < 0.1) {
        amount_meat += 10;
        amount_skin += 1;
    }
    hunt_skill_upgrade_roll(character);
    data_objects_1.Data.Locations.from_id(character.location_id).small_game -= 1;
    events_1.Event.change_stash(character, 18 /* MATERIAL.MEAT_RAT */, amount_meat);
    events_1.Event.change_stash(character, 10 /* MATERIAL.SKIN_RAT */, amount_skin);
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
        effects_1.Effect.Change.skill(character, 'fishing', 1, "Fishing" /* CHANGE_REASON.FISHING */);
        effects_1.Effect.Change.stress(character, 1, "Fishing" /* CHANGE_REASON.FISHING */);
    }
    data_objects_1.Data.Locations.from_id(character.location_id).fish -= 1;
    events_1.Event.change_stash(character, 26 /* MATERIAL.FISH_OKU */, amount);
}
exports.gather_wood = (0, generator_1.generate_action)(FATIGUE_COST_WOOD, gather_wood_duration_modifier, gather_wood_trigger, gather_wood_effect, generic_functions_1.dummy_effect, "Woodcutting" /* CHANGE_REASON.WOODCUTTING */);
exports.gather_cotton = (0, generator_1.generate_action)(FATIGUE_COST_COTTON, generic_functions_1.basic_duration_modifier, gather_cotton_trigger, gather_cotton_effect, generic_functions_1.dummy_effect, "Gathering" /* CHANGE_REASON.GATHERING */);
exports.hunt = (0, generator_1.generate_action)(FATIGUE_COST_HUNT, hunt_duration_modifier, hunt_trigger, hunt_effect, generic_functions_1.dummy_effect, "Hunting" /* CHANGE_REASON.HUNTING */);
exports.fish = (0, generator_1.generate_action)(FATIGUE_COST_FISH, fishing_duration_modifier, fishing_trigger, fishing_effect, generic_functions_1.dummy_effect, "Fishing" /* CHANGE_REASON.FISHING */);
