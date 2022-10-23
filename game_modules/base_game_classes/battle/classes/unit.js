"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unit = void 0;
class Unit {
    constructor(id, position, team, ap_left, ap_max, slowness, action_units_per_turn, char_id, dead) {
        this.id = id;
        this.action_points_left = ap_left;
        this.action_points_max = ap_max;
        this.slowness = slowness;
        this.action_units_per_turn = action_units_per_turn;
        this.next_turn_after = slowness;
        this.position = position;
        this.char_id = char_id;
        this.team = team;
        this.dead = dead;
        this.dodge_turns = 0;
    }
}
exports.Unit = Unit;
