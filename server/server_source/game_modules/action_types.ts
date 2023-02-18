import { Character } from "./character/character";
import { move } from './actions/move';
import { eat } from "./actions/eat";
import { clean } from './actions/clean';
import { rest } from "./actions/rest";
import { fish, hunt } from "./actions/hunt";
import { gather_cotton, gather_wood } from "./actions/gather";



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

export namespace CharacterAction {
    export const MOVE = move;
    export const CLEAN = clean;
    export const EAT = eat;
    export const HUNT = hunt;
    export const FISH = fish;
    export const REST = rest;
    // export const ATTACK = attack
    export const GATHER_WOOD = gather_wood;
    export const GATHER_COTTON = gather_cotton;
}
