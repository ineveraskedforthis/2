import { Attack } from "../attack/system"
import { Character } from "../character/character"
import { can_cast_magic_bolt, can_cast_magic_bolt_blood, can_shoot, has_zaz } from "../character/checks"
import { CharacterSystem } from "../character/system"
import { Alerts } from "../client_communication/network_actions/alerts"
import { DmgOps } from "../damage_types"
import { Event } from "../events/events"
import { EventInventory } from "../events/inventory_events"
import { geom } from "../geom"
import { ItemSystem } from "../items/system"
import { Convert } from "../systems_communication"
import { Accuracy } from "./battle_calcs"
import { Battle } from "./classes/battle"
import { Unit } from "./classes/unit"
import { BattleEvent } from "./events"
import { BattleTriggers } from "./TRIGGERS"
import { BattleActionExecution, BattleActionExecutionPosition, BattleActionExecutionTarget, BattleApCost, BattleApCostPosition, BattleApCostTarget, BattleNumber, BattleNumberTarget } from "./TYPES"
import { BattleValues } from "./VALUES"
import { action_points, ActionPositionKeys, ActionSelfKeys, ActionUnitKeys, battle_position } from "@custom_types/battle_data"

export type ActionSelf = {
    ap_cost: BattleApCost,
    execute: BattleActionExecution,
    // utility: BattleNumber,
    chance: BattleNumber,
}

export type ActionPosition = {
    ap_cost: BattleApCostPosition,
    execute: BattleActionExecutionPosition,
    // utility: BattlePositionNumber
}

export type ActionUnit = {
    valid: (character: Character) => boolean;
    ap_cost: BattleApCostTarget,
    range: BattleNumber,
    damage: BattleNumberTarget,
    execute: BattleActionExecutionTarget,
    // utility: BattleNumberTarget;
    chance: BattleNumberTarget,
    move_closer?: boolean,
    switch_weapon?: boolean
}

function always(character: Character): boolean {
    return true
}


const RANDOM_STEP_LENGTH = 2

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
        },
        chance: (battle: Battle, character: Character, unit: Unit) => {
            return BattleValues.flee_chance(unit.position)
        }
    },
    "EndTurn": {
        ap_cost: (battle: Battle, character: Character, unit: Unit) => {
            return 0 as action_points
        },
        execute: (battle: Battle, character: Character, unit: Unit) => {
            BattleEvent.EndTurn(battle, unit)
        },
        chance: (battle: Battle, character: Character, unit: Unit) => {
            return 1
        }
    },
    'RandomStep' : {
        // max_utility: 2,
        ap_cost: (battle: Battle, character: Character, unit: Unit) => {
            return CharacterSystem.movement_cost_battle(character) * RANDOM_STEP_LENGTH as action_points
        },
        execute: (battle: Battle, character: Character, unit: Unit) => {
            const phi = Math.random() * Math.PI * 2
            const shift = {x: Math.cos(phi), y: Math.sin(phi)} as battle_position
            const target = geom.sum(unit.position, geom.mult(shift, RANDOM_STEP_LENGTH))
            BattleEvent.Move(battle, unit, character, target, true)
        },
        chance: (battle: Battle, character: Character, unit: Unit) => {
            return 1
        }
    },
}




