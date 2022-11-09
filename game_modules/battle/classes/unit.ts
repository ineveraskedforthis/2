import { action_points, battle_position, unit_id } from "../../../shared/battle_data";
import { char_id } from "../../types";

export class Unit {
    id: unit_id;
    action_points_left: action_points;
    action_points_max: action_points;
    next_turn_after: number;
    dodge_turns: number;
    slowness: number;
    action_units_per_turn: action_points;
    position: battle_position;
    char_id: char_id
    team: number

    constructor(id: unit_id, position: battle_position, team: number, ap_left: action_points, ap_max: action_points, slowness: number, action_units_per_turn: action_points, char_id: char_id) {
        this.id = id
        this.action_points_left = ap_left
        this.action_points_max = ap_max
        this.slowness = slowness
        this.action_units_per_turn = action_units_per_turn
        this.next_turn_after = slowness
        this.position = position
        this.char_id = char_id
        this.team = team
        this.dodge_turns = 0
    }
}