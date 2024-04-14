"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unit = void 0;
class Unit {
    constructor(id, position, team, ap_left, ap_max, slowness, action_units_per_turn, character_id, next_turn_after) {
        this.id = id;
        this.action_points_left = ap_left;
        this.action_points_max = ap_max;
        this.slowness = slowness;
        this.action_units_per_turn = action_units_per_turn;
        this.next_turn_after = next_turn_after;
        this.position = position;
        this.character_id = character_id;
        this.team = team;
        this.dodge_turns = 0;
    }
}
exports.Unit = Unit;













































