import { CharacterView } from "@custom_types/responses"
import { CharacterDataExpanded } from "./Types/character"
import { location_id } from "@custom_types/ids"

export const local_actions = ['fish', 'gather_wood', 'gather_cotton', 'hunt', 'clean', 'rest', 'gather_berries'] as const
export type local_action = typeof local_actions[number]
export type action = 'move' | 'continue_move' | local_action

export function is_action_repeatable(action: action) {
    switch (action) {
        case "fish":return true
        case "gather_wood":return true
        case "gather_cotton":return true
        case "gather_berries": return true
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
    selected_location: location_id | undefined,
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
    current_map_position: [number, number],
    current_map_movement_target: [number, number]|undefined
    movement_in_process: boolean
    movement_progress: number
    character_data: CharacterDataExpanded|undefined
    current_path_data: {[key: string]: [number, number]|undefined}
    current_path: [number, number][]
    current_path_step: number,
    draw_characters: boolean,
    now: number
}

export var globals: globals = {
    prev_mouse_x: null,
    prev_mouse_y: null,
    pressed: false,
    selected_character: undefined,
    selected_location: undefined,
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
    current_map_position: [0, 0],
    current_map_movement_target: undefined,
    movement_in_process: false,
    movement_progress: 0,
    current_path_data: {},
    current_path: [],
    current_path_step: 0,
    character_data: undefined,
    draw_characters: true,
    now: Date.now()
}

