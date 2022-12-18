import { Character } from "../character/character"
import { move } from './actions_set_up/character_actions/move'
import { eat } from "./actions_set_up/character_actions/eat"
import { cook_elo_to_zaz, cook_fish, cook_meat } from "./actions_set_up/character_actions/craft_bulk"
import { clean } from './actions_set_up/character_actions/clean'
import { rest } from "./actions_set_up/character_actions/rest"
import { fish, hunt } from "./actions_set_up/character_actions/hunt"
// import { attack } from "./actions_set_up/character_actions/attack"
import { gather_cotton, gather_wood } from "./actions_set_up/character_actions/gather"
import { craft_bone_dagger, craft_bone_spear, craft_spear, craft_sword, craft_wooden_mace, craft_wood_bow } from "./actions_set_up/character_actions/craft_weapon"
import { craft_bone_arrow } from "./actions_set_up/character_actions/craft_bone_arrow"
import { craft_elo_dress, craft_graci_hair, craft_rat_armour, craft_rat_boots, craft_rat_gloves, craft_rat_helmet, craft_rat_pants } from "./actions_set_up/character_actions/craft_armour"
import { Alerts } from "../client_communication/network_actions/alerts"
import { Data } from "../data"


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

    export namespace COOK {
        export const MEAT = cook_meat
        export const FISH = cook_fish
        export const ELODINO = cook_elo_to_zaz
    }

    export namespace CRAFT {
        export const BONE_SPEAR = craft_bone_spear
        export const SPEAR = craft_spear
        export const RAT_PANTS = craft_rat_pants
        export const RAT_ARMOUR = craft_rat_armour
        export const RAT_GLOVES = craft_rat_gloves
        export const RAT_HELMET = craft_rat_helmet
        export const RAT_BOOTS = craft_rat_boots
        export const WOOD_BOW = craft_wood_bow
        export const BONE_ARROW = craft_bone_arrow
        export const DAGGER = craft_bone_dagger
        export const MACE = craft_wooden_mace
        export const SWORD = craft_sword
        export const ELO_DRESS = craft_elo_dress
        export const GRACI_HAIR = craft_graci_hair
    }    
}

export namespace ActionManager {
    export function start_action(action: ActionTargeted, char: Character, data: [number, number]) {
        if (char.action != undefined) {
            return CharacterActionResponce.ALREADY_IN_ACTION
        }
        let check = action.check(char, data)
        if (check == CharacterActionResponce.OK) {
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

