import { Character, CharacterMapAction, DurationModifier, MapActionEffect, MapActionTriggerTargeted, TriggerResponse } from "../data/entities/character";
import { basic_trigger } from "./generic_functions";
import { cell_id } from "@custom_types/ids";
import { CHANGE_REASON, Effect } from "../effects/effects";
export function generate_action(
    fatigue_cost: number,
    duration_modifer: DurationModifier,
    trigger: MapActionTriggerTargeted,
    effect: MapActionEffect,
    start_effect: MapActionEffect,
    associated_reason: CHANGE_REASON): CharacterMapAction
{
    return {
        duration(character: Character) {
            return (1 + character.get_fatigue() / 50) * duration_modifer(character);
        },

        check: function(character:Character, cell: cell_id): TriggerResponse {
            let basic_check = basic_trigger(character)
            if (basic_check.response == 'OK') {
                return trigger(character, cell)
            }
            return basic_check
        },

        result:  function(character:Character, cell: cell_id) {
            if (this.check(character, cell).response == 'OK') {
                Effect.Change.fatigue(character, fatigue_cost, associated_reason)
                effect(character, cell)
            }
        },

        start:  function(character:Character, cell: cell_id) {
            start_effect(character, cell)
        },
    }
}