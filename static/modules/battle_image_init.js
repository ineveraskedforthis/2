import { get_mouse_pos_in_canvas } from "./battle_image_helper.js";
export function init_battle_control(battle_image, globals) {
    let socket = globals.socket;
    battle_image.canvas.onmousedown = (event) => {
        event.preventDefault();
        globals.bcp = true;
    };
    battle_image.canvas.onmousemove = (event) => {
        let mouse_pos = get_mouse_pos_in_canvas(battle_image.canvas, event);
        battle_image.hover(mouse_pos);
    };
    battle_image.canvas.onmouseup = (event) => {
        let mouse_pos = get_mouse_pos_in_canvas(battle_image.canvas, event);
        if (globals.bcp) {
            battle_image.press(mouse_pos);
            globals.bcp = false;
        }
    };
    battle_image.socket = globals.socket;
    battle_image.add_action({ name: 'move', tag: 'move' });
    battle_image.add_action({ name: 'attack', tag: 'attack', cost: 3 });
    battle_image.add_action({ name: 'fast attack', tag: 'fast_attack', cost: 1 });
    battle_image.add_action({ name: 'dodge', tag: 'dodge', cost: 4 });
    battle_image.add_action({ name: 'retreat', tag: 'flee', cost: 3 });
    battle_image.add_action({ name: 'end turn', tag: 'end_turn', cost: 0 });
}
