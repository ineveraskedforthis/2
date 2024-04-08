export const local_actions = ['fish', 'gather_wood', 'gather_cotton', 'hunt', 'clean', 'rest'];
export function is_action_repeatable(action) {
    switch (action) {
        case "fish": return true;
        case "gather_wood": return true;
        case "gather_cotton": return true;
        case "hunt": return true;
        case "clean": return false;
        case "rest": return false;
    }
    return false;
}
export var globals = {
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
    character_data: undefined
};
