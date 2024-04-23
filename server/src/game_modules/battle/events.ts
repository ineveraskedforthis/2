import { action_points, battle_position, ms } from "../../../../shared/battle_data"
import { trim } from "../calculations/basic_functions"
import { can_dodge } from "../character/checks"
import { UI_Part } from "../client_communication/causality_graph"
import { Alerts } from "../client_communication/network_actions/alerts"
import { UserManagement } from "../client_communication/user_manager"
import { Data } from "../data/data_objects"
import { Character } from "../data/entities/character"
import { geom } from "../geom"
import { CharacterValues } from "../scripted-values/character"
import { Convert } from "../systems_communication"
import { BattleValues } from "./VALUES"
import { Battle } from "./classes/battle"
import { CharactersHeap } from "./classes/heap"
import { BattleSystem } from "./system"

// export const MOVE_COST = 3

const COST = {
    ATTACK: 3,
    CHARGE: 1,
}

function sanitize_movement_target(unit: Character, available_points: action_points, target: battle_position) {
    let tmp = geom.minus(target, unit.position)
    var points_spent = geom.norm(tmp) * BattleValues.move_cost(unit)
    if (points_spent > available_points) {
        tmp = geom.mult(geom.normalize(tmp), available_points / BattleValues.move_cost(unit)) as battle_position
    }

    return {x: tmp.x + unit.position.x, y: tmp.y + unit.position.y} as battle_position
}

export namespace BattleEvent {
    export function NewUnit(battle: Battle, unit: Character, delay: number) {
        if (delay == 0) {
            CharactersHeap.add_unit(battle, unit)
            Alerts.new_unit(battle, unit)
            Alerts.battle_event_simple(battle, 'unit_join', unit)
            if (battle.grace_period > 0) battle.grace_period = 8
        } else {
            battle.queue.push({
                delay: delay,
                character: unit.id
            })
            Alerts.new_queuer(battle, unit, delay)
        }
    }

    export function Leave(battle: Battle, unit: Character|undefined) {
        if (unit == undefined) return
        // console.log('leave' + unit.id)
        Alerts.battle_event_simple(battle, 'update', unit)
        EndTurn(battle, unit)

        Alerts.remove_unit(battle, unit)
        Alerts.battle_event_simple(battle, 'flee', unit)
        // console.log(character.get_name())

        UserManagement.add_user_to_update_queue(unit.user_id, UI_Part.BATTLE)
        Alerts.battle_event_simple(battle, 'unit_left', unit)
        Alerts.battle_progress(Convert.character_to_user(unit), false)

        console.log(`${unit.id} left battle`)
        CharactersHeap.delete_unit(battle, unit)

        if (CharactersHeap.get_units_amount(battle) == 0) {
            BattleSystem.stop_battle(battle)
            return
        }
    }

    export function update_unit_after_turn(battle: Battle, unit: Character, character: Character) {
        CharactersHeap.pop(battle)
        unit.next_turn_after = unit.slowness + 1 + Math.floor(Math.random() * 50)
        const rage_mod = (100 + character.get_rage()) / 100
        let new_ap = Math.min((unit.action_points_left + unit.action_units_per_turn * rage_mod), unit.action_points_max) as action_points;
        unit.action_points_left = new_ap
        unit.dodge_turns = Math.max(0, unit.dodge_turns - 1)
        CharactersHeap.push(battle, unit.id)
    }

    export function EndTurn(battle: Battle, unit: Character) {
        // console.log('end turn')

        // invalid battle
        if (CharactersHeap.get_selected_unit(battle) == undefined) return false
        // not unit's turn
        if (CharactersHeap.get_selected_unit(battle)?.id != unit.id) return false;

        let current_time = Date.now() as ms
        battle.waiting_for_input = false
        battle.date_of_last_turn = current_time

        //updating unit and heap
        const current_ap = unit.action_points_left
        update_unit_after_turn(battle, unit, unit)
        const new_ap = unit.action_points_left

        // update grace period
        battle.grace_period = Math.max(battle.grace_period - 1, 0)

        // get next unit
        let next_unit = CharactersHeap.get_selected_unit(battle)
        if (next_unit == undefined) {
            console.log('something is very very wrong')
            return false
        }
        let time_passed = next_unit.next_turn_after
        for (const item of CharactersHeap.update(battle, time_passed)) {
            Alerts.battle_event_simple(battle, 'unit_join', Data.Characters.from_id(item))
        }

        // send updates
        Alerts.battle_event_simple(battle, 'end_turn', unit)
        Alerts.battle_update_unit(battle, unit)
        Alerts.battle_event_simple(battle, 'new_turn', next_unit)
        return true
    }