export const ActionsUnit: {[key in ActionUnitKeys]: ActionUnit} = {
    'Pierce': {
        valid: always,
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
        chance: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            return 1
        }
    },

    'Slash': {
        valid: always,
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
        chance: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            return 1
        }
    },

    'Knock': {
        valid: always,
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
        chance: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            return 1
        }
    },

    'Ranged': {
        valid: can_shoot,
        ap_cost: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            return 3 as action_points
        },
        range: (battle: Battle, character: Character, unit: Unit) => {
            return 9999
        },
        execute: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            let dist = geom.dist(unit.position, target_unit.position)
            Event.shoot(character, target_character, dist, target_unit.dodge_turns > 0)
        },
        damage: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            let distance = geom.dist(unit.position, target_unit.position)
            const acc = Accuracy.ranged(character, distance)
            const attack = Attack.generate_ranged(character)
            return DmgOps.total(attack.damage) * acc
        },
        chance: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            let distance = geom.dist(unit.position, target_unit.position)
            const acc = Accuracy.ranged(character, distance)
            return acc
        }
    },

    "MagicBolt": { 
        valid: can_cast_magic_bolt,
        range: (battle: Battle, character: Character, unit: Unit) => {
            return 999
        },
        execute: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            let distance = geom.dist(unit.position, target_unit.position)
            Event.magic_bolt_mage(character, target_character, distance, target_unit.dodge_turns > 0)
        },
        damage: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            let distance = geom.dist(unit.position, target_unit.position)
            return DmgOps.total(Attack.generate_magic_bolt(character, distance, false).damage)
        },
        chance: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            return 1
        },
        ap_cost: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            return 1.5 as action_points
        }
    },

    "MagicBoltBlood": {
        valid: can_cast_magic_bolt_blood,
        range: (battle: Battle, character: Character, unit: Unit) => {
            return 999
        },
        execute: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            let distance = geom.dist(unit.position, target_unit.position)
            Event.magic_bolt_blood(character, target_character, distance, target_unit.dodge_turns > 0)
        },
        damage: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            let distance = geom.dist(unit.position, target_unit.position)
            return DmgOps.total(Attack.generate_magic_bolt(character, distance, true).damage)
        },
        chance: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            return 1
        },
        ap_cost: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            return 2 as action_points
        }
    },

    "MagicBoltZAZ": {
        valid: has_zaz,
        range: (battle: Battle, character: Character, unit: Unit) => {
            return 999
        },
        execute: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            let distance = geom.dist(unit.position, target_unit.position)
            Event.magic_bolt_zaz(character, target_character, distance, target_unit.dodge_turns > 0)
        },
        damage: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            let distance = geom.dist(unit.position, target_unit.position)
            return DmgOps.total(Attack.generate_magic_bolt(character, distance, true).damage)
        },
        chance: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            return 1
        },
        ap_cost: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            return 3 as action_points
        }
    },

    "MoveTowards": {
        valid: always,
        range: (battle: Battle, character: Character, unit: Unit) => {
            return 100
        },
        damage: (battle: Battle, character: Character, unit: Unit) => {
            return 0
        },
        ap_cost: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit): action_points => {
            const delta = geom.minus(target_unit.position, unit.position);
            const dist = geom.norm(delta)
            const range = character.range()
            const max_move = unit.action_points_left / BattleValues.move_cost(unit, character) - 0.01 // potential movement
            
            if (dist < range) {
                return 0 as action_points
            }
            let distance_to_walk = Math.min(dist - range + 0.01, max_move)
            // console.log('ap cost to move close is ' + distance_to_walk * BattleValues.move_cost(unit, character))
            // console.log('current ap:' + unit.action_points_left)
            return distance_to_walk * BattleValues.move_cost(unit, character) as action_points
        },
        execute: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit, ignore_flag?: boolean) => {
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
            BattleEvent.Move(battle, unit, character, target, ignore_flag == true)
        },
        chance: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            return 1
        },
        move_closer: true
    },

    "SwitchWeapon": {
        valid: always,
        range: (battle: Battle, character: Character, unit: Unit) => {
            return 9999
        },
        ap_cost: (battle: Battle, character: Character, unit: Unit): action_points => {
            return 0 as action_points
        },
        damage: (battle: Battle, character: Character, unit: Unit) => {
            return 0
        },
        execute: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            EventInventory.switch_weapon(character)
        },
        chance: (battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) => {
            return 1
        },
        switch_weapon: true
    }
}



