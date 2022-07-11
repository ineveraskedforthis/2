import { CharacterGenericPart } from "../base_game_classes/character_generic_part"
import type { World } from "../world"
import { move } from '../base_game_classes/character_actions/move'
import { eat } from "../base_game_classes/character_actions/eat"
import { cook_meat } from "../base_game_classes/character_actions/cook_meat"
import { clean } from '../base_game_classes/character_actions/clean'
import { rest } from "../base_game_classes/character_actions/rest"
import { hunt } from "../base_game_classes/character_actions/hunt"
import { attack } from "../base_game_classes/character_actions/attack"
import { craft_spear } from "../base_game_classes/character_actions/craft_spear"
import { gather_wood } from "../base_game_classes/character_actions/gather_wood"
import { craft_bone_spear } from "../base_game_classes/character_actions/craft_bone_spear"
import { craft_rat_armour, craft_rat_boots, craft_rat_gloves, craft_rat_helmet, craft_rat_pants } from "../base_game_classes/character_actions/craft_rat_armour"


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

type ActionCheckFunction = ((pool: any, char: CharacterGenericPart, data: any) => Promise<CharacterActionResponce>) 
type ActionFunction = ((pool: any, char: CharacterGenericPart, data: any) => any)

type Action = {
    check: ActionCheckFunction
    start: ActionFunction
    result: ActionFunction
    duration: (char: CharacterGenericPart) => number;
    is_move?: boolean
    immediate?: boolean
}


export class ActionManager {
    world: World
    pool: any
    actions: Action[]

    constructor(world: World, pool: any) {
        this.pool = pool
        this.world = world
        this.actions = []
        this.add_action(move)
        this.add_action(clean)
        this.add_action(cook_meat)
        this.add_action(eat)
        this.add_action(hunt)
        this.add_action(rest)
        this.add_action(attack)
        this.add_action(craft_spear)
        this.add_action(gather_wood)
        this.add_action(craft_bone_spear)
        this.add_action(craft_rat_pants)
        this.add_action(craft_rat_armour)
        this.add_action(craft_rat_gloves)
        this.add_action(craft_rat_helmet)
        this.add_action(craft_rat_boots)
    }

    add_action(action: Action) {
        this.actions.push(action)
    }

    async start_action(action_id: CharacterAction, char: CharacterGenericPart, data: any) {
        if (char.action_started) {
            return CharacterActionResponce.ALREADY_IN_ACTION
        }
        let action = this.actions[action_id];
        let check = await action.check(this.pool, char, data)
        if (check == CharacterActionResponce.OK) {
            let duration = action.duration(char)
            char.send_action_ping(duration, action.is_move||false)            
            if (action.immediate) {
                await this.action(action_id, char, undefined)
            } else {
                await action.start(this.pool, char, data)
                char.action_started = true
                char.current_action = action_id
                char.action_progress = 0
                char.action_duration = duration
            }            
        }
        return check
    }

    async action(action_id: CharacterAction, char: CharacterGenericPart, data: any): Promise<CharacterActionResponce> {
        let action = this.actions[action_id];
        char.action_started = false
        let check = await action.check(this.pool, char, data)
        if (check == CharacterActionResponce.OK) {
            return await action.result(this.pool, char, data)
        }
        return check
    }
}

export enum CharacterAction {
    MOVE = 0,
    CLEAN = 1,
    COOK_MEAT = 2,
    EAT = 3,
    HUNT = 4,
    REST = 5,
    ATTACK = 6,
    CRAFT_SPEAR = 7,
    GATHER_WOOD = 8,
    CRAFT_BONE_SPEAR = 9,
    CRAFT_RAT_PANTS = 10,
    CRAFT_RAT_ARMOUR = 11,
    CRAFT_RAT_GLOVES = 12,
    CRAFT_RAT_HELMET = 13,
    CRAFT_RAT_BOOTS = 14
}