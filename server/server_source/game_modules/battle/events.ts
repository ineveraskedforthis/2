import { action_points, battle_position, ms, unit_id } from "../../../../shared/battle_data"
import { Alerts } from "../client_communication/network_actions/alerts"
import { Event } from "../events/events"
import { geom } from "../geom"
import { Convert, Unlink } from "../systems_communication"
import { melee_attack_type } from "../types"
import { Character } from "../character/character"
import { BattleAI } from "./AI/battle_ai"
import { Battle } from "./classes/battle"
import { Unit } from "./classes/unit"
import { BattleSystem } from "./system"
import { can_cast_magic_bolt, can_dodge, can_shoot } from "../character/Perks"
import { trim } from "../calculations/basic_functions"
import { CharacterSystem } from "../character/system"
import { UserManagement } from "../client_communication/user_manager"
import { UI_Part } from "../client_communication/causality_graph"

// export const MOVE_COST = 3

const COST = {
    ATTACK: 3,
    CHARGE: 1,
}

export const HALFWIDTH = 7
export const HALFHEIGHT = 15 

export namespace BattleEvent {
    export function NewUnit(battle: Battle, unit: Unit) {
        battle.heap.add_unit(unit)
        Alerts.new_unit(battle, unit)
        if (battle.grace_period > 0) battle.grace_period += 6
        Alerts.battle_event(battle, 'unit_join', unit.id, unit.position, unit.id, 0)
    }

