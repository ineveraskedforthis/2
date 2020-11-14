const geom = require("./geom.js");


module.exports = class BattleAI {

    static calculate_closest_enemy(battle, index) {
        var closest_enemy = null;
        let units = battle.units;
        let unit = units[index];
        var min_distance = 100;
        for (var i = 0; i < units.length; i++) {
            let target_unit = units[i]
            var d = geom.dist(unit, target_unit);
            if (((Math.abs(d) <= Math.abs(min_distance)) || (closest_enemy == null)) && (unit.team != target_unit.team) && (!battle.world.get_char_from_id(target_unit.id).data.dead)) {
                closest_enemy = i;
                min_distance = d;
            }
        }
        return closest_enemy
    }


    //tactics triggers block
    static get_value_from_tactic_trigger_tag(agent, tag) {
        if (agent == undefined) {
            return -1
        }
        if (tag == 'hp') {
            return agent.hp;
        }
        if (tag == 'rage') {
            return agent.data.other.rage;
        }
        if (tag == 'blood_covering') {
            return agent.data.other.blood_covering;
        }
    }

    static compare(a, b, sign) {
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

    static check_trigger(agent, battle, index, target, tag, sign, value) {
        if (target == undefined || tag == undefined || sign == undefined || value == undefined) {
            return false
        }
        if (target == null || tag == null || sign == null || value == null) {
            return false
        }
        if (target == 'me') {
            target = agent;
        } else if (target == 'closest_enemy') {
            var target_id = BattleAI.calculate_closest_enemy(battle, index)
            target = battle.world.get_char_from_id(battle.units[target_id].id)
        }
        var value1 = BattleAI.get_value_from_tactic_trigger_tag(target, tag);
        return BattleAI.compare(value1, value, sign);
    }


    static convert_attack_to_action(battle, ind1, ind2) {
        let tmp = {
            action: undefined,
            action_target: undefined
        }
        let unit = battle.units[ind1]
        let unit_2 = battle.units[ind2]
        var actor = battle.world.get_char_from_id(unit.id);
        let delta = geom.minus(unit_2, unit);
        if (geom.norm(delta) > actor.get_range()) {
            tmp.action = 'move';
            tmp.target = geom.normalize(delta);
        } else {
            tmp.action = 'attack';
            tmp.target = ind2;
        }
        return tmp
    }

    //decide what action agent should do
    static get_action(battle, index, target_tag, action_tag) {
        var action = null;
        var action_target = null;
        var true_target = undefined;
        if (target_tag == 'closest_enemy') {
            true_target = BattleAI.calculate_closest_enemy(battle, index)
        } else if (target_tag == 'me') {
            true_target = index
        }
        if (action_tag == 'attack') {
            let res = this.convert_attack_to_action(battle, index, true_target);
            action = res.action;
            action_target = res.target;
        }
        if (action_tag == 'flee') {
            action = 'flee';
        }
        if (action_tag.startsWith('spell:')) {
            action = action_tag;
            action_target = true_target;
        }
        return {action: action, target: action_target};
    }

    static async action(pool, battle, agent, save) {
        var tactic = agent.data.tactic;
        var index = agent.data.index_in_battle;
        for (var i = 0; i <= agent.data.stats.tac; i++) {
            var slot = tactic['s' + i];
            if (slot != null && slot != undefined && BattleAI.check_trigger(agent, battle, index, slot.trigger.target, slot.trigger.tag, slot.trigger.sign, slot.trigger.value)) {
                var action = BattleAI.get_action(battle, index, slot.action.target, slot.action.action);
                return await battle.action(pool, index, action, save)
            }
        }
    }
}