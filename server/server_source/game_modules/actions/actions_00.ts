import { move } from './actions_move';
import { fish, gather_cotton, gather_wood, hunt } from './actions_hunter_gathering';
import { clean, eat, rest } from './actions_self';

export namespace CharacterAction {
    export const MOVE = move;
    export const CLEAN = clean;
    export const EAT = eat;
    export const HUNT = hunt;
    export const FISH = fish;
    export const REST = rest;
    // export const PROPER_REST = proper_rest;
    // export const ATTACK = attack
    export const GATHER_WOOD = gather_wood;
    export const GATHER_COTTON = gather_cotton;
}