export const ActionsPosition: { [key in ActionPositionKeys]: ActionPosition} = {
    'Move': {
        ap_cost: (battle: Battle, character: Character, unit: Unit, target: battle_position) => {
            const distance = geom.dist(unit.position, target)
            return Math.min(distance * BattleValues.move_cost(unit, character), unit.action_points_left) as action_points
        },
        execute: (battle: Battle, character: Character, unit: Unit, target: battle_position) => {
            BattleEvent.Move(battle, unit, character, target, false)
        }
    }
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
    | {response: "ATTEMPT_IS_INVALID"}

type BattleActionPositionResponse = 
    {response: "NOT_ENOUGH_AP", current: number, needed: number}
    | {response: "INVALID_ACTION"}
    | {response: "OK", ap_cost: action_points, action: ActionPosition};

export function battle_action_self_check(tag: string, battle: Battle, character: Character, unit: Unit, d_ap: action_points):BattleActionResponse {
    const action = ActionsSelf[tag as ActionSelfKeys]
    if (action == undefined) {
        return {response: "INVALID_ACTION"}
    }

    const ap_cost = action.ap_cost(battle, character, unit)
    if (unit.action_points_left + d_ap < ap_cost) {
        return {response: "NOT_ENOUGH_AP", needed: ap_cost, current: unit.action_points_left}
    }

    return {response: "OK", ap_cost: ap_cost, action: action}
}

export function battle_action_unit_check(
    tag: string, 
    battle: Battle, 
    character: Character, unit: Unit, 
    target_character: Character, target_unit: Unit, 
    d_distance: number, d_ap: number) : BattleActionUnitResponse
{
    const action = ActionsUnit[tag as ActionUnitKeys]
    if (action == undefined) {
        // console.log('no such key')
        return {response: "INVALID_ACTION"}
    }

    const ap_cost = action.ap_cost(battle, character, unit, target_character, target_unit)
    if (unit.action_points_left + d_ap < ap_cost) {
        // console.log('not enough ap', ap_cost, unit.action_points_left, d_ap)
        return {response: "NOT_ENOUGH_AP", needed: ap_cost, current: unit.action_points_left}
    }

    const range = action.range(battle, character, unit)
    const dist = geom.dist(unit.position, target_unit.position)
    if (range + d_distance < dist) {
        // console.log('not enough range', range, dist, d_distance)
        return {response: "NOT_ENOUGH_RANGE"}
    }

    if (!action.valid(character)) {
        // console.log('character is not valid')
        return {response: "ATTEMPT_IS_INVALID"}
    }

    return {response: "OK", ap_cost: ap_cost, action: action}
}

export function battle_action_position_check(tag: string, battle: Battle, character: Character, unit: Unit, target: battle_position): BattleActionPositionResponse {
    const action = ActionsPosition[tag as ActionPositionKeys]
    if (action == undefined) {
        return {response: "INVALID_ACTION"}
    }

    const ap_cost = action.ap_cost(battle, character, unit, target)
    if ((unit.action_points_left < ap_cost - 0.01) || (unit.action_points_left == 0)) {
        return {response: "NOT_ENOUGH_AP", needed: ap_cost, current: unit.action_points_left}
    }

    return {response: "OK", ap_cost: ap_cost, action: action}
}

export function battle_action_self(tag: string, battle: Battle, character: Character, unit: Unit): BattleActionResponse {
    let result = battle_action_self_check(tag, battle, character, unit, 0 as action_points)
    if (result.response == "OK") {
        unit.action_points_left = unit.action_points_left - result.ap_cost as action_points
        result.action.execute(battle, character, unit)
    }
    return result
}

export function battle_action_unit(tag: ActionUnitKeys, battle: Battle, character: Character, unit: Unit, target_character: Character, target_unit: Unit) {
    let result = battle_action_unit_check(tag, battle, character, unit, target_character, target_unit, 0, 0)
    console.log(character.name, 'attempts to ', tag, 'to', target_character.name)
    console.log(result.response)
    if (result.response == "OK") {
        result.action.execute(battle, character, unit, target_character, target_unit)
        unit.action_points_left = unit.action_points_left - result.ap_cost as action_points
        // Alerts.battle_event(battle, tag, unit.id, target_unit.position, target_unit.id, result.ap_cost)
        Alerts.battle_update_unit(battle, unit)
        Alerts.battle_update_unit(battle, target_unit)
        // Alerts.battle_event_simple(battle, tag, unit, result.ap_cost)
    }
    return result
}

export function battle_action_position(tag: ActionPositionKeys, battle: Battle, character: Character, unit: Unit, target: battle_position) {
    let result = battle_action_position_check(tag, battle, character, unit, target)
    if (result.response == "OK") {
        result.action.execute(battle, character, unit, target)
        unit.action_points_left = unit.action_points_left - result.ap_cost as action_points

        if (unit.action_points_left < 0) {
            unit.action_points_left = 0 as action_points
        }
    }
    return result
}