import { Character } from "./character/character";




export const enum CharacterActionResponce {
    CANNOT_MOVE_THERE,
    OK,
    IN_BATTLE,
    NO_RESOURCE,
    FAILED,
    ALREADY_IN_ACTION,
    INVALID_CELL,
    ZERO_MOTION,
    NO_POTENTIAL_ENEMY
}
type ActionCheckTargetedFunction = ((char: Character, data: [number, number]) => CharacterActionResponce);
type ActionTargetedFunction = ((char: Character, data: [number, number]) => any);
type ActionCheckFunction = ((char: Character) => CharacterActionResponce);
type ActionFunction = ((char: Character) => any);

export interface ActionTargeted {
    check: ActionCheckTargetedFunction;
    start: ActionTargetedFunction;
    result: ActionTargetedFunction;
    duration: (char: Character) => number;
    is_move?: boolean;
    immediate?: boolean;
}

export interface Action {
    check: ActionCheckFunction;
    start: ActionFunction;
    result: ActionFunction;
    duration: (char: Character) => number;
    is_move?: boolean;
    immediate?: boolean;
}
