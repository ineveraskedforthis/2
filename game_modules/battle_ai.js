"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleAI = void 0;
const geom_1 = require("./geom");
// type SpellTag = "power_bolt"|"charge"
class BattleAI {
    static calculate_closest_enemy(battle, index) {
        var closest_enemy = null;
        let units = battle.get_units();
        let unit = units[index];
        var min_distance = 100;
        for (var i = 0; i < units.length; i++) {
            let target_unit = units[i];
            var d = geom_1.geom.dist(unit.position, target_unit.position);
            if (((Math.abs(d) <= Math.abs(min_distance)) || (closest_enemy == null)) && (unit.team != target_unit.team) && (!battle.world.get_char_from_id(target_unit.char_id).is_dead())) {
                closest_enemy = i;
                min_distance = d;
            }
        }
        return closest_enemy;
    }
    //tactics triggers block
    static get_value_from_tactic_trigger_tag(agent, tag) {
        if (agent == undefined) {
            return -1;
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
    static compare(a, b, sign) {
        if (sign == undefined) {
            return false;
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
    static check_trigger(agent, battle, index, target, tag, sign, value) {
        if (target == undefined || tag == undefined || sign == undefined || value == undefined) {
            return false;
        }
        if (target == null || tag == null || sign == null || value == null) {
            return false;
        }
        let target_char = undefined;
        if (target == 'me') {
            target_char = agent;
        }
        else if (target == 'closest_enemy') {
            var target_id = BattleAI.calculate_closest_enemy(battle, index);
            if (target_id != null) {
                target_char = battle.world.get_char_from_id(battle.get_unit(target_id).char_id);
            }
            else
                return false;
        }
        if (target_char == undefined) {
            return false;
        }
        var value1 = BattleAI.get_value_from_tactic_trigger_tag(target_char, tag);
        if (value1 == undefined) {
            return false;
        }
        return BattleAI.compare(value1, value, sign);
    }
    static convert_attack_to_action(battle, ind1, ind2, tag) {
        let unit = battle.get_unit(ind1);
        let unit_2 = battle.get_unit(ind2);
        var actor = battle.world.get_char_from_id(unit.char_id);
        let delta = geom_1.geom.minus(unit_2.position, unit.position);
        let dist = geom_1.geom.norm(delta);
        if (dist > actor.get_range()) {
            let target = { x: unit.position.x, y: unit.position.y };
            let action_tag = "move";
            target.x += geom_1.geom.normalize(delta).x * (Math.max(dist - actor.get_range() + 0.1, 0));
            target.y += geom_1.geom.normalize(delta).y * (Math.max(dist - actor.get_range() + 0.1, 0));
            return { action: action_tag, target: target };
        }
        else {
            switch (tag) {
                case 'fast': return { action: 'fast_attack', target: ind2 };
            }
            return { action: 'attack', target: ind2 };
        }
    }
    //decide what action agent should do
    static get_action(battle, index, target_tag, action_tag, spell_tag) {
        var action = null;
        var action_target = null;
        var true_target = -1;
        if (target_tag == 'closest_enemy') {
            true_target = BattleAI.calculate_closest_enemy(battle, index);
        }
        else if (target_tag == 'me') {
            true_target = index;
        }
        if (action_tag == 'attack') {
            let unit = battle.get_unit(index);
            if (unit.action_points_left < 3) {
                return { action: "end_turn" };
            }
            if (true_target == null)
                return { action: null };
            let res = this.convert_attack_to_action(battle, index, true_target, 'usual');
            action = res.action;
            action_target = res.target;
            if (res.action == 'move') {
                return { action: 'move', target: res.target };
            }
            if (res.action == 'attack') {
                return { action: 'attack', target: res.target };
            }
        }
        if (action_tag == 'flee') {
            return { action: 'flee', who: index };
        }
        if (action_tag == 'spell_target') {
            if (true_target == null)
                return { action: null };
            return { action: action_tag, target: true_target, spell_tag: spell_tag };
        }
        return { action: null };
    }
    static action(battle, unit, agent) {
        let tactic = agent.get_tactic();
        var index = agent.get_in_battle_id();
        let slot = tactic[0];
        if (unit.action_points_left < 1) {
            return { action: 'end_turn' };
        }
        if (BattleAI.check_trigger(agent, battle, index, slot.trigger.target, slot.trigger.tag, slot.trigger.sign, slot.trigger.value)) {
            var action = BattleAI.get_action(battle, index, slot.action.target, slot.action.action, slot.spell_tag);
            return action;
        }
        return { action: 'end_turn' };
    }
}
exports.BattleAI = BattleAI;
