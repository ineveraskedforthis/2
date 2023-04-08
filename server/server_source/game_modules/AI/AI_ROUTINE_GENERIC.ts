import { CharacterAction } from "../action_types";
import { ActionManager } from "../actions/action_manager";
import { Character } from "../character/character";
import { Event } from "../events/events";
import { Convert } from "../systems_communication";
import { random_walk, rest_building, rest_outside } from "./actions";
import { forest_constraints, steppe_constraints } from "./constraints";
import { AIhelper } from "./helpers";
import { tired } from "./triggers";

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

export function ForestPassiveRoutine(character: Character) {
    if (tired(character)) {
        rest_outside(character)
    } else {
        random_walk(character, forest_constraints);
    }
}