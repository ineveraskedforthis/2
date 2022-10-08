// this module shoul require only characters and battles systems

import { battle_id, ms } from "../../../shared/battle_data"
import { Character } from "../character/character"
import { Battle } from "./battle"
import { UnitsHeap } from "./heap"
import { UnitData } from "./unit"

var battles_list:Battle[] = []
var battles_dict:{[_ in battle_id]: Battle} = {}
var last_id:battle_id = 0 as battle_id

function time_distance(a: ms, b: ms) {
    return b - a as ms
}




export namespace BattleSystem {
    // only creates and initialise battle
    // does not add participants

    export function save() {}
    export function load() {}

    export function create_battle(): battle_id{
        last_id = last_id + 1 as battle_id
        let heap = new UnitsHeap([])
        let battle = new Battle(last_id, heap)

        battles_list.push(battle)
        battles_dict[last_id] = battle
        return last_id
    }

    export function add_figther() {

    }

    export function update() {
        for (let battle of battles_list) {
            if (battle.ended) continue;

            let current_date = Date.now() as ms

            // if unit is not moving for 60 seconds, turn ends automatically
            if ((battle.date_of_last_turn != '%') && (time_distance(battle.date_of_last_turn, current_date) > 60 * 1000)) {
                let unit = battle.heap.get_selected_unit()

                let res = process_input(unit.id, {action: 'end_turn'})
                this.send_action(res)
                this.send_update()
            }

            if ((!this.waiting_for_input)) {
                this.last_turn = current_time
                
                // heap manipulations
                let tmp = this.heap.pop()
                if (tmp == undefined) {
                    return {responce: 'no_units_left'}
                }
                let unit = this.heap.get_unit(tmp)
                let time_passed = unit.next_turn_after
                this.heap.update(time_passed)
                

                //character stuff
                let char:Character = this.world.get_char_from_id(unit.char_id)
                if ((char == undefined) || char.is_dead()) {
                    return {responce: 'dead_unit'}
                }

                char.update(0)
                let dt = unit.next_turn_after
                this.heap.update(dt)

                if (char.is_dead()){
                    unit.dead = true
                    return {responce: 'char_is_dead'}
                }

                this.send_action({action: 'new_turn', target: tmp})

                //actual actions
                if (char.is_player()) {
                    this.waiting_for_input = true
                    this.changed = true
                    return {responce: 'waiting_for_input'}
                } else {
                    let log_obj: any[] = [];
                    this.make_turn()
                    unit.end_turn()
                    
                    this.heap.push(tmp)
                    this.changed = true
                    return {responce: 'end_turn', data: log_obj}
                }
            } else {
                return {responce: 'waiting_for_input'}
            }

        }
    }

    export function flee_chance(){
        return 0.5
    }
}

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

//      make_turn(){
//         let unit = this.heap.get_selected_unit()
//         let char = this.get_char(unit)
//         let action:Action = BattleAI.action(this, unit, char);
//         while (action.action != 'end_turn') {
//             let logged_action =  this.action(this.heap.selected, action)
//             this.send_action(logged_action)
//             this.send_update()
//             action = BattleAI.action(this, unit, char);
//         }
//         this.changed = true
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