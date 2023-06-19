import { action_points, battle_position } from "@custom_types/battle_data";
import { Character } from "../character/character";
import { CharacterSystem } from "../character/system";
import { geom } from "../geom";
import { Battle } from "./classes/battle";
import { Unit } from "./classes/unit";
import { BattleEvent } from "./events";
import { ActionsSelf, ActionsUnit, battle_action_self, battle_action_unit } from "./actions";
import { BattleActionExecution, BattleActionExecutionTarget, BattleApCost, BattleApCostTarget, BattleNumber, BattleNumberTarget } from "./TYPES";
import { BattleValues } from "./VALUES";
import { BattleTriggers } from "./TRIGGERS";
import { Convert } from "../systems_communication";

const RANDOM_STEP_LENGTH = 2

interface BattleActionAI {
    ap_cost: BattleApCost;
    execute: BattleActionExecution;
    utility: BattleNumber;
    max_utility: number;
}

interface BattleActionUnitAI {
    ap_cost: BattleApCostTarget;
    execute: BattleActionExecutionTarget;
    utility: BattleNumberTarget;
    max_utility: number;
    range: BattleNumber;
}

function always(character: Character): boolean {
    return true
}

export const BattleActionsBasicAI: {[_ in string]: BattleActionAI} = {
    'RandomStep' : {
        max_utility: 2,
        ap_cost: (battle: Battle, character: Character, unit: Unit) => {
            return CharacterSystem.movement_cost_battle(character) * RANDOM_STEP_LENGTH as action_points
        },
        execute: (battle: Battle, character: Character, unit: Unit) => {
            const phi = Math.random() * Math.PI * 2
            const shift = {x: Math.cos(phi), y: Math.sin(phi)} as battle_position
            const target = geom.sum(unit.position, geom.mult(shift, RANDOM_STEP_LENGTH))
            BattleEvent.Move(battle, unit, character, target)
        },
        utility: (battle: Battle, character: Character, unit: Unit) => {
            let total_utility = 0
            for (const item of Object.values(battle.heap.data)) {
                let distance = geom.dist(unit.position, item.position)
                if (item.id == unit.id) continue
                let target = Convert.unit_to_character(item)
                if (target.dead()) continue
                if (distance < 0.2) total_utility += 1
            }
            return total_utility
        }
    },
    'Flee' : {
        max_utility: 1,
        ap_cost: (battle: Battle, character: Character, unit: Unit) => {
            return ActionsSelf.Flee.ap_cost(battle, character, unit)
        },
        execute: (battle: Battle, character: Character, unit: Unit) => {
            battle_action_self('Flee', battle, character, unit)
        },
        utility: (battle: Battle, character: Character, unit: Unit) => {
            if (battle.grace_period > 0) {
                return 0
            }
            if (BattleTriggers.safe_for_unit(battle, unit, character)) {
                return 1 as action_points
            }
            return (character.get_max_hp() - character.get_hp()) / character.get_max_hp() * BattleValues.flee_chance(unit.position)
        }
    },

    'EndTurn': {
        max_utility: 1,
        ap_cost: (battle: Battle, character: Character, unit: Unit) => {
            return ActionsSelf.EndTurn.ap_cost(battle, character, unit)
        },
        execute: (battle: Battle, character: Character, unit: Unit) => {
            battle_action_self('EndTurn', battle, character, unit)
        },
        utility: (battle: Battle, character: Character, unit: Unit) => {
            return 0.001
        }
    }
}

export const BattleActionsPerUnitAI: {[_ in string]: BattleActionUnitAI} = {
    "AttackPierce" : {
        max_utility: 1,
        range: (battle: Battle, character: Character, unit: Unit) => {
            return ActionsUnit.Pierce.range(battle, character, unit)
        },
        ap_cost: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit): action_points => {
            return ActionsUnit.Pierce.ap_cost(battle, character, unit, target_character, target_unit)
        },
        execute: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            battle_action_unit('Pierce', battle, character, unit, target_character, target_unit)
        },
        utility: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit): number => {
            if (target_character.dead()) return 0
            if (BattleTriggers.is_enemy(unit, character, target_unit, target_character)){
                return 1/geom.dist(unit.position, target_unit.position) * ActionsUnit.Pierce.damage(battle, character, unit) / target_character.get_hp()
            }
            return 0
        },
    }, 

    "AttackSlash" : {
        max_utility: 1,
        range: (battle: Battle, character: Character, unit: Unit) => {
            return ActionsUnit.Slash.range(battle, character, unit)
        },
        ap_cost: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit): action_points => {
            return ActionsUnit.Slash.ap_cost(battle, character, unit, target_character, target_unit)
        },
        execute: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            battle_action_unit('Slash', battle, character, unit, target_character, target_unit)
            // ActionsUnit.Slash.execute(battle, character, unit, target_character, target_unit)
        },
        utility: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit): number => {
            if (target_character.dead()) return 0
            if (BattleTriggers.is_enemy(unit, character, target_unit, target_character)){
                return 1/geom.dist(unit.position, target_unit.position) * ActionsUnit.Slash.damage(battle, character, unit) / target_character.get_hp()
            }
            return 0
        },
    }, 

    "AttackKnock" : {
        max_utility: 1,
        range: (battle: Battle, character: Character, unit: Unit) => {
            return ActionsUnit.Knock.range(battle, character, unit)
        },
        ap_cost: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit): action_points => {
            return ActionsUnit.Knock.ap_cost(battle, character, unit, target_character, target_unit)
        },
        execute: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            battle_action_unit('Knock', battle, character, unit, target_character, target_unit)
        },
        utility: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit): number => {
            if (target_character.dead()) return 0
            if (BattleTriggers.is_enemy(unit, character, target_unit, target_character)){
                return 1/geom.dist(unit.position, target_unit.position) * ActionsUnit.Knock.damage(battle, character, unit) / target_character.get_hp()
            }
            return 0
        },
    }, 

    "MoveTowards": {
        max_utility: 1,
        range: (battle: Battle, character: Character, unit: Unit) => {
            return 100
        },
        ap_cost: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit): action_points => {
            const delta = geom.minus(target_unit.position, unit.position);
            const dist = geom.norm(delta)
            const range = character.range()
            const max_move = 1 // potential movement
            
            if (dist < range) {
                return 0 as action_points
            }
            let distance_to_walk = Math.min(dist - range + 0.01, max_move)
            return distance_to_walk * BattleValues.move_cost(unit, character) as action_points
        },
        execute: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            const delta = geom.minus(target_unit.position, unit.position);
            const dist = geom.norm(delta)
            const range = character.range()
            const max_move = unit.action_points_left / BattleValues.move_cost(unit, character) // potential movement
            if (dist < range) {
                return 
            }
            let direction = geom.normalize(delta)
            let distance_to_walk = Math.min(dist - range + 0.01, max_move)
            let target = geom.sum(unit.position, geom.mult(direction, distance_to_walk))
            BattleEvent.Move(battle, unit, character, target)
        },
        utility: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit): number => {
            if (target_character.dead()) return 0
            const delta = geom.minus(target_unit.position, unit.position);
            const dist = geom.norm(delta)
            const range = character.range()            
            if (dist < range) {
                return 0
            }
            if (!BattleTriggers.is_enemy(unit, character, target_unit, target_character)) {
                return 0
            }
            return 1/dist
        },
    }
}