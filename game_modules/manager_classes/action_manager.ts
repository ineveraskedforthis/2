import { CharacterGenericPart } from "../base_game_classes/character_generic_part"
import type { World } from "../world"
import { move } from '../base_game_classes/character_actions/move'
import { eat } from "../base_game_classes/character_actions/eat"
import { cook_meat } from "../base_game_classes/character_actions/cook_meat"
import { clean } from '../base_game_classes/character_actions/clean'
import { rest } from "../base_game_classes/character_actions/rest"
import { hunt } from "../base_game_classes/character_actions/hunt"

export const enum CharacterActionResponce {
    CANNOT_MOVE_THERE,
    OK,
    IN_BATTLE,
    NO_RESOURCE,
    FAILED,
    ALREADY_IN_ACTION
}

type ActionCheckFunction = ((pool: any, char: CharacterGenericPart, data: any) => Promise<CharacterActionResponce>) 
type ActionFunction = ((pool: any, char: CharacterGenericPart, data: any) => any)

type Action = {
    check: ActionCheckFunction
    start: ActionFunction
    result: ActionFunction
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
            char.send_action_ping()
            await action.start(this.pool, char, data)
            char.action_started = true
            char.current_action = action_id
            char.action_progress = 0
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
}



