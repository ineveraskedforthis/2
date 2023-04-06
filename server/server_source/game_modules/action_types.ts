import { move } from './actions/move';
import { eat } from "./actions/eat";
import { clean } from './actions/clean';
import { proper_rest, rest } from "./actions/rest";
import { fish, hunt } from "./actions/hunt";
import { gather_cotton, gather_wood } from "./actions/gather";



export namespace CharacterAction {
    export const MOVE = move;
    export const CLEAN = clean;
    export const EAT = eat;
    export const HUNT = hunt;
    export const FISH = fish;
    export const REST = rest;
    export const PROPER_REST = proper_rest;
    // export const ATTACK = attack
    export const GATHER_WOOD = gather_wood;
    export const GATHER_COTTON = gather_cotton;
}
