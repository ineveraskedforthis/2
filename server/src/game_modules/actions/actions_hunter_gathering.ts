import { MATERIAL, SKILL } from "@content/content";
import { cell_id } from "@custom_types/ids";
import { Data } from "../data/data_objects";
import { Character, TriggerResponse } from "../data/entities/character";
import { CHANGE_REASON, Effect } from "../effects/effects";
import { Event } from "../events/events";
import { CharacterValues } from "../scripted-values/character";
import { generate_action } from "./generator";
import { basic_duration_modifier, dummy_effect } from "./generic_functions";
const FATIGUE_COST_WOOD = 5
const FATIGUE_COST_COTTON = 1
const FATIGUE_COST_HUNT = 5
const FATIGUE_COST_FISH = 3
const FATIGUE_COST_BERRIES = 10

function gather_wood_duration_modifier(character: Character) {
    const slice_damage = CharacterValues.melee_damage_raw(character, 'slice')
    const skill = CharacterValues.skill(character, SKILL.WOODCUTTING)
    const damage_mod = (1 + slice_damage.slice / 50)
    return 10 / CharacterValues.phys_power(character) / damage_mod * (150 - skill) / 100
}

function hunt_duration_modifier(character: Character) {
    const skill = CharacterValues.skill(character, SKILL.HUNTING)
    return (150 - skill) / 100;
}

function fishing_duration_modifier(char: Character) {
    const skill = CharacterValues.skill(char, SKILL.FISHING)
    return (150 - skill) / 100;
}

function berry_duration_modifier(char: Character) {
    const skill = CharacterValues.skill(char, SKILL.GATHERING)
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
        return { response: "Notification:", value: "There is no more prey in the location. Check other locations in map window."}
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
function berry_trigger(character: Character) : TriggerResponse {
    const data = Data.Locations.from_id(character.location_id)
    if (data.berries > 0) {
        return { response: "OK" }
    } else {
        return { response: "Notification:", value: "There are no berries in the location. Check other locations in map window."}
    }
}

function roll_gathering_skill_increase(character : Character, skill_id: SKILL) {
    const skill = CharacterValues.skill(character, skill_id)
    if (Math.random() * Math.random() > skill / 100) {
        Effect.Change.skill(character, skill_id, 1, CHANGE_REASON.PRACTICE)
        Effect.Change.stress(character, 1, CHANGE_REASON.PRACTICE)
    }
}

function gather_wood_effect(character: Character) {
    const skill = CharacterValues.pure_skill(character, SKILL.WOODCUTTING)

    Event.remove_tree(character.location_id)
    Event.change_stash(character, MATERIAL.WOOD_RED, Math.floor(skill / 20))

    roll_gathering_skill_increase(character, SKILL.WOODCUTTING)
}

function gather_cotton_effect(character: Character) {
    const skill = CharacterValues.pure_skill(character, SKILL.GATHERING)

    Data.Locations.from_id(character.location_id).cotton -= 1
    Event.change_stash(character, MATERIAL.COTTON, Math.floor(Math.sqrt(skill / 5)))

    roll_gathering_skill_increase(character, SKILL.GATHERING)
}

function gather_berries_effect(character: Character) {
    const skill = CharacterValues.pure_skill(character, SKILL.GATHERING)

    const amount = Math.floor(skill / 10 + Math.random() * 5)

    Data.Locations.from_id(character.location_id).berries -= 1

    if (Math.random() < 0.2) {
        Event.change_stash(character, MATERIAL.BERRY_ZAZ, amount)
    }

    roll_gathering_skill_increase(character, SKILL.GATHERING)
    Event.change_stash(character, MATERIAL.BERRY_FIE, amount)
}

function hunt_skill_upgrade_roll(character: Character) {
    const skill = CharacterValues.pure_skill(character, SKILL.HUNTING)
    const skinning_skill = CharacterValues.pure_skill(character, SKILL.SKINNING)
    if (Math.random() * Math.random() > skill / 100) {
        Effect.Change.skill(character, SKILL.HUNTING, 1, CHANGE_REASON.HUNTING)
        Effect.Change.stress(character, 1, CHANGE_REASON.HUNTING)
    }
    if (Math.random() > skinning_skill / 20) {
        Effect.Change.skill(character, SKILL.SKINNING, 1, CHANGE_REASON.HUNTING)
    }
}
function hunt_effect(character: Character) {
    const skill = CharacterValues.skill(character, SKILL.HUNTING)
    const skinning_skill = CharacterValues.skill(character, SKILL.SKINNING)

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
    const skill = CharacterValues.skill(character, SKILL.FISHING)

    let amount = Math.floor(skill / 20) + 1
    if (Math.random() < 0.01) {
        amount += 10
    }
    if (Math.random() < 0.0001) {
        amount += 100
    }

    if (Math.random() * Math.random() > skill / 100) {
        Effect.Change.skill(character, SKILL.FISHING, 1, CHANGE_REASON.FISHING)
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

export const berries = generate_action(
    FATIGUE_COST_BERRIES,
    berry_duration_modifier,
    berry_trigger,
    gather_berries_effect,
    dummy_effect,
    CHANGE_REASON.GATHERING
)
