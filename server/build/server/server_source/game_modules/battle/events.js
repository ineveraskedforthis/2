"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleEvent = exports.MOVE_COST = void 0;
const alerts_1 = require("../client_communication/network_actions/alerts");
const events_1 = require("../events/events");
const geom_1 = require("../geom");
const systems_communication_1 = require("../systems_communication");
const battle_ai_1 = require("./AI/battle_ai");
const system_1 = require("./system");
const Perks_1 = require("../character/Perks");
exports.MOVE_COST = 3;
var BattleEvent;
(function (BattleEvent) {
    function NewUnit(battle, unit) {
        battle.heap.add_unit(unit);
        alerts_1.Alerts.new_unit(battle, unit);
        if (battle.grace_period > 0)
            battle.grace_period += 6;
        alerts_1.Alerts.battle_event(battle, 'unit_join', unit.id, unit.position, unit.id, 0);
    }
    BattleEvent.NewUnit = NewUnit;
    function Leave(battle, unit) {
        if (unit == undefined)
            return;
        battle.heap.delete(unit);
        alerts_1.Alerts.remove_unit(battle, unit);
    }
    BattleEvent.Leave = Leave;
    function EndTurn(battle, unit) {
        console.log(battle.id + ' end turn');
        console.log(unit.id + 'unit id');
        // invalid battle
        if (battle.heap.get_selected_unit() == undefined)
            return false;
        // not unit's turn
        if (battle.heap.get_selected_unit()?.id != unit.id)
            return false;
        battle.waiting_for_input = false;
        //updating unit and heap
        battle.heap.pop();
        unit.next_turn_after = unit.slowness;
        let new_ap = Math.min((unit.action_points_left + unit.action_units_per_turn), unit.action_points_max);
        let ap_increase = new_ap - unit.action_points_left;
        unit.action_points_left = new_ap;
        unit.dodge_turns = Math.max(0, unit.dodge_turns - 1);
        battle.heap.push(unit.id);
        battle.grace_period = Math.max(battle.grace_period - 1, 0);
        // send updates
        alerts_1.Alerts.battle_event(battle, 'end_turn', unit.id, unit.position, unit.id, -ap_increase);
        alerts_1.Alerts.battle_update_unit(battle, unit);
    }
    BattleEvent.EndTurn = EndTurn;
    /**
     * This events starts a new turn in provided battle
     * It sets new date_of_last_turn and updates priorities in heap accordingly
     * @param battle Battle
     * @returns
     */
    function NewTurn(battle) {
        console.log(battle.id + ' new turn');
        let current_time = Date.now();
        battle.date_of_last_turn = current_time;
        let unit = battle.heap.get_selected_unit();
        if (unit == undefined) {
            return { responce: 'no_units_left' };
        }
        console.log(unit.id + ' current unit');
        let time_passed = unit.next_turn_after;
        battle.heap.update(time_passed);
        alerts_1.Alerts.battle_event(battle, 'new_turn', unit.id, unit.position, unit.id, 0);
    }
    BattleEvent.NewTurn = NewTurn;
    function Move(battle, unit, target) {
        let tmp = geom_1.geom.minus(target, unit.position);
        var points_spent = geom_1.geom.norm(tmp) * exports.MOVE_COST;
        if (points_spent > unit.action_points_left) {
            tmp = geom_1.geom.mult(geom_1.geom.normalize(tmp), unit.action_points_left / exports.MOVE_COST);
            points_spent = unit.action_points_left;
        }
        unit.position.x = tmp.x + unit.position.x;
        unit.position.y = tmp.y + unit.position.y;
        unit.action_points_left = unit.action_points_left - points_spent;
        alerts_1.Alerts.battle_event(battle, 'move', unit.id, unit.position, unit.id, points_spent);
        alerts_1.Alerts.battle_update_unit(battle, unit);
    }
    BattleEvent.Move = Move;
    function Attack(battle, attacker, defender, attack_type) {
        const AttackerCharacter = systems_communication_1.Convert.unit_to_character(attacker);
        const COST = 3;
        let dist = geom_1.geom.dist(attacker.position, defender.position);
        const DefenderCharacter = systems_communication_1.Convert.unit_to_character(defender);
        if (dist > AttackerCharacter.range()) {
            const res = battle_ai_1.BattleAI.convert_attack_to_action(battle, attacker.id, defender.id, 'usual');
            if (res.action == 'move')
                Move(battle, attacker, res.target);
        }
        if (attacker.action_points_left < COST) {
            alerts_1.Alerts.not_enough_to_character(AttackerCharacter, 'action_points', 3, attacker.action_points_left);
            return;
        }
        let dodge_flag = (defender.dodge_turns > 0);
        attacker.action_points_left = attacker.action_points_left - COST;
        events_1.Event.attack(AttackerCharacter, DefenderCharacter, dodge_flag, attack_type);
        alerts_1.Alerts.battle_event(battle, 'attack', attacker.id, defender.position, defender.id, COST);
        alerts_1.Alerts.battle_update_unit(battle, attacker);
        alerts_1.Alerts.battle_update_unit(battle, defender);
    }
    BattleEvent.Attack = Attack;
    function Shoot(battle, attacker, defender) {
        const AttackerCharacter = systems_communication_1.Convert.unit_to_character(attacker);
        const COST = 3;
        if (!(0, Perks_1.can_shoot)(AttackerCharacter)) {
            return;
        }
        if (attacker.action_points_left < COST) {
            alerts_1.Alerts.not_enough_to_character(AttackerCharacter, 'action_points', COST, attacker.action_points_left);
            return;
        }
        let dist = geom_1.geom.dist(attacker.position, defender.position);
        const DefenderCharacter = systems_communication_1.Convert.unit_to_character(defender);
        attacker.action_points_left = attacker.action_points_left - COST;
        let responce = events_1.Event.shoot(AttackerCharacter, DefenderCharacter, dist, defender.dodge_turns > 0);
        switch (responce) {
            case 'miss':
                alerts_1.Alerts.battle_event(battle, 'miss', attacker.id, defender.position, defender.id, COST);
                break;
            case 'no_ammo': alerts_1.Alerts.not_enough_to_character(AttackerCharacter, 'arrow', 1, 0);
            case 'ok': alerts_1.Alerts.battle_event(battle, 'ranged_attack', attacker.id, defender.position, defender.id, COST);
        }
        alerts_1.Alerts.battle_update_unit(battle, attacker);
        alerts_1.Alerts.battle_update_unit(battle, defender);
    }
    BattleEvent.Shoot = Shoot;
    function Flee(battle, unit) {
        const character = systems_communication_1.Convert.unit_to_character(unit);
        if (unit.action_points_left >= 3) {
            unit.action_points_left = unit.action_points_left - 3;
            let dice = Math.random();
            if (system_1.BattleSystem.safe(battle)) {
                events_1.Event.stop_battle(battle);
            }
            if (dice <= flee_chance()) { // success
                alerts_1.Alerts.battle_event(battle, 'flee', unit.id, unit.position, unit.id, 3);
                events_1.Event.stop_battle(battle);
            }
            alerts_1.Alerts.battle_event(battle, 'update', unit.id, unit.position, unit.id, 0);
        }
        alerts_1.Alerts.not_enough_to_character(character, 'action_points', 3, unit.action_points_left);
    }
    BattleEvent.Flee = Flee;
    function MagicBolt(battle, attacker, defender) {
        const AttackerCharacter = systems_communication_1.Convert.unit_to_character(attacker);
        const COST = 1;
        if (!(0, Perks_1.can_cast_magic_bolt)(AttackerCharacter)) {
            return;
        }
        const DefenderCharacter = systems_communication_1.Convert.unit_to_character(defender);
        attacker.action_points_left = attacker.action_points_left - COST;
        let responce = events_1.Event.magic_bolt(AttackerCharacter, DefenderCharacter, defender.dodge_turns > 0);
        switch (responce) {
            case 'miss':
                alerts_1.Alerts.battle_event(battle, 'miss', attacker.id, defender.position, defender.id, COST);
                break;
            case 'ok': alerts_1.Alerts.battle_event(battle, 'ranged_attack', attacker.id, defender.position, defender.id, COST);
        }
        alerts_1.Alerts.battle_update_unit(battle, attacker);
        alerts_1.Alerts.battle_update_unit(battle, defender);
    }
    BattleEvent.MagicBolt = MagicBolt;
    function flee_chance() {
        return 0.5;
    }
    function Update(battle, unit) {
        alerts_1.Alerts.battle_update_unit(battle, unit);
    }
    BattleEvent.Update = Update;
    function Dodge(battle, unit) {
        const character = systems_communication_1.Convert.unit_to_character(unit);
        if (!(0, Perks_1.can_dodge)(character)) {
            return;
        }
        if (unit.action_points_left < 4) {
            return;
        }
        unit.dodge_turns = 2;
        unit.action_points_left = unit.action_points_left - 4;
    }
    BattleEvent.Dodge = Dodge;
})(BattleEvent = exports.BattleEvent || (exports.BattleEvent = {}));
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
