import { Character } from "../character/character";
import { Effect } from "../events/effects";
import { Event } from "../events/events";
import { WOOD, COTTON, MEAT, RAT_SKIN, FISH } from "../manager_classes/materials_manager";
import { Convert } from "../systems_communication";
import { Data } from "../data";
import { cell_id } from "@custom_types/common";
import { generate_action } from "./generator";
import { CharacterSystem } from "../character/system";
import { TriggerResponse } from "./types";
import { basic_duration_modifier, dummy_effect } from "./generic_functions";
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

function gather_wood_trigger(character: Character, cell: cell_id): TriggerResponse {
    // console.log('gather_wood_trigger')
    if (Data.Cells.has_forest(cell)) {
        return { response: "OK" }
    } else {
        return { response: "NO_RESOURCE" }
    }
}
function gather_cotton_trigger(character: Character, cell: cell_id): TriggerResponse {
    if (Data.Cells.has_cotton(cell)) {
        return { response: "OK" }
    } else {
        return { response: "NO_RESOURCE" }
    }
}
function hunt_trigger(character: Character, cell: cell_id) : TriggerResponse {
    if (Data.Cells.has_game(cell)) {
        return { response: "OK" }
    } else {
        return { response: "NO_RESOURCE" }
    }
}
function fishing_trigger(character: Character, cell: cell_id) : TriggerResponse {
    if (Data.Cells.has_fish(cell)) {
        return { response: "OK" }
    } else {
        return { response: "NO_RESOURCE" }
    }
}

function gather_wood_effect(character: Character, cell: cell_id) {
    // console.log('gather_wood_effect')
    Event.remove_tree(cell)
    Event.change_stash(character, WOOD, 1)
}
function gather_cotton_effect(character: Character, cell: cell_id) {
    const cell_obj = Convert.character_to_cell(character)
    cell_obj.cotton -= 1
    Event.change_stash(character, COTTON, 1)
}
function hunt_skill_upgrade_roll(character: Character) {
    const skill = CharacterSystem.pure_skill(character, 'hunt')
    const skinning_skill = CharacterSystem.pure_skill(character, 'skinning')
    if (Math.random() * Math.random() > skill / 100) {
        Effect.Change.skill(character, 'hunt', 1)
        Effect.Change.stress(character, 1)
    }
    if (Math.random() > skinning_skill / 20) {
        Effect.Change.skill(character, 'skinning', 1)
    }
}
function hunt_effect(character: Character, cell: cell_id) {
    const skill = CharacterSystem.skill(character, 'hunt')
    const skinning_skill = CharacterSystem.skill(character, 'skinning')
    
    let amount_meat = Math.floor(skill / 10) + 1
    let amount_skin = Math.max(amount_meat * skinning_skill / 100)
    if (Math.random() < 0.1) {
        amount_meat += 10
        amount_skin += 1
    }    
    hunt_skill_upgrade_roll(character)

    const cell_obj = Data.Cells.from_id(cell)
    cell_obj.game -= 1
    Event.change_stash(character, MEAT, amount_meat)
    Event.change_stash(character, RAT_SKIN, amount_skin)
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
        Effect.Change.skill(character, 'fishing', 1)
        Effect.Change.stress(character, 1)
    }

    const cell_obj = Data.Cells.from_id(cell)
    cell_obj.fish -= 1
    Event.change_stash(character, FISH, amount)
}

export const gather_wood = generate_action(
    FATIGUE_COST_WOOD, 
    gather_wood_duration_modifier,
    gather_wood_trigger,
    gather_wood_effect,
    dummy_effect)

export const gather_cotton = generate_action(
    FATIGUE_COST_COTTON,
    basic_duration_modifier,
    gather_cotton_trigger,
    gather_cotton_effect,
    dummy_effect
)

export const hunt = generate_action(
    FATIGUE_COST_HUNT,
    hunt_duration_modifier,
    hunt_trigger,
    hunt_effect,
    dummy_effect
)

export const fish = generate_action(
    FATIGUE_COST_FISH,
    fishing_duration_modifier,
    fishing_trigger,
    fishing_effect,
    dummy_effect
)