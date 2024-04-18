import { battle_position } from "@custom_types/battle_data.js";
import { character_id } from "@custom_types/ids.js";

export interface UnitViewMinimal {
    readonly id: character_id;
    readonly name: string;

    readonly hp: number;
    readonly max_hp: number;

    readonly ap: number;
    readonly max_ap: number;

    readonly move_cost: number;
    readonly next_turn: number;

    readonly position: battle_position
    readonly range: number
}

export interface UnitView extends UnitViewMinimal {
    readonly hp_target: number
    readonly ap_target: number
    orientation: "left" | "right"
}
