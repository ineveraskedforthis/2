import { action_points } from "../../../shared/battle_data";
import { battle_position } from "../../../static/modules/battle_image_helper";
import { char_id } from "../../types";

export class UnitData {
    action_points_left: action_points;
    action_points_max: action_points;
    next_turn_after: number;
    dodge_turns: number;
    slowness: number;
    speed: number;
    position: battle_position;
    char_id: number
    team: number
    dead: boolean

    constructor(position: battle_position, team: number, ap_left: action_points, ap_max: action_points, slowness: number, speed: number, char_id: char_id, dead: boolean) {
        this.action_points_left = ap_left
        this.action_points_max = ap_max
        this.slowness = slowness
        this.speed = speed
        this.next_turn_after = slowness
        this.position = position
        this.char_id = char_id
        this.team = team
        this.dead = dead
        this.dodge_turns = 0
    }
}