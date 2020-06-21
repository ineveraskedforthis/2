module.exports = class BattleAI {
    static calculate_closest_enemy(battle, index) {
        var closest_enemy = null;
        var positions = battle.positions;
        var min_distance = battle.world.BASE_BATTLE_RANGE;
        var teams = battle.teams;
        var ids = battle.ids;
        for (var i = 0; i < positions.length; i++) {
            var dx = positions[i] - positions[index];
            if (((Math.abs(dx) <= Math.abs(min_distance)) || (closest_enemy == null)) && (teams[i] != teams[index]) && (!battle.world.chars[ids[i]].data.dead)) {
                closest_enemy = i;
                min_distance = dx;
            }
        }
        return closest_enemy
    }

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
            target = battle.world.chars[battle.ids[target_id]]
        }
        var value1 = BattleAI.get_value_from_tactic_trigger_tag(target, tag);
        return BattleAI.compare(value1, value, sign);
    }

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
            var actor = battle.world.chars[battle.ids[index]];
            // var target = battle.world.chars[battle.ids[true_target]];
            let delta = battle.positions[true_target] - battle.positions[index];
            if (Math.abs(delta) > actor.get_range()) {
                action = 'move';
                if (delta > 0){
                    action_target = 'right';
                } else {
                    action_target = 'left';
                }
            } else {
                action = 'attack';
                action_target = true_target;
            }
        }
        if (action_tag == 'flee') {
            action = 'flee';
        }
        return {action: action, target: action_target};
    }

    static async action(pool, agent, save) {
        var world = agent.world;
        var tactic = agent.data.tactic;
        var battle = world.battles[agent.data.battle_id];
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