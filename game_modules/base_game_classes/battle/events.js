"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleEvent = void 0;
const alerts_1 = require("../../client_communication/network_actions/alerts");
const events_1 = require("../../events");
const geom_1 = require("../../geom");
const systems_communication_1 = require("../../systems_communication");
var BattleEvent;
(function (BattleEvent) {
    function EndTurnEvent(battle, unit) {
        battle.waiting_for_input = false;
        battle.heap.end_turn(unit.id);
        alerts_1.Alerts.battle_event(battle, 'end_turn', unit.id, unit.position, unit.id);
    }
    BattleEvent.EndTurnEvent = EndTurnEvent;
    function MoveEvent(battle, unit, target) {
        let tmp = geom_1.geom.minus(target, unit.position);
        let MOVE_COST = 3;
        if (geom_1.geom.norm(tmp) * MOVE_COST > unit.action_points_left) {
            tmp = geom_1.geom.mult(geom_1.geom.normalize(tmp), unit.action_points_left / MOVE_COST);
        }
        unit.position.x = tmp.x + unit.position.x;
        unit.position.y = tmp.y + unit.position.y;
        let points_spent = geom_1.geom.norm(tmp) * MOVE_COST;
        unit.action_points_left = unit.action_points_left - points_spent;
        alerts_1.Alerts.battle_event(battle, 'move', unit.id, target, unit.id);
    }
    BattleEvent.MoveEvent = MoveEvent;
    function Attack(battle, attacker, defender, attack_type) {
        if (attacker.action_points_left < 3) {
            return;
        }
        let dist = geom_1.geom.dist(attacker.position, defender.position);
        const AttackerCharacter = systems_communication_1.Convert.unit_to_character(attacker);
        const DefenderCharacter = systems_communication_1.Convert.unit_to_character(defender);
        if (dist > AttackerCharacter.range()) {
            return;
        }
        let dodge_flag = (defender.dodge_turns > 0);
        attacker.action_points_left = attacker.action_points_left - 3;
        events_1.Event.attack(AttackerCharacter, DefenderCharacter, dodge_flag, attack_type);
        alerts_1.Alerts.battle_event(battle, 'attack', attacker.id, defender.position, defender.id);
    }
    BattleEvent.Attack = Attack;
    function Shoot(battle, attacker, defender) {
        if (attacker.action_points_left < 3) {
            return;
        }
        let dist = geom_1.geom.dist(attacker.position, defender.position);
        const AttackerCharacter = systems_communication_1.Convert.unit_to_character(attacker);
        const DefenderCharacter = systems_communication_1.Convert.unit_to_character(defender);
        attacker.action_points_left = attacker.action_points_left - 3;
        events_1.Event.shoot(AttackerCharacter, DefenderCharacter, dodge_flag, attack_type);
        alerts_1.Alerts.battle_event(battle, 'shoot', attacker.id, defender.position, defender.id);
    }
    BattleEvent.Shoot = Shoot;
})(BattleEvent = exports.BattleEvent || (exports.BattleEvent = {}));
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
