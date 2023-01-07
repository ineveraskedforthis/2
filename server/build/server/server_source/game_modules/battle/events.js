"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleEvent = exports.HALFHEIGHT = exports.HALFWIDTH = void 0;
const alerts_1 = require("../client_communication/network_actions/alerts");
const events_1 = require("../events/events");
const geom_1 = require("../geom");
const systems_communication_1 = require("../systems_communication");
const battle_ai_1 = require("./battle_ai");
const system_1 = require("./system");
const Perks_1 = require("../character/Perks");
const basic_functions_1 = require("../calculations/basic_functions");
const system_2 = require("../character/system");
const user_manager_1 = require("../client_communication/user_manager");
// export const MOVE_COST = 3
const COST = {
    ATTACK: 3,
    CHARGE: 1,
};
exports.HALFWIDTH = 7;
exports.HALFHEIGHT = 15;
var BattleEvent;
(function (BattleEvent) {
    function NewUnit(battle, unit) {
        unit.next_turn_after = battle.heap.last * unit.slowness + Math.random();
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
        console.log('leave' + unit.id);
        EndTurn(battle, unit);
        battle.heap.delete(unit);
        alerts_1.Alerts.remove_unit(battle, unit);
        alerts_1.Alerts.battle_event(battle, 'flee', unit.id, unit.position, unit.id, 0);
        const character = systems_communication_1.Convert.unit_to_character(unit);
        console.log(character.name);
        systems_communication_1.Unlink.character_and_battle(character, battle);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 18 /* UI_Part.BATTLE */);
        alerts_1.Alerts.battle_event(battle, 'unit_left', unit.id, unit.position, unit.id, 0);
        if (battle.heap.get_units_amount() == 0) {
            events_1.Event.stop_battle(battle);
            return;
        }
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
        unit.next_turn_after = unit.slowness * battle.heap.last;
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
        alerts_1.Alerts.battle_event(battle, 'new_turn', unit.id, unit.position, unit.id, 0);
        let time_passed = unit.next_turn_after;
        battle.heap.update(time_passed);
        // Alerts.battle_update_data(battle)
        // Alerts.battle_update_units(battle)
    }
    BattleEvent.NewTurn = NewTurn;
    function Move(battle, unit, target) {
        let tmp = geom_1.geom.minus(target, unit.position);
        var points_spent = geom_1.geom.norm(tmp) * system_1.BattleSystem.move_cost(unit);
        if (points_spent > unit.action_points_left) {
            tmp = geom_1.geom.mult(geom_1.geom.normalize(tmp), unit.action_points_left / system_1.BattleSystem.move_cost(unit));
            points_spent = unit.action_points_left;
        }
        const result = { x: tmp.x + unit.position.x, y: tmp.y + unit.position.y };
        SetCoord(battle, unit, result);
        unit.action_points_left = unit.action_points_left - points_spent;
        alerts_1.Alerts.battle_event(battle, 'move', unit.id, unit.position, unit.id, points_spent);
        alerts_1.Alerts.battle_update_unit(battle, unit);
    }
    BattleEvent.Move = Move;
    function SetCoord(battle, unit, target) {
        unit.position.x = (0, basic_functions_1.trim)(target.x, -exports.HALFWIDTH, exports.HALFWIDTH);
        unit.position.y = (0, basic_functions_1.trim)(target.y, -exports.HALFHEIGHT, exports.HALFHEIGHT);
    }
    BattleEvent.SetCoord = SetCoord;
    function Charge(battle, unit, target) {
        if (unit.action_points_left < COST.CHARGE) {
            return;
        }
        unit.action_points_left = unit.action_points_left - COST.CHARGE;
        const character = systems_communication_1.Convert.unit_to_character(unit);
        let dist = geom_1.geom.dist(unit.position, target.position);
        if (dist > (character.range() - 0.1)) {
            let direction = geom_1.geom.minus(target.position, unit.position);
            let stop_before = geom_1.geom.mult(geom_1.geom.normalize(direction), character.range() - 0.1);
            direction = geom_1.geom.minus(direction, stop_before);
            SetCoord(battle, unit, direction);
        }
        alerts_1.Alerts.battle_event(battle, 'move', unit.id, unit.position, unit.id, COST.CHARGE);
    }
    BattleEvent.Charge = Charge;
    function Attack(battle, attacker, defender, attack_type) {
        if (attacker.id == defender.id)
            return;
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
        if (attack_type == 'pierce') {
            let a = attacker.position;
            let b = defender.position;
            let c = { x: b.x - a.x, y: b.y - a.y };
            let norm = Math.sqrt(c.x * c.x + c.y * c.y);
            let power_ratio = system_2.CharacterSystem.phys_power(AttackerCharacter) / system_2.CharacterSystem.phys_power(DefenderCharacter);
            let scale = AttackerCharacter.range() * power_ratio / norm;
            c = { x: c.x * scale, y: c.y * scale };
            SetCoord(battle, defender, { x: b.x + c.x, y: b.y + c.y });
        }
        if (attack_type == 'slice') {
            let a = attacker.position;
            let b = defender.position;
            let range = AttackerCharacter.range();
            for (let unit of Object.values(battle.heap.data)) {
                if (unit.id == attacker.id)
                    continue;
                if (geom_1.geom.dist(unit.position, attacker.position) > range)
                    continue;
                let damaged_character = systems_communication_1.Convert.unit_to_character(unit);
                if (unit.team == attacker.team)
                    continue;
                events_1.Event.attack(AttackerCharacter, damaged_character, false, attack_type);
                alerts_1.Alerts.battle_event(battle, 'attack', attacker.id, unit.position, unit.id, 0);
                alerts_1.Alerts.battle_update_unit(battle, unit);
            }
        }
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
                alerts_1.Alerts.battle_event(battle, 'update', unit.id, unit.position, unit.id, 0);
                Leave(battle, unit);
                return;
            }
            if (dice <= flee_chance(unit.position)) { // success
                alerts_1.Alerts.battle_event(battle, 'flee', unit.id, unit.position, unit.id, 3);
                alerts_1.Alerts.battle_event(battle, 'update', unit.id, unit.position, unit.id, 0);
                Leave(battle, unit);
                return;
            }
        }
        alerts_1.Alerts.not_enough_to_character(character, 'action_points', 3, unit.action_points_left);
    }
    BattleEvent.Flee = Flee;
    function MagicBolt(battle, attacker, defender) {
        const AttackerCharacter = systems_communication_1.Convert.unit_to_character(attacker);
        const COST = 3;
        if (!(0, Perks_1.can_cast_magic_bolt)(AttackerCharacter)) {
            return;
        }
        if (attacker.action_points_left < COST)
            return;
        const DefenderCharacter = systems_communication_1.Convert.unit_to_character(defender);
        attacker.action_points_left = attacker.action_points_left - COST;
        let dist = geom_1.geom.dist(attacker.position, defender.position);
        let responce = events_1.Event.magic_bolt(AttackerCharacter, DefenderCharacter, dist, defender.dodge_turns > 0);
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
    function flee_chance(position) {
        return 0.6 + Math.max(position.x / exports.HALFWIDTH, position.y / exports.HALFHEIGHT) / 2;
    }
    BattleEvent.flee_chance = flee_chance;
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
//     }
