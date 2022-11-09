"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIhelper = void 0;
const racial_hostility_1 = require("../character/races/racial_hostility");
const events_1 = require("../events/events");
const systems_communication_1 = require("../systems_communication");
var AIhelper;
(function (AIhelper) {
    function enemies_in_cell(char) {
        let cell = systems_communication_1.Convert.character_to_cell(char);
        let a = cell.get_characters_list();
        for (let { id, name } of a) {
            let target_char = systems_communication_1.Convert.id_to_character(id);
            if ((0, racial_hostility_1.hostile)(char.race(), target_char.race())) {
                if (!target_char.in_battle() && !target_char.dead()) {
                    return target_char.id;
                }
            }
        }
        return -1;
    }
    AIhelper.enemies_in_cell = enemies_in_cell;
    function battles_in_cell(char) {
        let battles = [];
        let cell = systems_communication_1.Convert.character_to_cell(char);
        if (cell == undefined)
            return battles;
        let a = cell.get_characters_list();
        for (let { id, name } of a) {
            let target_char = systems_communication_1.Convert.id_to_character(id);
            if (target_char.in_battle() && !target_char.dead()) {
                battles.push(target_char.battle_id);
            }
        }
        return battles;
    }
    AIhelper.battles_in_cell = battles_in_cell;
    function check_battles_to_join(agent) {
        let battles = battles_in_cell(agent);
        for (let item of battles) {
            let battle = systems_communication_1.Convert.id_to_battle(item);
            console.log('check_battle');
            if (!(battle.ended)) {
                let team = check_team_to_join(agent, battle);
                console.log(team);
                if (team == 'no_interest')
                    continue;
                else {
                    events_1.Event.join_battle(agent, battle, team);
                    return true;
                }
            }
        }
        return false;
    }
    AIhelper.check_battles_to_join = check_battles_to_join;
    function check_team_to_join(agent, battle, exclude) {
        let data = battle.heap.raw_data;
        for (let item of data) {
            const target = systems_communication_1.Convert.unit_to_character(item);
            if (agent.race() == target.race() && (item.team != exclude) && (!target.dead())) {
                return item.team;
            }
        }
        return 'no_interest';
    }
    AIhelper.check_team_to_join = check_team_to_join;
})(AIhelper = exports.AIhelper || (exports.AIhelper = {}));