    export function Leave(battle: Battle, unit: Unit|undefined) {
        if (unit == undefined) return
        battle.heap.delete(unit)
        Alerts.remove_unit(battle, unit)
        
        const character = Convert.unit_to_character(unit)
        Unlink.character_and_battle(character, battle)

        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BATTLE)
        if (battle.heap.get_units_amount() == 0)
            Event.stop_battle(battle)
    }

    export function EndTurn(battle: Battle, unit: Unit) {
        console.log(battle.id + ' end turn')
        console.log(unit.id + 'unit id')

        // invalid battle
        if (battle.heap.get_selected_unit() == undefined) return false
        // not unit's turn
        if (battle.heap.get_selected_unit()?.id != unit.id) return false;

        battle.waiting_for_input = false

        //updating unit and heap
        battle.heap.pop()
        unit.next_turn_after = unit.slowness;

        let new_ap = Math.min((unit.action_points_left + unit.action_units_per_turn), unit.action_points_max) as action_points;
        let ap_increase = new_ap - unit.action_points_left

        unit.action_points_left = new_ap
        unit.dodge_turns = Math.max(0, unit.dodge_turns - 1)
        battle.heap.push(unit.id)

        battle.grace_period = Math.max(battle.grace_period - 1, 0)

        // send updates
        Alerts.battle_event(battle, 'end_turn', unit.id, unit.position, unit.id, -ap_increase)
        Alerts.battle_update_unit(battle, unit)
    }

    /**
     * This events starts a new turn in provided battle  
     * It sets new date_of_last_turn and updates priorities in heap accordingly
     * @param battle Battle
     * @returns 
     */
    export function NewTurn(battle: Battle) {
        console.log(battle.id + ' new turn')
        let current_time = Date.now() as ms
        battle.date_of_last_turn = current_time

        let unit = battle.heap.get_selected_unit()
        if (unit == undefined) {
            return {responce: 'no_units_left'}
        }

        console.log(unit.id + ' current unit')

        let time_passed = unit.next_turn_after
        battle.heap.update(time_passed)
        Alerts.battle_event(battle, 'new_turn', unit.id, unit.position, unit.id, 0)
    }

    export function Move(battle: Battle, unit: Unit, target: battle_position) {

        let tmp = geom.minus(target, unit.position)

        var points_spent = geom.norm(tmp) * BattleSystem.move_cost(unit)

        if (points_spent > unit.action_points_left) {
            tmp = geom.mult(geom.normalize(tmp), unit.action_points_left / BattleSystem.move_cost(unit)) as battle_position
            points_spent = unit.action_points_left
        }
        const result = {x: tmp.x + unit.position.x, y: tmp.y + unit.position.y} as battle_position
        SetCoord(battle, unit, result)

        unit.action_points_left =  unit.action_points_left - points_spent as action_points
        
        Alerts.battle_event(battle, 'move', unit.id, unit.position, unit.id, points_spent)
        Alerts.battle_update_unit(battle, unit)
    }

    export function SetCoord(battle: Battle, unit: Unit, target: battle_position) {
        unit.position.x = trim(target.x, -HALFWIDTH, HALFWIDTH)
        unit.position.y = trim(target.y, -HALFHEIGHT, HALFHEIGHT)
    }

    export function Charge(battle: Battle, unit: Unit, target: Unit) {
        if (unit.action_points_left < COST.CHARGE) {
            return
        }
        unit.action_points_left = unit.action_points_left - COST.CHARGE as action_points

        const character = Convert.unit_to_character(unit)

        let dist = geom.dist(unit.position, target.position)        
        if (dist > (character.range() - 0.1)) {
            let direction = geom.minus(target.position, unit.position);
            let stop_before = geom.mult(geom.normalize(direction), character.range() - 0.1);
            direction = geom.minus(direction, stop_before) as battle_position
            SetCoord(battle, unit, direction)
        }

        Alerts.battle_event(battle, 'move', unit.id, unit.position, unit.id, COST.CHARGE)
    }

    export function Attack(battle: Battle, attacker: Unit, defender:Unit, attack_type: melee_attack_type) {
        if (attacker.id == defender.id) return
        const AttackerCharacter = Convert.unit_to_character(attacker)
        const COST = 3

        let dist = geom.dist(attacker.position, defender.position)
        
        const DefenderCharacter = Convert.unit_to_character(defender)
        if (dist > AttackerCharacter.range()) {
            const res = BattleAI.convert_attack_to_action(battle, attacker.id, defender.id, 'usual')
            if (res.action == 'move') Move(battle, attacker, res.target)
        }

        if (attacker.action_points_left < COST) {
            Alerts.not_enough_to_character(AttackerCharacter, 'action_points', 3, attacker.action_points_left)
            return 
        }

        let dodge_flag = (defender.dodge_turns > 0)
        attacker.action_points_left = attacker.action_points_left - COST as action_points
        if (attack_type == 'pierce') {
            let a = attacker.position
            let b = defender.position
            let c = {x: b.x - a.x, y: b.y - a.y}
            let norm = Math.sqrt(c.x * c.x + c.y * c.y)
            let power_ratio = CharacterSystem.phys_power(AttackerCharacter) / CharacterSystem.phys_power(DefenderCharacter)
            let scale = AttackerCharacter.range() * power_ratio / norm
            c = {x: c.x * scale, y: c.y * scale}
            SetCoord(battle, defender, {x: b.x + c.x, y: b.y + c.y} as battle_position)
        }

        if (attack_type == 'slice') {
            let a = attacker.position
            let b = defender.position
            let range = AttackerCharacter.range()

            for (let unit of Object.values(battle.heap.data)) {
                if (unit.id == attacker.id) continue
                if (geom.dist(unit.position, attacker.position) > range) continue
                let damaged_character = Convert.unit_to_character(unit)

                if (unit.team == attacker.team) continue

                Event.attack(AttackerCharacter, damaged_character, false, attack_type)
                Alerts.battle_event(battle, 'attack', attacker.id, unit.position, unit.id, 0)
                Alerts.battle_update_unit(battle, unit)
            }
        }
        Event.attack(AttackerCharacter, DefenderCharacter, dodge_flag, attack_type)
        Alerts.battle_event(battle, 'attack', attacker.id, defender.position, defender.id, COST)
        Alerts.battle_update_unit(battle, attacker)
        Alerts.battle_update_unit(battle, defender)
    }

    export function Shoot(battle: Battle, attacker: Unit, defender: Unit) {
        const AttackerCharacter = Convert.unit_to_character(attacker)

        const COST = 3

        if (!can_shoot(AttackerCharacter)) {
            return 
        }

        if (attacker.action_points_left < COST) {
            Alerts.not_enough_to_character(AttackerCharacter, 'action_points', COST, attacker.action_points_left)
            return
        }

        let dist = geom.dist(attacker.position, defender.position)
        const DefenderCharacter = Convert.unit_to_character(defender)

        attacker.action_points_left = attacker.action_points_left - COST as action_points
        let responce = Event.shoot(AttackerCharacter, DefenderCharacter, dist, defender.dodge_turns > 0)
        switch(responce) {
            case 'miss': Alerts.battle_event(battle, 'miss', attacker.id, defender.position, defender.id, COST); break;
            case 'no_ammo': Alerts.not_enough_to_character(AttackerCharacter, 'arrow', 1, 0)
            case 'ok': Alerts.battle_event(battle, 'ranged_attack', attacker.id, defender.position, defender.id, COST)
        }
        Alerts.battle_update_unit(battle, attacker)
        Alerts.battle_update_unit(battle, defender)
    }
    
    export function Flee(battle: Battle, unit: Unit) {
        const character = Convert.unit_to_character(unit)
        if (unit.action_points_left >= 3) {
            unit.action_points_left = unit.action_points_left - 3 as action_points
            let dice = Math.random();

            if (BattleSystem.safe(battle)) {
                Leave(battle, unit)
            }

            if (dice <= flee_chance(unit.position)) { // success
                Alerts.battle_event(battle, 'flee', unit.id, unit.position, unit.id, 3)
                Leave(battle, unit)
                // Event.stop_battle(battle)
            }
            Alerts.battle_event(battle, 'update', unit.id, unit.position, unit.id, 0)
        }
        Alerts.not_enough_to_character(character, 'action_points', 3, unit.action_points_left)
    } 

    export function MagicBolt(battle: Battle, attacker: Unit, defender: Unit) {
        const AttackerCharacter = Convert.unit_to_character(attacker)
        const COST = 3
        if (!can_cast_magic_bolt(AttackerCharacter)) {
            return
        }
        if (attacker.action_points_left < COST) return 

        const DefenderCharacter = Convert.unit_to_character(defender)        
        attacker.action_points_left = attacker.action_points_left - COST as action_points
        let dist = geom.dist(attacker.position, defender.position)
        let responce = Event.magic_bolt(AttackerCharacter, DefenderCharacter, dist, defender.dodge_turns > 0)

        switch(responce) {
            case 'miss': Alerts.battle_event(battle, 'miss', attacker.id, defender.position, defender.id, COST); break;
            case 'ok': Alerts.battle_event(battle, 'ranged_attack', attacker.id, defender.position, defender.id, COST)
        }
        Alerts.battle_update_unit(battle, attacker)
        Alerts.battle_update_unit(battle, defender)
    }

    export function flee_chance(position: battle_position){
        return 0.6 + Math.max(position.x / HALFWIDTH, position.y / HALFHEIGHT) / 2
    }

    export function Update(battle: Battle, unit: Unit) {
        Alerts.battle_update_unit(battle, unit)
    }

    export function Dodge(battle: Battle, unit: Unit) {
        const character = Convert.unit_to_character(unit)
        if (!can_dodge(character)) {
            return
        }

        if (unit.action_points_left < 4) {
            return
        }

        unit.dodge_turns = 2
        unit.action_points_left = unit.action_points_left - 4 as action_points
    }
}