    export function Move(battle: Battle, unit: Character, target: battle_position, available_points: action_points, ignore_flag: boolean) {
        target = sanitize_movement_target(unit, available_points, target)
        SetCoord(battle, unit, target)

        if (!ignore_flag) {
            // unit.action_points_left =  unit.action_points_left - points_spent as action_points
            Alerts.battle_event_target_position(battle, 'move', unit, unit.position)
            Alerts.battle_update_unit(battle, unit)
        }
    }

    export function SetCoord(battle: Battle, unit: Character, target: battle_position) {
        unit.position.x = trim(target.x, -BattleValues.HALFWIDTH, BattleValues.HALFWIDTH)
        unit.position.y = trim(target.y, -BattleValues.HALFHEIGHT, BattleValues.HALFHEIGHT)
    }

    export function Charge(battle: Battle, unit: Character, target: Character) {
        if (unit.action_points_left < COST.CHARGE) {
            return
        }
        unit.action_points_left = unit.action_points_left - COST.CHARGE as action_points

        let dist = geom.dist(unit.position, target.position)
        if (dist > (CharacterValues.range(unit) - 0.1)) {
            let direction = geom.minus(target.position, unit.position);
            let stop_before = geom.mult(geom.normalize(direction), CharacterValues.range(unit) - 0.1);
            direction = geom.minus(direction, stop_before) as battle_position
            SetCoord(battle, unit, direction)
        }

        Alerts.battle_event_target_position(battle, 'move', unit, unit.position)
    }

    // export function MagicBolt(battle: Battle, attacker: Character, defender: Character) {
    //     const AttackerCharacter = Convert.unit_to_character(attacker)
    //     const COST = 3
    //     if (!can_cast_magic_bolt(AttackerCharacter)) {
    //         return
    //     }
    //     if (attacker.action_points_left < COST) return

    //     const DefenderCharacter = Convert.unit_to_character(defender)
    //     attacker.action_points_left = attacker.action_points_left - COST as action_points
    //     let dist = geom.dist(attacker.position, defender.position)
    //     let response = Event.magic_bolt(AttackerCharacter, DefenderCharacter, dist, defender.dodge_turns > 0)

    //     switch(response) {
    //         case 'miss': Alerts.battle_event_target_unit(battle, 'miss', attacker, defender, COST); break;
    //         case 'ok': Alerts.battle_event_target_unit(battle, 'ranged_attack', attacker, defender, COST)
    //     }
    //     Alerts.battle_update_unit(battle, attacker)
    //     Alerts.battle_update_unit(battle, defender)
    // }

    export function Update(battle: Battle, unit: Character) {
        Alerts.battle_update_unit(battle, unit)
    }

    export function Dodge(battle: Battle, unit: Character) {
        if (!can_dodge(unit)) {
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
//                 let char:Character = this.world.get_char_from_id(unit.character_id)

//                 if (unit.action_points_left < 5) {
//                     return { action: 'not_enough_ap', who: unit_index}
//                 }

//                 let range = char.get_range()
//                 let dist = geom.dist(unit.position, unit2.position)

//                 if (dist > range) {
//                     return { action: 'not_enough_range', who: unit_index}
//                 }

//                 let target_char = this.world.get_char_from_id(unit2.character_id);
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

//                 return {action: 'attack', attacker: unit_index, target: action.target, result: result, actor_name: character.get_name()};
//             }

//             return { action: 'no_target_selected' };
//         }

//         if (action.action == 'fast_attack') {
//             if(!can_fast_attack(character)) {
//                 return {action: "not_learnt", who: unit_index}
//             }
//             if (action.target != null) {
//                 let unit2 = this.heap.get_unit(action.target);
//                 let char:Character = this.world.get_char_from_id(unit.character_id)

//                 if (unit.action_points_left < 1) {
//                     return { action: 'not_enough_ap', who: unit_index}
//                 }

//                 let dist = geom.dist(unit.position, unit2.position)

//                 if (dist > char.get_range()) {
//                     return { action: 'not_enough_range', who: unit_index}
//                 }

//                 let target_char = this.world.get_char_from_id(unit2.character_id);
//                 let dodge_flag = (unit2.dodge_turns > 0)

//                 let result =  character.attack(target_char, 'fast', dodge_flag, dist);
//                 unit.action_points_left -= 1
//                 this.changed = true
//                 return {action: 'attack', attacker: unit_index, target: action.target, result: result, actor_name: character.get_name()};
//             }

//             return { action: 'no_target_selected' };
//         }

//     }
