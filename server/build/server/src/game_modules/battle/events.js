"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleEvent = void 0;
const alerts_1 = require("../client_communication/network_actions/alerts");
const geom_1 = require("../geom");
const systems_communication_1 = require("../systems_communication");
const system_1 = require("./system");
const checks_1 = require("../character/checks");
const basic_functions_1 = require("../calculations/basic_functions");
const user_manager_1 = require("../client_communication/user_manager");
const VALUES_1 = require("./VALUES");
const heap_1 = require("./classes/heap");
const data_objects_1 = require("../data/data_objects");
// export const MOVE_COST = 3
const COST = {
    ATTACK: 3,
    CHARGE: 1,
};
function sanitize_movement_target(unit, available_points, target) {
    let tmp = geom_1.geom.minus(target, unit.position);
    var points_spent = geom_1.geom.norm(tmp) * VALUES_1.BattleValues.move_cost(unit);
    if (points_spent > available_points) {
        tmp = geom_1.geom.mult(geom_1.geom.normalize(tmp), available_points / VALUES_1.BattleValues.move_cost(unit));
    }
    return { x: tmp.x + unit.position.x, y: tmp.y + unit.position.y };
}
var BattleEvent;
(function (BattleEvent) {
    function NewUnit(battle, unit, delay) {
        if (delay == 0) {
            heap_1.CharactersHeap.add_unit(battle, unit);
            alerts_1.Alerts.new_unit(battle, unit);
            alerts_1.Alerts.battle_event_simple(battle, 'unit_join', unit);
            if (battle.grace_period > 0)
                battle.grace_period = 5;
        }
        else {
            battle.queue.push({
                delay: delay,
                character: unit.id
            });
            alerts_1.Alerts.new_queuer(battle, unit, delay);
        }
    }
    BattleEvent.NewUnit = NewUnit;
    function Leave(battle, unit) {
        if (unit == undefined)
            return;
        // console.log('leave' + unit.id)
        alerts_1.Alerts.battle_event_simple(battle, 'update', unit);
        EndTurn(battle, unit);
        alerts_1.Alerts.remove_unit(battle, unit);
        alerts_1.Alerts.battle_event_simple(battle, 'flee', unit);
        // console.log(character.get_name())
        user_manager_1.UserManagement.add_user_to_update_queue(unit.user_id, 22 /* UI_Part.BATTLE */);
        alerts_1.Alerts.battle_event_simple(battle, 'unit_left', unit);
        alerts_1.Alerts.battle_progress(systems_communication_1.Convert.character_to_user(unit), false);
        console.log(`${unit.id} left battle`);
        heap_1.CharactersHeap.delete_unit(battle, unit);
        if (heap_1.CharactersHeap.get_units_amount(battle) == 0) {
            system_1.BattleSystem.stop_battle(battle);
            return;
        }
    }
    BattleEvent.Leave = Leave;
    function update_unit_after_turn(battle, unit, character) {
        heap_1.CharactersHeap.pop(battle);
        unit.next_turn_after = unit.slowness + 1 + Math.floor(Math.random() * 50);
        const rage_mod = (100 + character.get_rage()) / 100;
        let new_ap = Math.min((unit.action_points_left + unit.action_units_per_turn * rage_mod), unit.action_points_max);
        unit.action_points_left = new_ap;
        unit.dodge_turns = Math.max(0, unit.dodge_turns - 1);
        heap_1.CharactersHeap.push(battle, unit.id);
    }
    BattleEvent.update_unit_after_turn = update_unit_after_turn;
    function EndTurn(battle, unit) {
        // console.log('end turn')
        // invalid battle
        if (heap_1.CharactersHeap.get_selected_unit(battle) == undefined)
            return false;
        // not unit's turn
        if (heap_1.CharactersHeap.get_selected_unit(battle)?.id != unit.id)
            return false;
        let current_time = Date.now();
        battle.waiting_for_input = false;
        battle.date_of_last_turn = current_time;
        //updating unit and heap
        const current_ap = unit.action_points_left;
        update_unit_after_turn(battle, unit, unit);
        const new_ap = unit.action_points_left;
        // update grace period
        battle.grace_period = Math.max(battle.grace_period - 1, 0);
        // get next unit
        let next_unit = heap_1.CharactersHeap.get_selected_unit(battle);
        if (next_unit == undefined) {
            console.log('something is very very wrong');
            return false;
        }
        let time_passed = next_unit.next_turn_after;
        for (const item of heap_1.CharactersHeap.update(battle, time_passed)) {
            alerts_1.Alerts.battle_event_simple(battle, 'unit_join', data_objects_1.Data.Characters.from_id(item));
        }
        // send updates
        alerts_1.Alerts.battle_event_simple(battle, 'end_turn', unit);
        alerts_1.Alerts.battle_update_unit(battle, unit);
        alerts_1.Alerts.battle_event_simple(battle, 'new_turn', next_unit);
        return true;
    }
    BattleEvent.EndTurn = EndTurn;
    function Move(battle, unit, target, available_points, ignore_flag) {
        target = sanitize_movement_target(unit, available_points, target);
        SetCoord(battle, unit, target);
        if (!ignore_flag) {
            // unit.action_points_left =  unit.action_points_left - points_spent as action_points
            alerts_1.Alerts.battle_event_target_position(battle, 'move', unit, unit.position);
            alerts_1.Alerts.battle_update_unit(battle, unit);
        }
    }
    BattleEvent.Move = Move;
    function SetCoord(battle, unit, target) {
        unit.position.x = (0, basic_functions_1.trim)(target.x, -VALUES_1.BattleValues.HALFWIDTH, VALUES_1.BattleValues.HALFWIDTH);
        unit.position.y = (0, basic_functions_1.trim)(target.y, -VALUES_1.BattleValues.HALFHEIGHT, VALUES_1.BattleValues.HALFHEIGHT);
    }
    BattleEvent.SetCoord = SetCoord;
    function Charge(battle, unit, target) {
        if (unit.action_points_left < COST.CHARGE) {
            return;
        }
        unit.action_points_left = unit.action_points_left - COST.CHARGE;
        let dist = geom_1.geom.dist(unit.position, target.position);
        if (dist > (unit.range() - 0.1)) {
            let direction = geom_1.geom.minus(target.position, unit.position);
            let stop_before = geom_1.geom.mult(geom_1.geom.normalize(direction), unit.range() - 0.1);
            direction = geom_1.geom.minus(direction, stop_before);
            SetCoord(battle, unit, direction);
        }
        alerts_1.Alerts.battle_event_target_position(battle, 'move', unit, unit.position);
    }
    BattleEvent.Charge = Charge;
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
    function Update(battle, unit) {
        alerts_1.Alerts.battle_update_unit(battle, unit);
    }
    BattleEvent.Update = Update;
    function Dodge(battle, unit) {
        if (!(0, checks_1.can_dodge)(unit)) {
            return;
        }
        if (unit.action_points_left < 4) {
            return;
        }
        unit.dodge_turns = 2;
        unit.action_points_left = unit.action_points_left - 4;
    }
    BattleEvent.Dodge = Dodge;
})(BattleEvent || (exports.BattleEvent = BattleEvent = {}));
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
