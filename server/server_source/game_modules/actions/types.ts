import { cell_id } from "@custom_types/ids";
import { Character } from "../character/character";


// export const enum CharacterActionResponse {
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

export interface LackData {
    required_amount: number,
    required_thing: string
}

interface LackOfResource {
    response: "Not enough resources",
    value: LackData[]
}

interface ActionIsPossible {
    response: "OK"
}

interface Notification {
    response: "Notification:"
    value: string
}

export type TriggerResponse = Notification | ActionIsPossible | LackOfResource

export const ResponseOK : TriggerResponse = {
    response: "OK"
}

export namespace NotificationResponse {
    export const InBattle : Notification = {
        response: "Notification:",
        value: "You are in battle."
    }
}

export type MapActionTrigger = (character: Character) => TriggerResponse;
export type MapActionTriggerTargeted = (character: Character, target_cell: cell_id) => TriggerResponse;
export type MapActionEffect = (character: Character, target_cell: cell_id) => void;
export type DurationModifier = (character: Character) => number;

