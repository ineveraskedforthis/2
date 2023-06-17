import { cell_id } from "@custom_types/common";
import { Character } from "../character/character";


// export const enum CharacterActionResponce {
//     CANNOT_MOVE_THERE,
//     OK,
//     IN_BATTLE,
//     NO_RESOURCE,
//     FAILED,
//     ALREADY_IN_ACTION,
//     INVALID_CELL,
//     ZERO_MOTION,
//     NO_POTENTIAL_ENEMY
// }
// type CharacterMapActionTargetedTrigger = ((character: Character, data: [number, number]) => TriggerResponse);
// type ActionTargetedFunction = ((character: Character, data: [number, number]) => any);

export interface CharacterMapAction {
    check: MapActionTriggerTargeted;
    start: MapActionEffect;
    result: MapActionEffect;
    duration: (character: Character) => number;
    is_move?: boolean;
    immediate?: boolean;
}

export type TriggerResponse = 
    { response: 'TIRED' } 
    | { response: 'NO_RESOURCE' } 
    | { response: 'IN_BATTLE' } 
    | { response: 'OK' }
    | { response: 'ZERO_MOTION' }
    | { response: 'INVALID_MOTION'}
    | { response: 'IMPOSSIBLE_ACTION'}
    | { response: 'ALREADY_IN_AN_ACTION'}

export type MapActionTrigger = (character: Character) => TriggerResponse;
export type MapActionTriggerTargeted = (character: Character, target_cell: cell_id) => TriggerResponse;
export type MapActionEffect = (character: Character, target_cell: cell_id) => void;
export type DurationModifier = (character: Character) => number;

