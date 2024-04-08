import { socket } from "./Socket/socket.js";
import { StashValue, Value } from "./Values/collection.js";

export const local_actions = ['fish', 'gather_wood', 'gather_cotton', 'hunt', 'clean', 'rest'] as const
export type local_action = typeof local_actions[number]
export type action = 'move' | 'continue_move' | local_action

export function is_action_repeatable(action: action) {
    switch (action) {
        case "fish":return true
        case "gather_wood":return true
        case "gather_cotton":return true
        case "hunt":return true
        case "clean":return false
        case "rest":return false
    }
    return false
}

type globals = {
    prev_mouse_x: number | null,
    prev_mouse_y: number | null,
    pressed: boolean,
    selected_character: number | undefined,
    map_zoom: number,
    keep_doing: undefined|local_action
    map_context_dissapear_time: number|undefined
    mouse_over_map_context: boolean
    last_action: undefined|local_action
    action_in_progress: boolean
    action_time: number
    action_ratio: number
    action_total_time: number
    local_characters: CharacterView[]
    stash: StashValue[]
    savings: Value
    savings_trade: Value
}

export var globals: globals = {
    prev_mouse_x: null,
    prev_mouse_y: null,
    pressed: false,
    selected_character: undefined,
    map_zoom: 1,
    keep_doing: undefined,
    map_context_dissapear_time: undefined,
    mouse_over_map_context: false,
    last_action: undefined,
    action_in_progress: false,
    action_time: 0,
    action_ratio: 0,
    action_total_time: 1,
    local_characters: [],
    stash: [],
    savings: new Value(socket, "savings"),
    savings_trade: new Value(socket, "savings_trade")
}
