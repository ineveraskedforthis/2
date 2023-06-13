import { Socket } from "../../shared/battle_data";

// eslint-disable-next-line no-undef
declare const io: any;
export var socket:Socket = io();

export var globals = {
    prev_mouse_x: null,
    prev_mouse_y: null,
    pressed: false,
    selected_character: undefined,
}
