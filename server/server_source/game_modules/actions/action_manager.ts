import { Character } from "../character/character"
import { move } from './move'
import { eat } from "./eat"
import { clean } from './clean'
import { rest } from "./rest"
import { fish, hunt } from "./hunt"
// import { attack } from "./attack"
import { gather_cotton, gather_wood } from "./gather"
import { Alerts } from "../client_communication/network_actions/alerts"
import { Data } from "../data"

export function dummy_duration(char: Character) {
    return 0.5;
}

export function dummy_start(char: Character) {}


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

type ActionCheckTargetedFunction = ((char: Character, data: [number, number]) => CharacterActionResponce) 
type ActionTargetedFunction = ((char: Character, data: [number, number]) => any)

type ActionCheckFunction = ((char: Character) => CharacterActionResponce) 
type ActionFunction = ((char: Character) => any)

export interface ActionTargeted  {
    check: ActionCheckTargetedFunction
    start: ActionTargetedFunction
    result: ActionTargetedFunction
    duration: (char: Character) => number;
    is_move?: boolean
    immediate?: boolean
}

export interface Action {
    check: ActionCheckFunction
    start: ActionFunction
    result: ActionFunction
    duration: (char: Character) => number;
    is_move?: boolean
    immediate?: boolean
}

export namespace CharacterAction {
    export const MOVE = move
    export const CLEAN = clean
    export const EAT = eat
    export const HUNT = hunt
    export const FISH = fish
    export const REST = rest
    // export const ATTACK = attack
    export const GATHER_WOOD = gather_wood
    export const GATHER_COTTON = gather_cotton
}

export namespace ActionManager {
    export function start_action(action: ActionTargeted, char: Character, data: [number, number]) {
        if (char.action != undefined) {
            return CharacterActionResponce.ALREADY_IN_ACTION
        }
        let check = action.check(char, data)
        if (check != CharacterActionResponce.OK) {
            return check
        }
        
        let duration = action.duration(char)
        Alerts.action_ping(char, duration, action.is_move||false)
        if (action.immediate) {
            call_action(action, char, data)
        } else {
            action.start(char, data)

            char.action = action
            char.action_progress = 0
            char.action_duration = duration
        }
        return check
    }

    export function call_action(action: ActionTargeted, char: Character, data: [number, number]): CharacterActionResponce {
        char.action = undefined
        char.action_duration = 0
        char.action_progress = 0

        let check = action.check(char, data)
        if (check == CharacterActionResponce.OK) {
            return action.result(char, data)
        }
        return check
    }

    export function update_characters(dt: number) {
        for (let character of Data.Character.list()) {
            if (character == undefined) continue

            if (character.action != undefined) {
                character.action_progress += dt
                if (character.action_progress > character.action_duration) {
                    call_action(character.action, character, character.next_cell)
                }
            }
        }
    }
}

