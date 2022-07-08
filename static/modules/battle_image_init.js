"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init_battle_control = void 0;
const battle_image_helper_1 = require("./battle_image_helper");
function init_battle_control(battle_image, globals) {
    let socket = globals.socket;
    battle_image.canvas.onmousedown = (event) => {
        event.preventDefault();
        globals.bcp = true;
    };
    battle_image.canvas.onmousemove = (event) => {
        let mouse_pos = (0, battle_image_helper_1.get_mouse_pos_in_canvas)(battle_image.canvas, event);
        battle_image.hover(mouse_pos);
    };
    battle_image.canvas.onmouseup = (event) => {
        let mouse_pos = (0, battle_image_helper_1.get_mouse_pos_in_canvas)(battle_image.canvas, event);
        if (globals.bcp) {
            battle_image.press(mouse_pos);
            globals.bcp = false;
        }
    };
    battle_image.socket = globals.socket;
    battle_image.add_action({ name: 'move', tag: 'move' });
    battle_image.add_action({ name: 'attack', tag: 'attack', cost: 1 });
    battle_image.add_action({ name: 'retreat', tag: 'flee', cost: 3 });
    battle_image.add_action({ name: 'end turn', tag: 'end_turn', cost: 0 });
}
exports.init_battle_control = init_battle_control;
