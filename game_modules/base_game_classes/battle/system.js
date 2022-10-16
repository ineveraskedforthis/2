"use strict";
// this module shoul require only characters and battles systems
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleSystem = void 0;
const systems_communication_1 = require("../../systems_communication");
const system_1 = require("../character/system");
const battle_ai_1 = require("./AI/battle_ai");
const battle_1 = require("./classes/battle");
const heap_1 = require("./classes/heap");
const events_1 = require("./events");
var battles_list = [];
var battles_dict = {};
var last_id = 0;
function time_distance(a, b) {
    return b - a;
}
var BattleSystem;
(function (BattleSystem) {
    // only creates and initialise battle
    // does not add participants
    function save() { }
    BattleSystem.save = save;
    function load() { }
    BattleSystem.load = load;
    function create_battle() {
        last_id = last_id + 1;
        let heap = new heap_1.UnitsHeap([]);
        let battle = new battle_1.Battle(last_id, heap);
        battles_list.push(battle);
        battles_dict[last_id] = battle;
        return last_id;
    }
    BattleSystem.create_battle = create_battle;
    function add_figther() {
    }
    BattleSystem.add_figther = add_figther;
    function update() {
        for (let battle of battles_list) {
            if (battle.ended)
                continue;
            const current_date = Date.now();
            // if turn lasts longer than 60 seconds, it ends automatically
            if (battle.waiting_for_input) {
                if ((battle.date_of_last_turn != '%') && (time_distance(battle.date_of_last_turn, current_date) > 60 * 1000)) {
                    const unit = battle.heap.get_selected_unit();
                    if (unit != undefined)
                        events_1.BattleEvent.EndTurn(battle, unit);
                }
            }
            // if turn is still running, then do nothing
            if (battle.waiting_for_input) {
                return;
            }
            // if battle is not waiting for input, then we need to start new turn
            events_1.BattleEvent.NewTurn(battle);
            // get information about current unit
            const unit = battle.heap.get_selected_unit();
            if (unit == undefined) {
                return;
            }
            let character = systems_communication_1.Convert.unit_to_character(unit);
            system_1.CharacterSystem.battle_update(character);
            //processing cases of player and ai separately for a now
            // if character is player, then wait for input
            if (character.is_player()) {
                battle.waiting_for_input = true;
                return;
            }
            // else ask ai to make all needed moves and end turn
            {
                AI_turn(battle);
                events_1.BattleEvent.EndTurn(battle, unit);
            }
        }
    }
    BattleSystem.update = update;
    /**  Makes moves for currently selected character depending on his battle_ai
    */
    function AI_turn(battle) {
        const unit = battle.heap.get_selected_unit();
        if (unit == undefined)
            return;
        const character = systems_communication_1.Convert.unit_to_character(unit);
        do {
            var action = battle_ai_1.BattleAI.action(battle, unit, character);
        } while (action == true);
    }
})(BattleSystem = exports.BattleSystem || (exports.BattleSystem = {}));
//      process_input(unit_index: number, input: Action) {
//         if (!this.waiting_for_input) {
//             return {action: 'action_in_progress', who: unit_index}
//         }
//         if (this.heap.selected != unit_index) {
//             let char1 = this.get_char(this.get_unit(this.heap.selected))
//             let char2 = this.get_char(this.get_unit(unit_index))
//             if (char1.id != char2.id) {
//                 return {action: 'not_your_turn', who: unit_index}
//             }
//         }
//         if (input != undefined) {
//             this.changed = true
//             let index = this.heap.selected
//             let character = this.get_char(this.get_unit(this.heap.selected))
//             if (input.action == 'move') {
//                 return  this.action(index, {action: 'move', target: input.target})
//             } else if (input.action == 'attack') {
//                 return  this.action(index, BattleAI.convert_attack_to_action(this, index, input.target, 'usual'))
//             } else if (input.action == 'fast_attack') {
//                 if(!can_fast_attack(character)) {
//                     return {action: "not_learnt"}
//                 }
//                 return  this.action(index, BattleAI.convert_attack_to_action(this, index, input.target, 'fast'))
//             } else if (input.action == 'dodge') {
//                 if(!can_dodge(character)) {
//                     return {action: "not_learnt"}
//                 }
//                 return  this.action(index, {action: 'dodge', who: index})
//             } else if (input.action == 'push_back') {
//                 if(!can_push_back(character)) {
//                     return {action: "not_learnt"}
//                 }
//                 return  this.action(index, {action: 'push_back', target: input.target})
//             } else if (input.action == 'magic_bolt') {
//                 return  this.action(index, {action: 'magic_bolt', target: input.target})
//             } else if (input.action == 'shoot') { 
//                 return  this.action(index, {action: 'shoot', target: input.target})
//             } else if (input.action == 'flee') {
//                 return  this.action(index, {action: 'flee', who: index})
//             } else if (input.action == 'switch_weapon') {
//                 return  this.action(index, {action: 'switch_weapon', who: index})
//             } else {
//                 return  this.action(index, input)
//             }
//         }        
//     }
//     get_units() {
//         return this.heap.data
//     }
//     get_unit(i: number) {
//         return this.heap.get_unit(i)
//     }
//     get_char(unit: UnitData) {
//         return this.world.get_char_from_id(unit.char_id)
//     }
//     get_data():SocketBattleData {
//         let data:SocketBattleData = {};
//         for (var i = 0; i < this.heap.data.length; i++) {
//             let unit = this.heap.data[i];
//             var character:Character = this.world.get_char_from_id(unit.char_id)
//             if (character != undefined) {
//                 data[i] = {
//                     id: unit.char_id,
//                     position: {x: unit.position.x, y: unit.position.y},
//                     tag: character.get_model(),
//                     range: character.get_range(),
//                     hp: character.get_hp(),
//                     name: character.name,
//                     ap: unit.action_points_left
//                 }
//             }
//         }
//         return data
//     }
//     add_fighter(agent:Character, team:number, position:{x:number, y: number}|undefined) {
//         console.log('add fighter')
//         if (position == undefined) {
//             let dx = Math.random() * 2
//             let dy = Math.random() * 2
//             if (team == 1) {
//                 position = {x: 0 + dx, y: 8 + dy}
//             } else {
//                 position = {x: 0 + dx, y: 0 + dy}
//             }
//         }
//         let unit = new UnitData();
//         unit.init(agent, position, team)
//         this.heap.add_unit(unit)
//         agent.set_flag('in_battle', true)
//         agent.set_in_battle_id(this.heap.data.length - 1)
//         agent.set_battle_id(this.id)
//         this.changed = true;
//     }
//     // agent joins battle on a side of team
//     join(agent: Character, team: number) {
//         console.log(agent.name + ' joins battle on a side ' + team)
//         this.add_fighter(agent, team, undefined)
//         this.send_data_start()
//     }
//     check_team_to_join(agent:Character):number|'no_interest' {
//         if (agent.faction_id == -1) return 'no_interest'
//         let data = this.get_units()
//         for (let item of data) {
//             let char_id = item.char_id
//             let char = this.world.entity_manager.chars[char_id]
//             if (char.faction_id == agent.faction_id) {
//                 return item.team
//             }
//         }
//         return 'no_interest'
//     }
//      transfer(target:{stash: Stash}, tag:material_index, x:number) {
//         this.stash.transfer(target.stash, tag, x);
//         this.changed = true
//     }
//     get_team_status(team: number) {
//         let tmp:{name: string, hp: number, next_turn: number, ap: number}[] = []
//         for (let i in this.heap.data) {
//             let unit = this.heap.data[i]
//             if (unit.team == team) {
//                 let char:Character = this.world.get_char_from_id(unit.char_id)
//                 if (char != undefined) {
//                     tmp.push({name: char.name, hp: char.get_hp(), next_turn: unit.next_turn_after, ap: unit.action_points_left})
//                 }
//             }
//         }
//         return tmp
//     }
//     get_status() {
//         let tmp:{name: string, hp: number, next_turn: number, ap: number}[] = []
//         for (let i in this.heap.data) {
//             let unit = this.heap.data[i]
//             let char:Character = this.world.get_char_from_id(unit.char_id)
//             if (char != undefined) {
//                 tmp.push({name: char.name, hp: char.get_hp(), next_turn: unit.next_turn_after, ap: unit.action_points_left})
//             }
//         }
//         return tmp
//     }
//     is_over() {
//         var team_lost: boolean[] = [];
//         for (let team = 0; team < 10; team++) {
//             team_lost[team] = true
//         }
//         for (var i = 0; i < this.heap.data.length; i++) {
//             let unit = this.heap.data[i]
//             var char: Character = this.world.get_char_from_id(unit.char_id);
//             if ((char == undefined) || (char.get_hp() == 0)) {
//                 if (!unit.dead) {
//                     unit.dead = true;
//                 }
//             } else {
//                 team_lost[unit.team] = false
//             }
//         }
//         if (this.draw == true) {
//             return 'draw';
//         } else {
//             let teams_left = 0
//             let team_not_lost = -1
//             for (let team = 0; team < 10; team++) {
//                 if (!team_lost[team]) {
//                     teams_left += 1
//                     team_not_lost = team
//                 }
//             }
//             if (teams_left > 1) {
//                 return -1
//             } else if (teams_left == 1) {
//                 return team_not_lost
//             } else {
//                 return 'draw'
//             }
//         }
//         return -1;
//     }
//     clean_up_battle() {
//         for (let i = 0; i < this.heap.get_units_amount(); i++) {
//             let unit = this.heap.get_unit(i);
//             let char:Character = this.world.get_char_from_id(unit.char_id);
//             if (char != undefined) {
//                 char.set_flag('in_battle', false);
//                 char.set_battle_id(-1)
//             }
//             this.changed = true
//         }
//         this.send_stop()
//     }
//     reward() {}    
//      reward_team(team: number) {}
//     units_amount() {
//         return this.heap.get_units_amount()
//     }
// }
// send_data_start() {
//         this.world.socket_manager.send_battle_data_start(this)
//         if (this.waiting_for_input) {
//             this.send_action({action: 'new_turn', target: this.heap.selected})
//         }
//     }
//     send_update() {
//         this.world.socket_manager.send_battle_update(this)
//         if (this.waiting_for_input) {
//             this.send_action({action: 'new_turn', target: this.heap.selected})
//         }
//     }
//     send_current_turn() {
//         this.send_action({action: 'new_turn', target: this.heap.selected})
//     }
//     send_action(a: any) {
//         this.world.socket_manager.send_battle_action(this, a)
//     }
//     send_stop(){
//         this.world.socket_manager.send_stop_battle(this)
//     }
