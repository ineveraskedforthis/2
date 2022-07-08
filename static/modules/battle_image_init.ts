import { BattleImageNext } from "./battle_image";
import { get_mouse_pos_in_canvas } from "./battle_image_helper";

export function init_battle_control(battle_image:BattleImageNext, globals:any) {
    let socket = globals.socket;
    battle_image.canvas.onmousedown = (event: any) => {
        event.preventDefault();
        globals.bcp = true
    }

    battle_image.canvas.onmousemove = (event: any) => {
        let mouse_pos = get_mouse_pos_in_canvas(battle_image.canvas, event);
        battle_image.hover(mouse_pos);
    };

    battle_image.canvas.onmouseup = (event: any) => {
        let mouse_pos = get_mouse_pos_in_canvas(battle_image.canvas, event);
        if (globals.bcp) {
            battle_image.press(mouse_pos);
            globals.bcp = false;
        }
    }

    battle_image.socket = globals.socket;

    battle_image.add_action({name: 'move', tag: 'move'})
    battle_image.add_action({name: 'attack', tag: 'attack', cost: 1})
    battle_image.add_action({name: 'retreat', tag: 'flee', cost: 3})
    battle_image.add_action({name: 'end turn', tag: 'end_turn', cost: 0})
}