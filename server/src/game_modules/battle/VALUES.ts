import { battle_position } from "@custom_types/battle_data";
import { Character } from "../data/entities/character";
import { CharacterValues } from "../scripted-values/character";

export namespace BattleValues {
    export const HALFWIDTH = 15
    export const HALFHEIGHT = 15

    export function flee_chance(position: battle_position){
        return 0.1 + Math.max(Math.abs(position.x) / HALFWIDTH, Math.abs(position.y) / HALFHEIGHT) / 2
    }

    export function move_cost(unit: Character): number {
        return CharacterValues.movement_cost_battle(unit)
    }
}