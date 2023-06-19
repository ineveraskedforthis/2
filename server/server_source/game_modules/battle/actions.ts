import { Attack } from "../attack/system"
import { Character } from "../character/character"
import { CharacterSystem } from "../character/system"
import { Alerts } from "../client_communication/network_actions/alerts"
import { DmgOps } from "../damage_types"
import { Event } from "../events/events"
import { geom } from "../geom"
import { ItemSystem } from "../items/system"
import { Convert } from "../systems_communication"
import { Battle } from "./classes/battle"
import { Unit } from "./classes/unit"
import { BattleEvent } from "./events"
import { BattleTriggers } from "./TRIGGERS"
import { BattleActionExecution, BattleActionExecutionTarget, BattleApCost, BattleApCostTarget, BattleNumber } from "./TYPES"
import { BattleValues } from "./VALUES"
import { action_points } from "@custom_types/battle_data"

type ActionSelf = {
    ap_cost: BattleApCost,
    execute: BattleActionExecution
}

type ActionUnit = {
    ap_cost: BattleApCostTarget,
    range: BattleNumber,
    damage: BattleNumber,
    execute: BattleActionExecutionTarget,
}

type ActionSelfKeys = 'Flee'|'EndTurn'


export const ActionsSelf: {[_ in ActionSelfKeys]: ActionSelf} = {
    "Flee": {
        ap_cost: (battle: Battle, character: Character, unit: Unit) => {
            return 3 as action_points
        },
        execute: (battle: Battle, character: Character, unit: Unit) => {
            if (BattleTriggers.safe(battle)) {
                BattleEvent.Leave(battle, unit)
                return
            }
            let dice = Math.random();
            if (dice <= BattleValues.flee_chance(unit.position)) { // success
                Alerts.battle_event_simple(battle, 'flee', unit, 3)
                Alerts.battle_event_simple(battle, 'update', unit, 0)
                BattleEvent.Leave(battle, unit)
                return
            }
        }
    },
    "EndTurn": {
        ap_cost: (battle: Battle, character: Character, unit: Unit) => {
            return 0 as action_points
        },
        execute: (battle: Battle, character: Character, unit: Unit) => {
            BattleEvent.EndTurn(battle, unit)
        }
    }
}

type ActionUnitKeys = 'Pierce'|'Slash'|'Knock'
export const ActionsUnit: {[key in ActionUnitKeys]: ActionUnit} = {
    'Pierce': {
        ap_cost: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            let weapon = character.equip.data.weapon
            if (weapon == undefined)
                return 1 as action_points
            else {
                return ItemSystem.weight(weapon) as action_points
            }
        },
        range: (battle: Battle, character: Character, unit: Unit) => {
            return character.range()
        },
        execute: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            let dodge_flag = (target_unit.dodge_turns > 0)
            let a = unit.position
            let b = target_unit.position
            let c = geom.minus(b, a)
            let norm = geom.norm(c)
            let power_ratio = CharacterSystem.phys_power(character) / CharacterSystem.phys_power(target_character)
            let scale = character.range() * power_ratio / norm
            c = geom.mult(c, scale)
            BattleEvent.SetCoord(battle, target_unit, geom.sum(b, c))
            Event.attack(character, target_character, dodge_flag, 'pierce')            
        },
        damage: (battle: Battle, character: Character, unit: Unit) => {
            return DmgOps.total(Attack.generate_melee(character, 'pierce').damage)
        },
    },

    'Slash': {
        ap_cost: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            let weapon = character.equip.data.weapon
            if (weapon == undefined)
                return 1 as action_points
            else {
                return ItemSystem.weight(weapon) as action_points
            }
        },
        range: (battle: Battle, character: Character, unit: Unit) => {
            return character.range()
        },
        execute: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            let dodge_flag = (target_unit.dodge_turns > 0)
            let range = character.range()

            for (let aoe_target of Object.values(battle.heap.data)) {
                if (unit.id == aoe_target.id) continue
                if (geom.dist(unit.position, aoe_target.position) > range) continue
                let damaged_character = Convert.unit_to_character(aoe_target)
                if (unit.team == aoe_target.team) continue

                Event.attack(character, damaged_character, dodge_flag, 'slice')
                Alerts.battle_event_target_unit(battle, 'attack', unit, aoe_target, 0)
                Alerts.battle_update_unit(battle, aoe_target)
            }
        },
        damage: (battle: Battle, character: Character, unit: Unit) => {
            return DmgOps.total(Attack.generate_melee(character, 'slice').damage)
        },
    },

    'Knock': {
        ap_cost: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            let weapon = character.equip.data.weapon
            if (weapon == undefined)
                return 1 as action_points
            else {
                return ItemSystem.weight(weapon) as action_points
            }
        },
        range: (battle: Battle, character: Character, unit: Unit) => {
            return character.range()
        },
        execute: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            let dodge_flag = (target_unit.dodge_turns > 0)
            let range = character.range()

            Event.attack(character, target_character, dodge_flag, 'blunt')
            Alerts.battle_event_target_unit(battle, 'attack', unit, target_unit, 0)
            Alerts.battle_update_unit(battle, unit)
            Alerts.battle_update_unit(battle, target_unit)    
        },
        damage: (battle: Battle, character: Character, unit: Unit) => {
            return DmgOps.total(Attack.generate_melee(character, 'blunt').damage)
        },
    },
}

