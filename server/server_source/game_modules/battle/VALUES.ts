import { battle_position } from "@custom_types/battle_data";
import { Character } from "../character/character";
import { Unit } from "./classes/unit";
import { CharacterSystem } from "../character/system";

export namespace BattleValues {
    export const HALFWIDTH = 7
    export const HALFHEIGHT = 15
    
    export function flee_chance(position: battle_position){
        return 0.6 + Math.max(Math.abs(position.x) / HALFWIDTH, Math.abs(position.y) / HALFHEIGHT) / 2
    }

    export function move_cost(unit: Unit, character: Character): number {
        return CharacterSystem.movement_cost_battle(character) 
    }
}