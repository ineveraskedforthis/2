import { money } from "@custom_types/common";
import { Character } from "../character/character";
import { ScriptedValue } from "../events/scripted_values";
import { random_walk, rest_outside } from "./ACTIONS_BASIC";
import { forest_constraints, simple_constraints, steppe_constraints } from "./constraints";
import { AIhelper } from "./helpers";
import { Effect } from "../events/effects";
import { ResponceNegative } from "../events/triggers";
import { AImemory } from "../character/AIstate";
import { BattleSystem } from "../battle/system";
import { AI_TRIGGER } from "./AI_TRIGGERS";
import { Data } from "../data/data_objects";
import { DataID } from "../data/data_id";

export function SteppeAgressiveRoutine(character: Character) {
    if (AI_TRIGGER.tired(character)) {
        rest_outside(character)
    } else {
        let target = AIhelper.enemies_in_cell(character);
        if (target != undefined) {
            const target_char = Data.Characters.from_id(target);
            BattleSystem.start_battle(character, target_char);
        } else {
            random_walk(character, steppe_constraints);
        }
    }
}

export function SteppePassiveRoutine(character: Character) {
    if (AI_TRIGGER.tired(character)) {
        rest_outside(character)
    } else {
        random_walk(character, steppe_constraints);
    }
}

export function PassiveRoutine(character: Character) {
        if (AI_TRIGGER.tired(character)) {
        rest_outside(character)
    } else {
        random_walk(character, simple_constraints);
    }
}

export function ForestPassiveRoutine(character: Character) {
    if (AI_TRIGGER.tired(character)) {
        rest_outside(character)
    } else {
        random_walk(character, forest_constraints);
    }
}

export function find_location_to_rest(character: Character, budget: money) {
    let cell = character.cell_id
    let locations = DataID.Cells.locations(cell)
    let fatigue_utility = 1
    let money_utility = 10
    let best_utility = 0
    let target = undefined
    for (let item of locations) {
        let location = Data.Locations.from_id(item)

        let price = ScriptedValue.rest_price(character, location)
        let tier = ScriptedValue.rest_tier(character, location)

        let fatigue_target = ScriptedValue.rest_target_fatigue(tier, ScriptedValue.max_devastation - location.devastation, character.race)
        let fatigue_change = character.get_fatigue() - fatigue_target
        let utility = fatigue_change / price
        if ((utility > best_utility) && (price <= budget)) {
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
    if (character.action != undefined) return undefined

    if (AI_TRIGGER.tired(character)) {
        let location_to_rest = find_location_to_rest(character, rest_budget(character))
        if (location_to_rest == undefined) {
            rest_outside(character)
            character.ai_memories.push(AImemory.NO_MONEY)
        } else {
            let result = Effect.enter_location_payment(character.id, location_to_rest)
            if (result.response == ResponceNegative.no_money) {
                rest_outside(character)
                character.ai_memories.push(AImemory.NO_MONEY)
            }
        }

        let location = Data.Locations.from_id(character.location_id)

        let fatigue_target = ScriptedValue.target_fatigue(character, location)
        const stress_target = ScriptedValue.target_stress(character, location)

        if ((fatigue_target + 1 >= character.get_fatigue()) && (stress_target + 1 >= character.get_stress())) {
            character.ai_memories.push(AImemory.RESTED)
            return false
        } else
            return true
    }
    return false
}