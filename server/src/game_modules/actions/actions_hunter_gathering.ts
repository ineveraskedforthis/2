import { Character } from "../character/character";
import { CHANGE_REASON, Effect } from "../events/effects";
import { Event } from "../events/events";
import { cell_id } from "@custom_types/ids";
import { generate_action } from "./generator";
import { CharacterSystem } from "../character/system";
import { TriggerResponse } from "./types";
import { basic_duration_modifier, dummy_effect } from "./generic_functions";
import { Data } from "../data/data_objects";
import { MATERIAL } from "@content/content";
const FATIGUE_COST_WOOD = 5
const FATIGUE_COST_COTTON = 1
const FATIGUE_COST_HUNT = 5
const FATIGUE_COST_FISH = 3

function gather_wood_duration_modifier(character: Character) {
    const slice_damage = CharacterSystem.melee_damage_raw(character, 'slice')
    const damage_mod = (1 + slice_damage.slice / 50)
    return 10 / CharacterSystem.phys_power(character) / damage_mod
}

function hunt_duration_modifier(character: Character) {
    const skill = CharacterSystem.skill(character, 'hunt')
    return (150 - skill) / 100;
}

function fishing_duration_modifier(char: Character) {
    const skill = CharacterSystem.skill(char, 'fishing')
    return (150 - skill) / 100;
}

function gather_wood_trigger(character: Character): TriggerResponse {
    const data = Data.Locations.from_id(character.location_id)
    if (data.forest > 0) {
        return { response: "OK" }
    } else {
        return { response: "Notification:", value: "There is no more trees in the location. Check other locations in map window."}
    }
}
function gather_cotton_trigger(character: Character): TriggerResponse {
    const data = Data.Locations.from_id(character.location_id)
    if (data.cotton > 0) {
        return { response: "OK" }
    } else {
        return { response: "Notification:", value: "There is no more cotton in the location. Check other locations in map window."}
    }
}
function hunt_trigger(character: Character) : TriggerResponse {
    const data = Data.Locations.from_id(character.location_id)
    if (data.small_game > 0) {
        return { response: "OK" }
    } else {
        return { response: "Notification:", value: "There is no more game in the location. Check other locations in map window."}
    }
}
function fishing_trigger(character: Character) : TriggerResponse {
    const data = Data.Locations.from_id(character.location_id)
    if (data.fish > 0) {
        return { response: "OK" }
    } else {
        return { response: "Notification:", value: "There is no more fish in the location. Check other locations in map window."}
    }
}

function gather_wood_effect(character: Character) {
    Event.remove_tree(character.location_id)
    Event.change_stash(character, MATERIAL.WOOD_RED, 1)
}

function gather_cotton_effect(character: Character) {
    Data.Locations.from_id(character.location_id).cotton -= 1
    Event.change_stash(character, MATERIAL.COTTON, 1)
}

function hunt_skill_upgrade_roll(character: Character) {
    const skill = CharacterSystem.pure_skill(character, 'hunt')
    const skinning_skill = CharacterSystem.pure_skill(character, 'skinning')
    if (Math.random() * Math.random() > skill / 100) {
        Effect.Change.skill(character, 'hunt', 1, CHANGE_REASON.HUNTING)
        Effect.Change.stress(character, 1, CHANGE_REASON.HUNTING)
    }
    if (Math.random() > skinning_skill / 20) {
        Effect.Change.skill(character, 'skinning', 1, CHANGE_REASON.HUNTING)
    }
}
function hunt_effect(character: Character) {
    const skill = CharacterSystem.skill(character, 'hunt')
    const skinning_skill = CharacterSystem.skill(character, 'skinning')

    let amount_meat = Math.floor(skill / 10) + 1
    let amount_skin = Math.floor(Math.max(amount_meat * skinning_skill / 100))
    if (Math.random() < 0.1) {
        amount_meat += 10
        amount_skin += 1
    }
    hunt_skill_upgrade_roll(character)

    Data.Locations.from_id(character.location_id).small_game -= 1
    Event.change_stash(character, MATERIAL.MEAT_RAT, amount_meat)
    Event.change_stash(character, MATERIAL.SKIN_RAT, amount_skin)
}

function fishing_effect(character: Character, cell: cell_id) {
    const skill = CharacterSystem.skill(character, 'fishing')

    let amount = Math.floor(skill / 20) + 1
    if (Math.random() < 0.01) {
        amount += 10
    }
    if (Math.random() < 0.0001) {
        amount += 100
    }

    if (Math.random() * Math.random() > skill / 100) {
        Effect.Change.skill(character, 'fishing', 1, CHANGE_REASON.FISHING)
        Effect.Change.stress(character, 1, CHANGE_REASON.FISHING)
    }

    Data.Locations.from_id(character.location_id).fish -= 1
    Event.change_stash(character, MATERIAL.FISH_OKU, amount)
}

export const gather_wood = generate_action(
    FATIGUE_COST_WOOD,
    gather_wood_duration_modifier,
    gather_wood_trigger,
    gather_wood_effect,
    dummy_effect,
    CHANGE_REASON.WOODCUTTING
)

export const gather_cotton = generate_action(
    FATIGUE_COST_COTTON,
    basic_duration_modifier,
    gather_cotton_trigger,
    gather_cotton_effect,
    dummy_effect,
    CHANGE_REASON.GATHERING
)

export const hunt = generate_action(
    FATIGUE_COST_HUNT,
    hunt_duration_modifier,
    hunt_trigger,
    hunt_effect,
    dummy_effect,
    CHANGE_REASON.HUNTING
)

export const fish = generate_action(
    FATIGUE_COST_FISH,
    fishing_duration_modifier,
    fishing_trigger,
    fishing_effect,
    dummy_effect,
    CHANGE_REASON.FISHING
)