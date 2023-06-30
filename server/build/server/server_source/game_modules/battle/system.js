"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleSystem = void 0;
const systems_communication_1 = require("../systems_communication");
const battle_1 = require("./classes/battle");
const heap_1 = require("./classes/heap");
const unit_1 = require("./classes/unit");
const events_1 = require("./events");
const fs_1 = __importDefault(require("fs"));
const data_1 = require("../data");
const path_1 = __importDefault(require("path"));
const SAVE_GAME_PATH_1 = require("../../SAVE_GAME_PATH");
const VALUES_1 = require("./VALUES");
const ACTIONS_AI_DECISION_1 = require("./ACTIONS_AI_DECISION");
const alerts_1 = require("../client_communication/network_actions/alerts");
const user_manager_1 = require("../client_communication/user_manager");
var last_unit_id = 0;
function time_distance(a, b) {
    return b - a;
}
const save_path = path_1.default.join(SAVE_GAME_PATH_1.SAVE_GAME_PATH, 'battles.txt');
var BattleSystem;
(function (BattleSystem) {
    function id_to_unit(id, battle) {
        return battle.heap.get_unit(id);
    }
    BattleSystem.id_to_unit = id_to_unit;
    function load() {
        console.log('loading battles');
        if (!fs_1.default.existsSync(save_path)) {
            fs_1.default.writeFileSync(save_path, '');
        }
        let data = fs_1.default.readFileSync(save_path).toString();
        let lines = data.split('\n');
        for (let line of lines) {
            if (line == '') {
                continue;
            }
            const battle = string_to_battle(line);
            if (battle.date_of_last_turn == '%') {
                battle.date_of_last_turn = Date.now();
            }
            data_1.Data.Battle.set(battle.id, battle);
            const last_id = data_1.Data.Battle.id();
            data_1.Data.Battle.set_id(Math.max(battle.id, last_id));
        }
        console.log('battles loaded');
    }
    BattleSystem.load = load;
    function save() {
        console.log('saving battles');
        let str = '';
        for (let item of data_1.Data.Battle.list()) {
            if (battle_finished(item)) {
                stop_battle(item);
            }
            str = str + battle_to_string(item) + '\n';
        }
        fs_1.default.writeFileSync(save_path, str);
        console.log('battles saved');
    }
    BattleSystem.save = save;
    function battle_to_string(battle) {
        return JSON.stringify(battle);
    }
    function string_to_battle(s) {
        const json = JSON.parse(s);
        const battle = new battle_1.Battle(json.id, json_to_heap(json.heap));
        const unit = battle.heap.get_selected_unit();
        if (unit != undefined) {
            const character = systems_communication_1.Convert.unit_to_character(unit);
            if (character.is_player()) {
                battle.waiting_for_input = true;
            }
            else {
                battle.waiting_for_input = false;
            }
        }
        else {
            battle.waiting_for_input = false;
        }
        // battle.ended = json.ended
        battle.last_event_index = json.last_event_index;
        battle.grace_period = json.grace_period || 0;
        return battle;
    }
    function json_to_heap(s) {
        const h = new heap_1.UnitsHeap([]);
        for (let unit of Object.values(s.data)) {
            const character = systems_communication_1.Convert.unit_to_character(unit);
            if (character != undefined)
                h.add_unit(unit);
        }
        return h;
    }
    // only creates and initialise battle
    // does not add participants
    function create_battle() {
        data_1.Data.Battle.increase_id();
        const last_id = data_1.Data.Battle.id();
        let heap = new heap_1.UnitsHeap([]);
        let battle = new battle_1.Battle(last_id, heap);
        battle.grace_period = 6;
        data_1.Data.Battle.set(last_id, battle);
        return last_id;
    }
    BattleSystem.create_battle = create_battle;
    function get_empty_team(battle) {
        let max = 0;
        for (let unit of Object.values(battle.heap.data)) {
            if (max < unit.team) {
                max = unit.team;
            }
        }
        return max + 1;
    }
    BattleSystem.get_empty_team = get_empty_team;
    // team 0 is a defender and spawns at the center
    // other teams spawn around center
    function create_unit(character, team, battle) {
        last_unit_id = last_unit_id + 1;
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
        const unit = new unit_1.Unit(last_unit_id, position, team, 3, 10, 100, 4, character.id, battle.heap.get_max() + Math.floor((Math.random() * 50)));
        return unit;
    }
    BattleSystem.create_unit = create_unit;
    function add_figther(battle, character, team) {
        if (character.in_battle())
            return;
        const unit = create_unit(character, team, battle);
        events_1.BattleEvent.NewUnit(battle, unit);
        systems_communication_1.Link.character_battle_unit(character, battle, unit);
        console.log(`${character.get_name()} joins battle ${battle.id}`);
        alerts_1.Alerts.battle_update_data(battle);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 18 /* UI_Part.BATTLE */);
        return unit;
    }
    BattleSystem.add_figther = add_figther;
    function battle_finished(battle) {
        const current_unit = battle.heap.get_selected_unit();
        if (current_unit == undefined) {
            return true;
        }
        for (const unit of Object.values(battle.heap.data)) {
            const character = systems_communication_1.Convert.unit_to_character(unit);
            if (!character.dead()) {
                return current_unit;
            }
        }
        return true;
    }
    BattleSystem.battle_finished = battle_finished;
    function update(dt) {
        const current_date = Date.now();
        for (let battle of data_1.Data.Battle.list()) {
            const unit = battle_finished(battle);
            if (unit === true) {
                stop_battle(battle);
                continue;
            }
            let character = systems_communication_1.Convert.unit_to_character(unit);
            // console.log('turn of ', character.get_name())       
            if (character.dead()) {
                events_1.BattleEvent.EndTurn(battle, unit);
                continue;
            }
            // if turn lasts longer than 60 seconds, it ends automatically
            if (battle.waiting_for_input) {
                // console.log('waiting')
                if ((battle.date_of_last_turn != '%') && (time_distance(battle.date_of_last_turn, current_date) > 60 * 1000)) {
                    // console.log('too long, end turn')
                    events_1.BattleEvent.EndTurn(battle, unit);
                }
                continue;
            }
            //processing cases of player and ai separately for a now
            // if character is player, then wait for input
            if (character.is_player()) {
                // console.log('player turn, wait for input')
                battle.waiting_for_input = true;
                continue;
            }
            // give AI 1 seconds before ending a turn to imitate spending time to a turn
            // wait 1 seconds for an AI turn
            if (battle.ai_timer != undefined) {
                battle.ai_timer = battle.ai_timer + dt;
                if (battle.ai_timer < 500) {
                    continue;
                }
                else {
                    battle.ai_timer = undefined;
                    continue;
                }
            }
            else {
                // console.log('decision AI', character.get_name())
                (0, ACTIONS_AI_DECISION_1.decide_AI_battle_action)(battle, character, unit);
                // launch the timer
                battle.ai_timer = 0;
            }
        }
    }
    BattleSystem.update = update;
    function data(battle) {
        let data = {};
        for (let unit of Object.values(battle.heap.data)) {
            let character = systems_communication_1.Convert.unit_to_character(unit);
            if (!character.dead())
                data[unit.id] = (systems_communication_1.Convert.unit_to_unit_socket(unit));
        }
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
        const unit_target = systems_communication_1.Convert.character_to_unit(target);
        if (unit_target == undefined)
            return;
        add_figther(battle, character, unit_target.team);
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
        const unit_def = systems_communication_1.Convert.character_to_unit(defender);
        if ((battle != undefined) && (unit_def != undefined)) {
            let team = BattleSystem.get_empty_team(battle);
            add_figther(battle, attacker, team);
        }
        else {
            const battle_id = BattleSystem.create_battle();
            const battle = systems_communication_1.Convert.id_to_battle(battle_id);
            add_figther(battle, defender, 0);
            add_figther(battle, attacker, 1);
        }
    }
    BattleSystem.start_battle = start_battle;
    function stop_battle(battle) {
        for (let unit of Object.values(battle.heap.data)) {
            const character = systems_communication_1.Convert.unit_to_character(unit);
            systems_communication_1.Unlink.character_and_battle(character);
            user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 18 /* UI_Part.BATTLE */);
        }
    }
    BattleSystem.stop_battle = stop_battle;
})(BattleSystem = exports.BattleSystem || (exports.BattleSystem = {}));