//         if (action.action == 'push_back') {
//             if(!can_push_back(character)) {
//                 return {action: "not_learnt", who: unit_index}
//             }
//             if (action.target != null) {
//                 let unit2 = this.heap.get_unit(action.target);
//                 let char:Character = this.world.get_char_from_id(unit.char_id)

//                 if (unit.action_points_left < 5) {
//                     return { action: 'not_enough_ap', who: unit_index}
//                 }

//                 let range = char.get_range()
//                 let dist = geom.dist(unit.position, unit2.position)

//                 if (dist > range) {
//                     return { action: 'not_enough_range', who: unit_index}
//                 }

//                 let target_char = this.world.get_char_from_id(unit2.char_id);
//                 let dodge_flag = (unit2.dodge_turns > 0)
                
                
//                 let result =  character.attack(target_char, 'heavy', dodge_flag, dist);
//                 unit.action_points_left -= 5
//                 this.changed = true

//                 if (!(result.flags.evade || result.flags.miss)) {
//                     let a = unit.position
//                     let b = unit2.position
//                     let c = {x: b.x - a.x, y: b.y - a.y}
//                     let norm = Math.sqrt(c.x * c.x + c.y * c.y)
//                     let power_ratio = character.get_phys_power() / target_char.get_phys_power()
//                     let scale = range * power_ratio / norm / 2

//                     c = {x: c.x * scale, y: c.y * scale}

//                     unit2.position = {x: b.x + c.x, y: b.y + c.y}
//                 }

//                 return {action: 'attack', attacker: unit_index, target: action.target, result: result, actor_name: character.name};
//             }

//             return { action: 'no_target_selected' };
//         }

//         if (action.action == 'fast_attack') {
//             if(!can_fast_attack(character)) {
//                 return {action: "not_learnt", who: unit_index}
//             }
//             if (action.target != null) {
//                 let unit2 = this.heap.get_unit(action.target);
//                 let char:Character = this.world.get_char_from_id(unit.char_id)

//                 if (unit.action_points_left < 1) {
//                     return { action: 'not_enough_ap', who: unit_index}
//                 }
                
//                 let dist = geom.dist(unit.position, unit2.position)

//                 if (dist > char.get_range()) {
//                     return { action: 'not_enough_range', who: unit_index}
//                 }

//                 let target_char = this.world.get_char_from_id(unit2.char_id);
//                 let dodge_flag = (unit2.dodge_turns > 0)
                
//                 let result =  character.attack(target_char, 'fast', dodge_flag, dist);
//                 unit.action_points_left -= 1
//                 this.changed = true
//                 return {action: 'attack', attacker: unit_index, target: action.target, result: result, actor_name: character.name};
//             }

//             return { action: 'no_target_selected' };
//         }

//     }
