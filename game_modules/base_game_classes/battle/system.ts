// this module shoul require only characters and battles systems

import { action_points, BattleData, battle_id, battle_position, ms, unit_id } from "../../../shared/battle_data"
import { Convert } from "../../systems_communication"
import { Character } from "../character/character"
import { CharacterSystem } from "../character/system"
import { BattleAI } from "./AI/battle_ai"
import { Battle } from "./classes/battle"
import { UnitsHeap } from "./classes/heap"
import { Unit } from "./classes/unit"
import { BattleEvent } from "./events"

var battles_list:Battle[] = []
var battles_dict:{[_ in battle_id]: Battle} = {}
var last_id:battle_id = 0 as battle_id
var last_unit_id = 0 as unit_id

function time_distance(a: ms, b: ms) {
    return b - a as ms
}




export namespace BattleSystem {
    
    export function id_to_battle(id: battle_id) {
        return battles_dict[id]
    }

    export function save() {}
    export function load() {}

    // only creates and initialise battle
    // does not add participants
    export function create_battle(): battle_id{
        last_id = last_id + 1 as battle_id
        let heap = new UnitsHeap([])
        let battle = new Battle(last_id, heap)

        battles_list.push(battle)
        battles_dict[last_id] = battle
        return last_id
    }

    export function create_unit(character: Character, team: number): Unit {
        last_unit_id = last_unit_id + 1 as unit_id
        
        // deciding position
        const dx = Math.random() * 2
        const dy = Math.random() * 2
        if (team == 1) {
            var position = {x: 0 + dx, y: 8 + dy} as battle_position
        } else {
            var position = {x: 0 + dx, y: 0 + dy} as battle_position
        }

        const unit = new Unit(last_unit_id, position, team,
            10 as action_points, 10 as action_points, 10 as action_points, 3 as action_points, 
            character.id)
        
        return unit
    }

//     add_fighter(agent:Character, team:number, position:{x:number, y: number}|undefined) {
//         console.log('add fighter')
        
//         if (position == undefined) {
//             
//             if (team == 1) {
//                 position = {x: 0 + dx, y: 8 + dy}
//             } else {
//                 position = {x: 0 + dx, y: 0 + dy}
//             }
//         }

//         let unit = new Unit();
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

    export function add_figther(battle_id: battle_id, character: Character, team: number) {
        const battle = battles_dict[battle_id]
        if (battle == undefined) return
        
        const unit = create_unit(character, team)
        BattleEvent.NewUnit(battle, unit)
    }

    export function update() {
        for (let battle of battles_list) {
            if (battle.ended) continue;

            const current_date = Date.now() as ms

            // if turn lasts longer than 60 seconds, it ends automatically
            if (battle.waiting_for_input) {
                if ((battle.date_of_last_turn != '%') && (time_distance(battle.date_of_last_turn, current_date) > 60 * 1000)) {
                    const unit = battle.heap.get_selected_unit()
                    if (unit != undefined) BattleEvent.EndTurn(battle, unit)
                }
            }
            // if turn is still running, then do nothing
            if (battle.waiting_for_input) {
                return
            }

            // if battle is not waiting for input, then we need to start new turn
            BattleEvent.NewTurn(battle)

            // get information about current unit
            const unit = battle.heap.get_selected_unit()
            if (unit == undefined) {return}
            let character:Character = Convert.unit_to_character(unit)

            CharacterSystem.battle_update(character)

            //processing cases of player and ai separately for a now
            // if character is player, then wait for input
            if (character.is_player()) {
                battle.waiting_for_input = true
                return
            } 

            // else ask ai to make all needed moves and end turn
            {
                AI_turn(battle)
                BattleEvent.EndTurn(battle, unit)
            }
        }
    }

    /**  Makes moves for currently selected character depending on his battle_ai
    */
    function AI_turn(battle: Battle){
        const unit = battle.heap.get_selected_unit()
        if (unit == undefined) return
        const character = Convert.unit_to_character(unit)
        do {
            var action = BattleAI.action(battle, unit, character);
        } while (action == true)
    }

    export function data(battle: Battle):BattleData {
        let data:BattleData = {};
        for (var i = 0; i < battle.heap.raw_data.length; i++) {
            let unit = battle.heap.raw_data[i];
            data[i] = Convert.unit_to_unit_socket(unit)
        }
        return data
    }

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

//     get_char(unit: Unit) {
//         return this.world.get_char_from_id(unit.char_id)
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

//     send_action(a: any) {
//         this.world.socket_manager.send_battle_action(this, a)
//     }

//     send_stop(){
//         this.world.socket_manager.send_stop_battle(this)
//     }