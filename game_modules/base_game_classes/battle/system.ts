// this module shoul require only characters and battles systems

import { battle_id } from "../../../shared/battle_data"
import { Battle } from "./battle"
import { UnitsHeap } from "./heap"

var battles_list:Battle[] = []
var battles_dict:{[_ in battle_id]: Battle} = {}
var last_id:battle_id = 0 as battle_id

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

            let current_time = Date.now()
            if (current_time - this.last_turn > 60 * 1000) {
                let unit = this.heap.get_selected_unit()
                let char = this.get_char(unit)

                let res =  this.process_input(char.get_in_battle_id(), {action: 'end_turn'})
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
}



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

//      action(, unit_index: number, action: Action) {
//         console.log('battle action')
//         console.log(action)

//         let unit = this.heap.get_unit(unit_index)
//         var character:Character = this.world.get_char_from_id(unit.char_id);

//         //no action
//         if (action.action == null) {
//             return {action: 'pff', who: unit_index};
//         }


//         //move toward enemy
//         if (action.action == 'move') {
//             let tmp = geom.minus(action.target, unit.position)

//             let MOVE_COST = 3
//             if (geom.norm(tmp) * MOVE_COST > unit.action_points_left) {
//                 tmp = geom.mult(geom.normalize(tmp), unit.action_points_left / MOVE_COST)
//             }
//             unit.position.x = tmp.x + unit.position.x;
//             unit.position.y = tmp.y + unit.position.y;
//             let points_spent = geom.norm(tmp) * MOVE_COST
//             unit.action_points_left -= points_spent
//             this.changed = true
//             return {action: 'move', who: unit_index, target: unit.position, actor_name: character.name}
//         }

        
//         if (action.action == 'attack') {
//             if (action.target != null) {

//                 let unit2 = this.heap.get_unit(action.target);
//                 let char:Character = this.world.get_char_from_id(unit.char_id)

//                 if (unit.action_points_left < 3) {
//                     return { action: 'not_enough_ap', who: unit_index}
//                 }

//                 let dist = geom.dist(unit.position, unit2.position)

//                 if (dist > char.get_range()) {
//                     return { action: 'not_enough_range', who: unit_index}
//                 }

//                 let target_char = this.world.get_char_from_id(unit2.char_id);
//                 let dodge_flag = (unit2.dodge_turns > 0)
//                 let result =  character.attack(target_char, 'usual', dodge_flag, dist);
//                 unit.action_points_left -= 3
//                 this.changed = true
//                 return {action: 'attack', attacker: unit_index, target: action.target, result: result, actor_name: character.name};
//             }

//             return { action: 'no_target_selected' };
//         } 

//         if (action.action == 'shoot') {
//             if (!can_shoot(character)) {
//                 return {action: "not_learnt", who: unit_index}
//             }
//             if (action.target == null) {
//                 return { action: 'no_target_selected', who: unit_index}
//             }
//             if (unit.action_points_left < 3) {
//                 return { action: 'not_enough_ap', who: unit_index}
//             }

//             let target_unit = this.heap.get_unit(action.target);
//             let target_char = this.world.get_char_from_id(target_unit.char_id);
//             let dodge_flag = (target_unit.dodge_turns > 0)
//             let dist = geom.dist(unit.position, target_unit.position)

//             character.stash.inc(ARROW_BONE, -1)

//             let result =  character.attack(target_char, 'ranged', dodge_flag, dist);
//             unit.action_points_left -= 3
//             this.changed = true

//             return {action: 'attack', attacker: unit_index, target: action.target, result: result, actor_name: character.name};
//         }

//         if (action.action == 'magic_bolt') {
//             if (!can_cast_magic_bolt(character)) {
//                 // console.log('???')
//                 return {action: "not_learnt", who: unit_index}
//             }
//             if (action.target == null) {
//                 return { action: 'no_target_selected', who: unit_index}
//             }
//             if (unit.action_points_left < 3) {
//                 return { action: 'not_enough_ap', who: unit_index}
//             }
            
//             let target_unit = this.heap.get_unit(action.target);
//             let target_char = this.world.get_char_from_id(target_unit.char_id);

//             if (character.skills.perks.magic_bolt != true) {
//                 character.stash.inc(ZAZ, -1)
//             }

//             let result =  character.spell_attack(target_char, 'bolt');
//             unit.action_points_left -= 3
//             this.changed = true

//             return {action: 'attack', attacker: unit_index, target: action.target, result: result, actor_name: character.name};
//         }

//         if (action.action == 'push_back') {
//             if(!can_push_back(character)) {
//                 return {action: "not_learnt", who: unit_index}
//             }
//             if (action.target != null) {
//                 let unit2 = this.heap.get_unit(action.target);
//                 let char:Character = this.world.get_char_from_id(unit.char_id)

//                 if (unit.action_points_left < 5) {
//                     return { action: 'not_enough_ap', who: unit_index}
//                 }