export const ActionsPosition = {

}


const action_currrent = ActionsSelf.Flee 

type BattleActionResponse = 
    {response: "NOT_ENOUGH_AP", current: number, needed: number}
    | {response: "INVALID_ACTION"}
    | {response: "OK", ap_cost: action_points, action: ActionSelf}
    | {response: "NOT_ENOUGH_RANGE"}

type BattleActionUnitResponse = 
    {response: "NOT_ENOUGH_AP", current: number, needed: number}
    | {response: "INVALID_ACTION"}
    | {response: "OK", ap_cost: action_points, action: ActionUnit}
    | {response: "NOT_ENOUGH_RANGE"}

function battle_action_self_check(tag: string, battle: Battle, character: Character, unit: Unit):BattleActionResponse {
    const action = ActionsSelf[tag as ActionSelfKeys]
    if (action == undefined) {
        return {response: "INVALID_ACTION"}
    }

    const ap_cost = action.ap_cost(battle, character, unit)
    if (unit.action_points_left < ap_cost) {
        return {response: "NOT_ENOUGH_AP", needed: ap_cost, current: unit.action_points_left}
    }

    return {response: "OK", ap_cost: ap_cost, action: action}
}

function battle_action_unit_check(
    tag: string, 
    battle: Battle, 
    character: Character, unit: Unit, 
    target_character: Character, target_unit: Unit) : BattleActionUnitResponse
{
    const action = ActionsUnit[tag as ActionUnitKeys]
    if (action == undefined) {
        return {response: "INVALID_ACTION"}
    }

    const ap_cost = action.ap_cost(battle, character, unit, target_character, target_unit)
    if (unit.action_points_left < ap_cost) {
        return {response: "NOT_ENOUGH_AP", needed: ap_cost, current: unit.action_points_left}
    }

    const range = action.range(battle, character, unit)
    const dist = geom.dist(unit.position, target_unit.position)
    if (range < dist) {
        return {response: "NOT_ENOUGH_RANGE"}
    }

    return {response: "OK", ap_cost: ap_cost, action: action}
}

export function battle_action_self(tag: string, battle: Battle, character: Character, unit: Unit): BattleActionResponse {
    let result = battle_action_self_check(tag, battle, character, unit)
    if (result.response == "OK") {
        unit.action_points_left = unit.action_points_left - result.ap_cost as action_points
        result.action.execute(battle, character, unit)
    }
    return result
}

export function battle_action_unit(tag: ActionUnitKeys, battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) {
    let result = battle_action_unit_check(tag, battle, character, unit, target_character, target_unit)
    if (result.response == "OK") {
        unit.action_points_left = unit.action_points_left - result.ap_cost as action_points
        result.action.execute(battle, character, unit, target_character, target_unit)
        // Alerts.battle_event(battle, tag, unit.id, target_unit.position, target_unit.id, result.ap_cost)
        Alerts.battle_update_unit(battle, unit)
        Alerts.battle_update_unit(battle, target_unit)
    }
    return result
}