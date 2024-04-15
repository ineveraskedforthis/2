"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleSystem = void 0;
const systems_communication_1 = require("../systems_communication");
const events_1 = require("./events");
const VALUES_1 = require("./VALUES");
const ACTIONS_AI_DECISION_1 = require("./ACTIONS_AI_DECISION");
const alerts_1 = require("../client_communication/network_actions/alerts");
const user_manager_1 = require("../client_communication/user_manager");
const data_objects_1 = require("../data/data_objects");
const heap_1 = require("./classes/heap");
var last_character_id = 0;
function time_distance(a, b) {
    return b - a;
}
var BattleSystem;
(function (BattleSystem) {
    function get_empty_team(battle) {
        let max = 0;
        battle.heap.map(data_objects_1.Data.Characters.from_id).forEach((unit) => {
            if (unit == undefined)
                return;
            if (max < unit.team) {
                max = unit.team;
            }
        });
        return max + 1;
    }
    BattleSystem.get_empty_team = get_empty_team;
    // team 0 is a defender and spawns at the center
    // other teams spawn around center
    function create_unit(character, team, battle) {
        last_character_id = last_character_id + 1;
        // deciding position
        if (team == 0) {
            const dx = Math.random() * 2 - 1;
            const dy = Math.random() * 2 - 1;
            var position = { x: 0 + dx, y: 0 + dy };
        }
        else {
            let dx = Math.random() * 2 - 1;
            let dy = Math.random() * 2 - 1;
            const norm = Math.sqrt((dx * dx + dy * dy));
            dx = dx + dx / norm * VALUES_1.BattleValues.HALFWIDTH / 2;
            dy = dy + dy / norm * VALUES_1.BattleValues.HALFHEIGHT / 2;
            // console.log(dx, dy)
            var position = { x: 0 + dx, y: 0 + dy };
        }
        // setting up character
        character.position = position;
        character.team = team;
        character.action_points_left = 3;
        character.action_points_max = 10;
        character.next_turn_after = heap_1.CharactersHeap.get_max(battle) + Math.floor((Math.random() * 50));
    }
    BattleSystem.create_unit = create_unit;
    function add_figther(battle, character, team) {
        if (character.in_battle())
            return;
        const unit = create_unit(character, team, battle);
        character.battle_id = battle.id;
        events_1.BattleEvent.NewUnit(battle, character);
        console.log(`${character.get_name()} joins battle ${battle.id}`);
        alerts_1.Alerts.battle_update_data(battle);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 22 /* UI_Part.BATTLE */);
        return unit;
    }
    BattleSystem.add_figther = add_figther;
    function battle_finished(battle) {
        const current_unit = heap_1.CharactersHeap.get_selected_unit(battle);
        if (current_unit == undefined) {
            return true;
        }
        for (let i = 0; i < battle.last; i++) {
            const unit = battle.heap[i];
            if (unit == undefined)
                continue;
            const character = data_objects_1.Data.Characters.from_id(unit);
            if (!character.dead()) {
                return current_unit;
            }
        }
        battle.stopped = true;
        return true;
    }
    BattleSystem.battle_finished = battle_finished;
    function update(dt) {
        const current_date = Date.now();
        data_objects_1.Data.Battles.for_each(battle => {
            if (battle.stopped) {
                return;
            }
            const unit = battle_finished(battle);
            if (unit === true) {
                stop_battle(battle);
                return;
            }
            // console.log('turn of ', character.get_name())
            if (unit.dead()) {
                events_1.BattleEvent.EndTurn(battle, unit);
                return;
            }
            // if turn lasts longer than 60 seconds, it ends automatically
            if (battle.waiting_for_input) {
                // console.log('waiting')
                if ((battle.date_of_last_turn != '%') && (time_distance(battle.date_of_last_turn, current_date) > 60 * 1000)) {
                    // console.log('too long, end turn')
                    events_1.BattleEvent.EndTurn(battle, unit);
                }
                if ((battle.date_of_last_turn == '%')) {
                    battle.date_of_last_turn = Date.now();
                }
                return;
            }
            //processing cases of player and ai separately for a now
            // if character is player, then wait for input
            if (unit.is_player()) {
                // console.log('player turn, wait for input')
                battle.waiting_for_input = true;
                return;
            }
            // give AI 1 seconds before ending a turn to imitate spending time to a turn
            // wait 1 seconds for an AI turn
            if (battle.ai_timer != undefined) {
                battle.ai_timer = battle.ai_timer + dt;
                if (battle.ai_timer < 500) {
                    return;
                }
                else {
                    battle.ai_timer = undefined;
                    return;
                }
            }
            else {
                // console.log('decision AI', character.get_name())
                (0, ACTIONS_AI_DECISION_1.decide_AI_battle_action)(battle, unit);
                // launch the timer
                battle.ai_timer = 0;
            }
        });
    }
    BattleSystem.update = update;
    function data(battle) {
        let data = {};
        battle.heap.map(data_objects_1.Data.Characters.from_id).forEach((unit) => {
            if (unit == undefined)
                return;
            if (!unit.dead())
                data[unit.id] = (systems_communication_1.Convert.unit_to_unit_socket(unit));
        });
        return data;
    }
    BattleSystem.data = data;
    function support_in_battle(character, target) {
        console.log('attempt to support in battle');
        if (character.id == target.id)
            return undefined;
        if (!target.in_battle())
            return;
        if (character.cell_id != target.cell_id) {
            return undefined;
        }
        console.log('validated');
        const battle = systems_communication_1.Convert.character_to_battle(target);
        if (battle == undefined)
            return;
        add_figther(battle, character, target.team);
    }
    BattleSystem.support_in_battle = support_in_battle;
    function start_battle(attacker, defender) {
        console.log('attempt to start battle between ' + attacker.name + ' and ' + defender.name);
        if (attacker.id == defender.id) {
            console.log('wrong_cell');
            return undefined;
        }
        if (attacker.in_battle()) {
            console.log('attacker is alread in battle');
            return undefined;
        }
        if (attacker.cell_id != defender.cell_id) {
            console.log('different cells');
            return undefined;
        }
        console.log('valid participants');
        // two cases
        // if defender is in battle, attempt to join it against him as a new team
        // else create new battle
        const battle = systems_communication_1.Convert.character_to_battle(defender);
        if ((battle != undefined)) {
            let team = BattleSystem.get_empty_team(battle);
            add_figther(battle, attacker, team);
        }
        else {
            const battle = data_objects_1.Data.Battles.create();
            add_figther(battle, defender, 0);
            add_figther(battle, attacker, 1);
        }
    }
    BattleSystem.start_battle = start_battle;
    function stop_battle(battle) {
        console.log("stop battle: ", battle.id);
        battle.stopped = true;
        const to_delete = [];
        for (let unit of battle.heap) {
            if (unit != undefined)
                to_delete.push(unit);
        }
        for (let unit of to_delete) {
            const character = data_objects_1.Data.Characters.from_id(unit);
            heap_1.CharactersHeap.delete_unit(battle, character);
            character.battle_id = undefined;
            user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 22 /* UI_Part.BATTLE */);
        }
    }
    BattleSystem.stop_battle = stop_battle;
})(BattleSystem || (exports.BattleSystem = BattleSystem = {}));
