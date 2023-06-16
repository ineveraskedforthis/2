import { money } from "@custom_types/common";
import { Character } from "../character/character";
import { Data } from "../data";
import { Event } from "../events/events";
import { ScriptedValue } from "../events/scripted_values";
import { Convert } from "../systems_communication";
import { random_walk, rest_outside } from "./actions";
import { forest_constraints, simple_constraints, steppe_constraints } from "./constraints";
import { AIhelper } from "./helpers";
import { tired } from "./triggers";
import { Effect } from "../events/effects";
import { rooms } from "../DATA_LAYOUT_BUILDING";

export function SteppeAgressiveRoutine(character: Character) {
    if (tired(character)) {
        rest_outside(character)
    } else {
        let target = AIhelper.enemies_in_cell(character);
        const target_char = Convert.id_to_character(target);
        if (target_char != undefined) {
            Event.start_battle(character, target_char);
        } else {
            random_walk(character, steppe_constraints);
        }
    }
}

export function SteppePassiveRoutine(character: Character) {
    if (tired(character)) {
        rest_outside(character)
    } else {
        random_walk(character, steppe_constraints);
    }
}

export function PassiveRoutine(character: Character) {
        if (tired(character)) {
        rest_outside(character)
    } else {
        random_walk(character, simple_constraints);
    }
}

export function ForestPassiveRoutine(character: Character) {
    if (tired(character)) {
        rest_outside(character)
    } else {
        random_walk(character, forest_constraints);
    }
}

function find_building_to_rest(character: Character, budget: money) {
    let cell = character.cell_id
    let buildings = Data.Buildings.from_cell_id(cell)
    if (buildings == undefined) return undefined
    let fatigue_utility = 1
    let money_utility = 10
    let best_utility = 0
    let target = undefined
    for (let item of buildings) {
        let price = ScriptedValue.room_price(item, character.id)
        let building = Data.Buildings.from_id(item)
        let tier = ScriptedValue.building_rest_tier(building.type, character)
        let fatigue_target = ScriptedValue.rest_target_fatigue(tier, building.durability, character.race())
        let fatigue_change = character.get_fatigue() - fatigue_target
        let utility = fatigue_change * fatigue_utility - price * money_utility
        if ((utility > best_utility) && (price <= budget) && (Data.Buildings.occupied_rooms(item) < rooms(building.type))) {
            target = item
            best_utility = utility
        }
    }
    return target
}

function rest_budget(character: Character) {
    let budget = character.savings.get()
    if (budget < 50) {
        budget = 0 as money
    }
    return (budget - 50) as money
}

export function GenericRest(character: Character) {
    if (character.action != undefined) return

    if (tired(character)) {
        if (character.current_building == undefined) {
            let building_to_rest = find_building_to_rest(character, rest_budget(character))
            if (building_to_rest == undefined) {
                rest_outside(character)
            } else {
                Effect.rent_room(character.id, building_to_rest)
            }
        } else {
            let building = Data.Buildings.from_id(character.current_building)
            let tier = ScriptedValue.building_rest_tier(building.type, character)
            let fatigue_target = ScriptedValue.rest_target_fatigue(tier, building.durability, character.race())
            const stress_target = ScriptedValue.rest_target_stress(tier, building.durability, character.race())
            if ((fatigue_target >= character.get_fatigue()) && (stress_target >= character.get_stress())) {
                Effect.leave_room(character.id)
            }
        }        
    }
}