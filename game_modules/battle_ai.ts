import { CharacterGenericPart } from "./base_game_classes/character_generic_part";
import { BattleReworked2, Action, ActionTag, MoveAction, AttackAction } from "./battle";

import {geom, point} from './geom'

type trigger_tag = 'hp'|'rage'|'blood'|'stress'
type sign_tag = '<'|'<='|'=='|'>'|'>='
type target_tag = 'me'|'closest_enemy'

type SpellTag = "power_bolt"|"charge"

export class BattleAI {

    static calculate_closest_enemy(battle: BattleReworked2, index: number) {
        var closest_enemy = null;
        let units = battle.get_units();
        let unit = units[index];
        var min_distance = 100;
        for (var i = 0; i < units.length; i++) {
            let target_unit = units[i]
            var d = geom.dist(unit.position, target_unit.position);
            if (((Math.abs(d) <= Math.abs(min_distance)) || (closest_enemy == null)) && (unit.team != target_unit.team) && (!battle.world.get_char_from_id(target_unit.char_id).is_dead())) {
                closest_enemy = i;
                min_distance = d;
            }
        }
        return closest_enemy
    }


    //tactics triggers block
    static get_value_from_tactic_trigger_tag(agent:CharacterGenericPart, tag: trigger_tag) {
        if (agent == undefined) {
            return -1
        }
        if (tag == 'hp') {
            return agent.get_hp();
        }
        if (tag == 'rage') {
            return agent.get_rage();
        }
        if (tag == 'blood') {
            return agent.get_blood();
        }
    }

    static compare(a: number, b: number, sign: sign_tag) {
        if (sign == undefined) {
            return false
        }
        if (sign == '<=') {
            return a <= b;
        }
        if (sign == '<') {
            return a < b;
        }
        if (sign == '==') {
            return a == b;
        }
        if (sign == '>') {
            return a > b;
        }
        if (sign == '>=') {
            return a >= b;
        }
    }

    static check_trigger(agent:CharacterGenericPart, battle:BattleReworked2, index: number, target: target_tag, tag: trigger_tag, sign: sign_tag, value: number) {
        if (target == undefined || tag == undefined || sign == undefined || value == undefined) {
            return false
        }
        if (target == null || tag == null || sign == null || value == null) {
            return false
        }
        let target_char = undefined

        if (target == 'me') {
            target_char = agent;
        } else if (target == 'closest_enemy') {
            var target_id = BattleAI.calculate_closest_enemy(battle, index)
            if (target_id != null) {
                target_char = battle.world.get_char_from_id(battle.get_unit(target_id).char_id)
            }            
        }
        var value1 = BattleAI.get_value_from_tactic_trigger_tag(target_char, tag);
        if (value1 == undefined) {
            return false
        }
        return BattleAI.compare(value1, value, sign);
    }


    static convert_attack_to_action(battle: BattleReworked2, ind1: number, ind2: number): AttackAction|MoveAction {
        let unit = battle.get_unit(ind1)
        let unit_2 = battle.get_unit(ind2)
        var actor = battle.world.get_char_from_id(unit.char_id);
        let delta = geom.minus(unit_2.position, unit.position);
        let dist = geom.norm(delta)
        if (dist > actor.get_range()) {
            let target: point = {x: unit.position.x, y: unit.position.y}
            let action_tag: ActionTag = "move";
            target.x += geom.normalize(delta).x * (Math.max(dist - actor.get_range() + 0.1, 0));
            target.y += geom.normalize(delta).y * (Math.max(dist - actor.get_range() + 0.1, 0));
            return {action: action_tag, target: target}
        } else {
            return {action: 'attack', target: ind2}
        }
    }

    //decide what action agent should do
    static get_action(battle: BattleReworked2, index: number, target_tag:target_tag, action_tag: ActionTag, spell_tag:SpellTag): Action {
        var action = null;
        var action_target = null;
        var true_target: number|null = -1;

        if (target_tag == 'closest_enemy') {
            true_target = BattleAI.calculate_closest_enemy(battle, index)
        } else if (target_tag == 'me') {
            true_target = index
        }

        if (action_tag == 'attack') {
            if (true_target == null) return {action: null}
            let res = this.convert_attack_to_action(battle, index, true_target);
            action = res.action;
            action_target = res.target;
            if (res.action == 'move') {
                return {action: 'move', target: res.target};
            }
            if (res.action == 'attack') {
                return {action: 'attack', target: res.target};
            } 
            
            
        }

        if (action_tag == 'flee') {
            return {action: 'flee'}
        }

        if (action_tag == 'spell_target') {
            if (true_target == null) return {action: null}
            return {action: action_tag, target: true_target, spell_tag: spell_tag};
        }

         return {action: null}
    }

    static action(battle: BattleReworked2, agent: CharacterGenericPart): Action {
        let tactic: any = agent.get_tactic()
        var index = agent.get_battle_id();
        for (var i = 0; i <= 3; i++) {
            var slot: any = tactic['s' + i];
            if (slot != null && slot != undefined && BattleAI.check_trigger(agent, battle, index, slot.trigger.target, slot.trigger.tag, slot.trigger.sign, slot.trigger.value)) {
                var action = BattleAI.get_action(battle, index, slot.action.target, slot.action.action, slot.spell_tag);
                return action
            }
        }
        return {action: 'end_turn'}
    }
}