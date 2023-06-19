import { Character } from "../character/character";
import { CharacterSystem } from "../character/system";
import { Unit } from "./classes/unit";

interface BattleActionServer {
    ap_cost: (character: Character, unit: Unit, distance: number) => number;

    unlocked: (character: Character) => boolean;
    utility: (character: Character) => number;
}

function always(character: Character): boolean {
    return true
}

const ActionsList: {[_ in string]: BattleActionServer} = {
    'move' : {
        ap_cost: (character: Character, unit: Unit, distance: number) => {
            return CharacterSystem.movement_cost_battle(character) * distance
        },

        unlocked: always,
        utility: (character: Character) => {
            return 1
        }
    }
}