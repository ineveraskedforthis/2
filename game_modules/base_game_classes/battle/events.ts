import { action_points, battle_position } from "../../../shared/battle_data"
import { Alerts } from "../../client_communication/network_actions/alerts"
import { Event } from "../../events"
import { geom } from "../../geom"
import { Convert } from "../../systems_communication"
import { melee_attack_type } from "../../types"
import { Battle } from "./battle"
import { UnitData } from "./unit"


export namespace BattleEvent {
    export function EndTurnEvent(battle: Battle, unit: UnitData) {
        battle.waiting_for_input = false
        battle.heap.end_turn(unit.id)
        
        Alerts.battle_event(battle, 'end_turn', unit.id, unit.position, unit.id)
    }

    export function MoveEvent(battle: Battle, unit: UnitData, target: battle_position) {
            let tmp = geom.minus(target, unit.position)

            let MOVE_COST = 3
            if (geom.norm(tmp) * MOVE_COST > unit.action_points_left) {
                tmp = geom.mult(geom.normalize(tmp), unit.action_points_left / MOVE_COST)
            }
            unit.position.x = tmp.x + unit.position.x;
            unit.position.y = tmp.y + unit.position.y;
            let points_spent = geom.norm(tmp) * MOVE_COST

            unit.action_points_left =  unit.action_points_left - points_spent as action_points
            
            Alerts.battle_event(battle, 'move', unit.id, target, unit.id)
    }

    export function Attack(battle: Battle, attacker: UnitData, defender:UnitData, attack_type: melee_attack_type) {
        if (attacker.action_points_left < 3) {
            return 
        }

        let dist = geom.dist(attacker.position, defender.position)
        const AttackerCharacter = Convert.unit_to_character(attacker)
        const DefenderCharacter = Convert.unit_to_character(defender)
        if (dist > AttackerCharacter.range()) {
            return
        }

        let dodge_flag = (defender.dodge_turns > 0)
        attacker.action_points_left = attacker.action_points_left - 3 as action_points
        Event.attack(AttackerCharacter, DefenderCharacter, dodge_flag, attack_type)
        Alerts.battle_event(battle, 'attack', attacker.id, defender.position, defender.id)
    }
}


//      action(, unit_index: number, action: Action) {
//         console.log('battle action')
//         console.log(action)

//         let unit = this.heap.get_unit(unit_index)
//         var character:Character = this.world.get_char_from_id(unit.char_id);

//         //no action
//         if (action.action == null) {
//             return {action: 'pff', who: unit_index};
//         }


//         //move toward enemy
//         if (action.action == 'move') {

//         }

        
//         if (action.action == 'attack') {
//             
//         } 

//         if (action.action == 'shoot') {
//             if (!can_shoot(character)) {
//                 return {action: "not_learnt", who: unit_index}
//             }
//             if (action.target == null) {
//                 return { action: 'no_target_selected', who: unit_index}
//             }
//             if (unit.action_points_left < 3) {
//                 return { action: 'not_enough_ap', who: unit_index}
//             }

//             let target_unit = this.heap.get_unit(action.target);
//             let target_char = this.world.get_char_from_id(target_unit.char_id);
//             let dodge_flag = (target_unit.dodge_turns > 0)
//             let dist = geom.dist(unit.position, target_unit.position)

//             character.stash.inc(ARROW_BONE, -1)

//             let result =  character.attack(target_char, 'ranged', dodge_flag, dist);
//             unit.action_points_left -= 3
//             this.changed = true

//             return {action: 'attack', attacker: unit_index, target: action.target, result: result, actor_name: character.name};
//         }

//         if (action.action == 'magic_bolt') {
//             if (!can_cast_magic_bolt(character)) {
//                 // console.log('???')
//                 return {action: "not_learnt", who: unit_index}
//             }
//             if (action.target == null) {
//                 return { action: 'no_target_selected', who: unit_index}
//             }
//             if (unit.action_points_left < 3) {
//                 return { action: 'not_enough_ap', who: unit_index}
//             }
            
//             let target_unit = this.heap.get_unit(action.target);
//             let target_char = this.world.get_char_from_id(target_unit.char_id);

//             if (character.skills.perks.magic_bolt != true) {
//                 character.stash.inc(ZAZ, -1)
//             }

//             let result =  character.spell_attack(target_char, 'bolt');
//             unit.action_points_left -= 3
//             this.changed = true

//             return {action: 'attack', attacker: unit_index, target: action.target, result: result, actor_name: character.name};
//         }

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

//         if (action.action == 'dodge') {

//             if (!can_dodge(character)) {
//                 return { action: "not_learnt", who: unit_index}
//             }

//             if (unit.action_points_left < 4) {
//                 return { action: 'not_enough_ap', who: unit_index}
//             }

//             unit.dodge_turns = 2
//             unit.action_points_left -= 4
//             return {action: 'dodge', who: unit_index}
//         }

//         if (action.action == 'flee') {
//             if (unit.action_points_left >= 3) {
//                 unit.action_points_left -= 3
//                 let dice = Math.random();
//                 this.changed = true
//                 if (dice <= flee_chance(character)) {
//                     this.draw = true;
                    
//                     return {action: 'flee', who: unit_index};
//                 } else {
//                     return {action: 'flee-failed', who: unit_index};
//                 }
//             }
//             return {action: 'not_enough_ap', who: unit_index}
//         } 

//         if (action.action == 'switch_weapon') {
//             // console.log('????')
//             if (unit.action_points_left < 3) {
//                 return {action: 'not_enough_ap', who: unit_index}
//             }
//             unit.action_points_left -= 3
//             character.switch_weapon()
//             return {action: 'switch_weapon', who: unit_index}
//         }
        

//         if (action.action == 'spell_target') {
//             if (unit.action_points_left > 3) {
//                 let spell_tag = action.spell_tag;
//                 let unit2 = this.heap.get_unit(action.target);
//                 let target_char = this.world.get_char_from_id(unit2.char_id);
//                 let result =  character.spell_attack(target_char, spell_tag);
//                 if (result.flags.close_distance) {
//                     let dist = geom.dist(unit.position, unit2.position)
//                     if (dist > 1.9) {
//                         let v = geom.minus(unit2.position, unit.position);
//                         let u = geom.mult(geom.normalize(v), 0.9);
//                         v = geom.minus(v, u)
//                         unit.position.x = v.x
//                         unit.position.y = v.y
//                     }
//                     result.new_pos = {x: unit.position.x, y: unit.position.y};
//                 }
//                 unit.action_points_left -= 3
//                 this.changed = true
//                 return {action: spell_tag, who: unit_index, result: result, actor_name: character.name};
//             }
//         }


//         this.changed = true
//     }
