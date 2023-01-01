import { h, w } from "./battle_image.js";
import { BATTLE_SCALE } from "./constants.js";
const NAMEPLATE_SHIFT_X = 0;
const NAMEPLATE_SHIFT_Y = 0;
export var position_c;
(function (position_c) {
    function diff(a, b) {
        return { x: a.x - b.x, y: a.y - b.y };
    }
    position_c.diff = diff;
    function dist(a, b) {
        return norm(diff(b, a));
    }
    position_c.dist = dist;
    function norm(a) {
        return Math.sqrt(a.x * a.x + a.y * a.y);
    }
    position_c.norm = norm;
    function sum(a, b) {
        return { x: a.x + b.x, y: a.y + b.y };
    }
    position_c.sum = sum;
    function scalar_mult(x, a) {
        return { x: x * a.x, y: x * a.y };
    }
    position_c.scalar_mult = scalar_mult;
    function battle_to_canvas(pos) {
        let centre = { x: pos.y, y: pos.x };
        centre.x = -centre.x * BATTLE_SCALE + w / 2;
        centre.y = centre.y * BATTLE_SCALE + h / 2;
        return raw_to_canvas(centre);
    }
    position_c.battle_to_canvas = battle_to_canvas;
    function canvas_to_battle(pos) {
        let tmp = { x: pos.x, y: pos.y };
        tmp.x = (tmp.x - w / 2) / (-BATTLE_SCALE);
        tmp.y = (tmp.y - h / 2) / (BATTLE_SCALE);
        return raw_to_battle({ x: tmp.y, y: tmp.x });
    }
    position_c.canvas_to_battle = canvas_to_battle;
    function raw_to_battle(pos) {
        return pos;
    }
    position_c.raw_to_battle = raw_to_battle;
    function raw_to_canvas(pos) {
        return pos;
    }
    position_c.raw_to_canvas = raw_to_canvas;
    function image_to_canvas(position, w, h) {
        // let w = image.get_w(images);
        // let h = image.get_h(images);
        return [position.x - w / 10, position.y - h / 5 + 10, w / 5, h / 5];
    }
    position_c.image_to_canvas = image_to_canvas;
})(position_c || (position_c = {}));
export function get_mouse_pos_in_canvas(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    let tmp = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
    return position_c.raw_to_canvas(tmp);
}