//                 let range = char.get_range()
//                 let dist = geom.dist(unit.position, unit2.position)

//                 if (dist > range) {
//                     return { action: 'not_enough_range', who: unit_index}
//                 }

//                 let target_char = this.world.get_char_from_id(unit2.char_id);
//                 let dodge_flag = (unit2.dodge_turns > 0)
                
                
//                 let result =  character.attack(target_char, 'heavy', dodge_flag, dist);
//                 unit.action_points_left -= 5
//                 this.changed = true

//                 if (!(result.flags.evade || result.flags.miss)) {
//                     let a = unit.position
//                     let b = unit2.position
//                     let c = {x: b.x - a.x, y: b.y - a.y}
//                     let norm = Math.sqrt(c.x * c.x + c.y * c.y)
//                     let power_ratio = character.get_phys_power() / target_char.get_phys_power()
//                     let scale = range * power_ratio / norm / 2

//                     c = {x: c.x * scale, y: c.y * scale}

//                     unit2.position = {x: b.x + c.x, y: b.y + c.y}
//                 }

//                 return {action: 'attack', attacker: unit_index, target: action.target, result: result, actor_name: character.name};
//             }

//             return { action: 'no_target_selected' };
//         }

//         if (action.action == 'fast_attack') {
//             if(!can_fast_attack(character)) {
//                 return {action: "not_learnt", who: unit_index}
//             }
//             if (action.target != null) {
//                 let unit2 = this.heap.get_unit(action.target);
//                 let char:Character = this.world.get_char_from_id(unit.char_id)

//                 if (unit.action_points_left < 1) {
//                     return { action: 'not_enough_ap', who: unit_index}
//                 }
                
//                 let dist = geom.dist(unit.position, unit2.position)

//                 if (dist > char.get_range()) {
//                     return { action: 'not_enough_range', who: unit_index}
//                 }

//                 let target_char = this.world.get_char_from_id(unit2.char_id);
//                 let dodge_flag = (unit2.dodge_turns > 0)
                
//                 let result =  character.attack(target_char, 'fast', dodge_flag, dist);
//                 unit.action_points_left -= 1
//                 this.changed = true
//                 return {action: 'attack', attacker: unit_index, target: action.target, result: result, actor_name: character.name};
//             }

//             return { action: 'no_target_selected' };
//         }

//         if (action.action == 'dodge') {

//             if (!can_dodge(character)) {
//                 return { action: "not_learnt", who: unit_index}
//             }

//             if (unit.action_points_left < 4) {
//                 return { action: 'not_enough_ap', who: unit_index}
//             }

//             unit.dodge_turns = 2
//             unit.action_points_left -= 4
//             return {action: 'dodge', who: unit_index}
//         }

//         if (action.action == 'flee') {
//             if (unit.action_points_left >= 3) {
//                 unit.action_points_left -= 3
//                 let dice = Math.random();
//                 this.changed = true
//                 if (dice <= flee_chance(character)) {
//                     this.draw = true;
                    
//                     return {action: 'flee', who: unit_index};
//                 } else {
//                     return {action: 'flee-failed', who: unit_index};
//                 }
//             }
//             return {action: 'not_enough_ap', who: unit_index}
//         } 

//         if (action.action == 'switch_weapon') {
//             // console.log('????')
//             if (unit.action_points_left < 3) {
//                 return {action: 'not_enough_ap', who: unit_index}
//             }
//             unit.action_points_left -= 3
//             character.switch_weapon()
//             return {action: 'switch_weapon', who: unit_index}
//         }
        

//         if (action.action == 'spell_target') {
//             if (unit.action_points_left > 3) {
//                 let spell_tag = action.spell_tag;
//                 let unit2 = this.heap.get_unit(action.target);
//                 let target_char = this.world.get_char_from_id(unit2.char_id);
//                 let result =  character.spell_attack(target_char, spell_tag);
//                 if (result.flags.close_distance) {
//                     let dist = geom.dist(unit.position, unit2.position)
//                     if (dist > 1.9) {
//                         let v = geom.minus(unit2.position, unit.position);
//                         let u = geom.mult(geom.normalize(v), 0.9);
//                         v = geom.minus(v, u)
//                         unit.position.x = v.x
//                         unit.position.y = v.y
//                     }
//                     result.new_pos = {x: unit.position.x, y: unit.position.y};
//                 }
//                 unit.action_points_left -= 3
//                 this.changed = true
//                 return {action: spell_tag, who: unit_index, result: result, actor_name: character.name};
//             }
//         }

//         if (action.action == 'end_turn') {
//             this.waiting_for_input = false
//             unit.end_turn()
//             this.heap.push(unit_index)
//             this.changed = true
//             return {action: 'end_turn', who: unit_index}
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

//     units_amount() {
//         return this.heap.get_units_amount()
//     }
// }