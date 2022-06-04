
import { Stash } from "./base_game_classes/stash";

var common = require("./common.js");
var {constants} = require("./static_data/constants.js");

import {geom} from './geom'
var Savings = require("./base_game_classes/savings.js");
import {BattleAI} from './battle_ai'
import type {CharacterGenericPart} from './base_game_classes/character_generic_part'
import { World } from "./world";
import { ITEM_MATERIAL } from "./static_data/item_tags";
import { material_index } from "./manager_classes/materials_manager";


export interface MoveAction {action: "move", target: {x: number, y:number}}
export interface AttackAction {action: "attack", target: number}
interface FleeAction {action: "flee"}
interface SpellTargetAction {action: "spell_target", target: number, spell_tag: "power_bolt"|"charge"}
interface EndTurn {action: 'end_turn'}
interface NullAction {action: null}
export type Action = MoveAction|AttackAction|FleeAction|SpellTargetAction|EndTurn|NullAction
export type ActionTag = 'move'|'attack'|'flee'|'spell_target'|'end_turn'|null

type ActionLog = Action[]

class UnitsHeap {
    data: UnitData[];
    last: number;
    heap: number[];
    selected: number;
    changed: boolean;

    constructor() {
        this.data = []
        this.heap = []
        this.last = 0;
        this.selected = -1
        this.changed = false
    }

    get_value(i: number) {
        return this.data[this.heap[i]].next_turn_after;
    }

    get_units_amount() {
        return this.data.length
    }

    get_unit(i: number): UnitData {
        return this.data[i]
    }

    get_selected_unit(): UnitData {
        return this.data[this.selected]
    }

    push(obj: number) {
        this.heap[this.last] = obj;
        this.last += 1;
        this.shift_up(this.last - 1)
        this.changed = true
    }

    shift_up(i:number) {
        let tmp = i;
        while (tmp > 0 && this.get_value(tmp) < this.get_value(Math.floor((tmp - 1) / 2))) {
            this.swap(tmp, Math.floor((tmp - 1) / 2))
            tmp = Math.floor((tmp - 1) / 2)
        }
        this.changed = true
    }

    shift_down(i: number) {
        let tmp = i;
        while (tmp * 2 + 1 < this.last) {
            if (tmp * 2 + 2 < this.last) {
                if ((this.get_value(tmp * 2 + 2) < this.get_value(tmp * 2 + 1)) && (this.get_value(tmp * 2 + 2) < this.get_value(tmp))) {
                    this.swap(tmp, tmp * 2 + 2)
                    tmp = tmp * 2 + 2
                } else if (this.get_value(tmp * 2 + 1) < this.get_value(tmp)) {
                    this.swap(tmp, tmp * 2 + 1)
                    tmp = tmp * 2 + 1
                } else {
                    break
                }
            } else if (this.get_value(tmp * 2 + 1) < this.get_value(tmp)) {
                this.swap(tmp, tmp * 2 + 1)
                tmp = tmp * 2 + 1
            } else {
                break
            }
        }
        this.changed = true
    }

    add_unit(u: UnitData) {
        this.data.push(u);
        this.push(this.data.length - 1)
        this.changed = true
    }

    swap(a: number, b: number) {
        let s = this.heap[a];
        this.heap[a] = this.heap[b]
        this.heap[b] = s
        this.changed = true
    }

    pop():number|undefined {
        if (this.last == 0) {
            return undefined
        }
        let tmp = this.heap[0]
        this.selected = tmp;
        this.last -= 1
        this.heap[0] = this.heap[this.last]
        this.heap.length = this.last
        this.shift_down(0);
        this.changed = true
        return tmp
    }

    update(dt: number) {
        for (let i in this.data) {
            this.data[i].update(dt)
        }
        this.changed = true
    }

    get_json() {
        return {
            data: this.data,
            last: this.last,
            heap: this.heap,
            selected: this.selected
        }
    }

    load_from_json(j: UnitsHeap) {
        for (let i in j.data) {
            let unit = new UnitData()
            unit.load_from_json(j.data[i])
            this.data.push(unit)
        }
        this.last = j.last
        this.heap = j.heap
        this.selected = j.selected
    }
}
        
export class UnitData {
    action_points_left: number;
    action_points_max: number;
    next_turn_after: number;
    initiative: number;
    speed: number;
    position: {x: number, y: number};
    char_id: number
    team: number
    dead: boolean


    constructor() {
        this.action_points_left = 0;
        this.action_points_max = 0;
        this.initiative = 100
        this.speed = 0
        this.next_turn_after = 100
        this.position = {x: 0, y: 0}
        this.char_id = -1
        this.team = -1
        this.dead = true
    }

    init(char:CharacterGenericPart, position: {x: number, y: number}, team: number) {
        let ap = char.get_action_points()
        this.action_points_left = ap;
        this.action_points_max = ap;
        this.initiative = char.get_initiative()
        this.speed = char.get_speed()
        this.next_turn_after = char.get_initiative()
        this.position = position
        this.char_id = char.id
        this.team = team
        this.dead = false
    }

    load_from_json(data: UnitData) {
        this.action_points_left = data.action_points_left;
        this.action_points_max = data.action_points_max;
        this.initiative = data.initiative
        this.speed = data.speed
        this.next_turn_after = data.next_turn_after
        this.position = data.position
        this.char_id = data.char_id
        this.team = data.team
        this.dead = data.dead
    }

    update(dt: number) {
        this.next_turn_after = this.next_turn_after - dt
    }

    end_turn() {
        this.next_turn_after = this.initiative;
        this.action_points_left = Math.min((this.action_points_left + this.speed), this.action_points_max);
    }
}


export class BattleReworked2 {
    world: World;
    heap: UnitsHeap;
    id: number;
    savings: any;
    stash: Stash;
    changed: boolean;
    draw: boolean;
    waiting_for_input:boolean;
    ended: boolean


    constructor(world: any) {
        this.heap = new UnitsHeap();
        this.world = world;
        this.id = -1
        this.savings = new Savings()
        this.stash = new Stash()
        this.changed = false
        this.waiting_for_input = false
        this.draw = false
        this.ended = false
    }

    async init(pool: any) {
        this.id = await this.load_to_db(pool);
        return this.id;
    }

    async load_to_db(pool: any) {
        let res =  await common.send_query(pool, constants.new_battle_query, [this.heap.get_json(), this.savings.get_json(), this.stash.get_json(), this.waiting_for_input]);
        return res.rows[0].id
    }

    load_from_json(data: any) {
        this.id = data.id
        this.heap.load_from_json(data.heap)
        this.savings.load_from_json(data.savings)
        this.stash.load_from_json(data.stash)
        this.waiting_for_input = data.waiting_for_input
    }

    async save_to_db(pool: any) {
        await common.send_query(pool, constants.update_battle_query, [this.id, this.heap.get_json(), this.savings.get_json(), this.stash.get_json(), this.waiting_for_input])
        this.changed = false
    }

    async delete_from_db(pool: any) {
        await common.send_query(pool, constants.delete_battle_query, [this.id]);
    }

    // networking
    
    send_data_start() {
        this.world.socket_manager.send_battle_data_start(this)
        if (this.waiting_for_input) {
            this.send_action({action: 'new_turn', target: this.heap.selected})
        }
    }

    send_update() {
        this.world.socket_manager.send_battle_update(this)
        if (this.waiting_for_input) {
            this.send_action({action: 'new_turn', target: this.heap.selected})
        }
    }

    send_current_turn() {
        this.send_action({action: 'new_turn', target: this.heap.selected})
    }

    send_action(a: any) {
        this.world.socket_manager.send_battle_action(this, a)
    }

    send_stop(){
        this.world.socket_manager.send_stop_battle(this)
    }

    async update(pool:any) {
        if (this.changed || this.heap.changed) {
            this.save_to_db(pool)
        }

        if (!this.waiting_for_input) {
            // heap manipulations
            let tmp = this.heap.pop()
            if (tmp == undefined) {
                return {responce: 'no_units_left'}
            }
            let unit = this.heap.get_unit(tmp)
            let time_passed = unit.next_turn_after
            this.heap.update(time_passed)
            

            //character stuff
            let char:CharacterGenericPart = this.world.get_char_from_id(unit.char_id)
            if ((char == undefined) || char.is_dead()) {
                return {responce: 'dead_unit'}
            }

            await char.update(pool, 0)
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
                await this.make_turn(pool)
                unit.end_turn()
                this.heap.push(tmp)
                this.changed = true
                return {responce: 'end_turn', data: log_obj}
            }
        } else {
            return {responce: 'waiting_for_input'}
        }
    }

    get_units() {
        return this.heap.data
    }

    get_unit(i: number) {
        return this.heap.get_unit(i)
    }

    get_char(unit: UnitData) {
        return this.world.get_char_from_id(unit.char_id)
    }

    async make_turn(pool: any){
        let unit = this.heap.get_selected_unit()
        let char = this.get_char(unit)
        let action:Action = BattleAI.action(this, unit, char);
        while (action.action != 'end_turn') {
            let logged_action = await this.action(pool, this.heap.selected, action)
            this.send_action(logged_action)
            this.send_update()
            action = BattleAI.action(this, unit, char);
        }
        this.changed = true
    }

    async action(pool:any, unit_index: number, action: Action) {
        let unit = this.heap.get_unit(unit_index)
        var character:CharacterGenericPart = this.world.get_char_from_id(unit.char_id);

        //no action
        if (action.action == null) {
            return {action: 'pff', who: unit_index};
        }


        //move toward enemy
        if (action.action == 'move') {
            let tmp = geom.minus(action.target, unit.position)
            if (geom.norm(tmp) * 2 > unit.action_points_left) {
                tmp = geom.mult(geom.normalize(tmp), unit.action_points_left / 2)
            }
            unit.position.x = tmp.x + unit.position.x;
            unit.position.y = tmp.y + unit.position.y;
            let points_spent = geom.norm(tmp) * 2
            unit.action_points_left -= points_spent
            this.changed = true
            return {action: 'move', who: unit_index, target: unit.position, actor_name: character.name}
        }

        
        if (action.action == 'attack') {
            if (action.target != null) {
                let unit2 = this.heap.get_unit(action.target);
                let char:CharacterGenericPart = this.world.get_char_from_id(unit.char_id)
                if ((geom.dist(unit.position, unit2.position) <= char.get_range()) && unit.action_points_left >= 1) {
                    let target_char = this.world.get_char_from_id(unit2.char_id);
                    let result = await character.attack(pool, target_char);
                    unit.action_points_left -= 1
                    this.changed = true
                    return {action: 'attack', attacker: unit_index, target: action.target, result: result, actor_name: character.name};
                }
            }
            return {action: 'pff'};
        } 


        if (action.action == 'flee') {
            if (unit.action_points_left > 3) {
                unit.action_points_left -= 3
                let dice = Math.random();
                this.changed = true
                if (dice <= 0.4) {
                    this.draw = true;
                    
                    return {action: 'flee', who: unit_index};
                } else {
                    return {action: 'pff', who: unit_index};
                }
            }
        } 
        

        if (action.action == 'spell_target') {
            if (unit.action_points_left > 3) {
                let spell_tag = action.spell_tag;
                let unit2 = this.heap.get_unit(action.target);
                let target_char = this.world.get_char_from_id(unit2.char_id);
                let result = await character.spell_attack(pool, target_char, spell_tag);
                if (result.flags.close_distance) {
                    let dist = geom.dist(unit.position, unit2.position)
                    if (dist > 1.9) {
                        let v = geom.minus(unit2.position, unit.position);
                        let u = geom.mult(geom.normalize(v), 0.9);
                        v = geom.minus(v, u)
                        unit.position.x = v.x
                        unit.position.y = v.y
                    }
                    result.new_pos = {x: unit.position.x, y: unit.position.y};
                }
                unit.action_points_left -= 3
                this.changed = true
                return {action: spell_tag, who: unit_index, result: result, actor_name: character.name};
            }
        }

        if (action.action == 'end_turn') {
            this.waiting_for_input = false
            unit.end_turn()
            this.heap.push(unit_index)
            this.changed = true
            return {action: 'end_turn', who: unit_index}
        }
        this.changed = true
    }

    get_data() {
        let data:any = {};
        for (var i = 0; i < this.heap.data.length; i++) {
            let unit = this.heap.data[i];
            var character:CharacterGenericPart = this.world.get_char_from_id(unit.char_id)
            if (character != undefined) {
                data[i] = {}
                data[i].id = unit.char_id;
                data[i].position = {x: unit.position.x, y: unit.position.y};
                data[i].tag = character.get_model();
                data[i].is_player = character.is_player();
                data[i].range = character.get_range();
                data[i].hp = character.get_hp();
            }
        }
        return data
    }

    add_fighter(agent:CharacterGenericPart, team:number, position:{x:number, y: number}) {
        console.log('add fighter')
        
        if (position == undefined) {
            if (team == 1) {
                position = {x: 0, y: 10}
            } else {
                position = {x: 0, y: 0}
            }
        }

        let unit = new UnitData();
        unit.init(agent, position, team)

        this.heap.add_unit(unit)

        agent.set_flag('in_battle', true)
        agent.set_in_battle_id(this.heap.data.length - 1)
        agent.set_battle_id(this.id)

        this.changed = true;
    }

    async transfer(target:{stash: Stash}, tag:material_index, x:number) {
        this.stash.transfer(target.stash, tag, x);
        this.changed = true
    }

    get_team_status(team: number) {
        let tmp = []
        for (let i in this.heap.data) {
            let unit = this.heap.data[i]
            if (unit.team == team) {
                let char:CharacterGenericPart = this.world.get_char_from_id(unit.char_id)
                if (char != undefined) {
                    tmp.push({name: char.name, hp: char.get_hp(), next_turn: unit.next_turn_after})
                }
            }
        }
        return tmp
    }

    get_status() {
        let tmp = []
        for (let i in this.heap.data) {
            let unit = this.heap.data[i]
            let char:CharacterGenericPart = this.world.get_char_from_id(unit.char_id)
            if (char != undefined) {
                tmp.push({name: char.name, hp: char.get_hp(), next_turn: unit.next_turn_after, ap: unit.action_points_left})
            }
        }
        return tmp
    }

    is_over() {
        var team_lost: boolean[] = [];
        for (let team = 0; team < 10; team++) {
            team_lost[team] = true
        }
        for (var i = 0; i < this.heap.data.length; i++) {
            let unit = this.heap.data[i]
            var char: CharacterGenericPart = this.world.get_char_from_id(unit.char_id);
            if ((char == undefined) || (char.get_hp() == 0)) {
                if (!unit.dead) {
                    unit.dead = true;
                }
            } else {
                team_lost[unit.team] = false
            }
        }

        if (this.draw == true) {
            return 'draw';
        } else {
            let teams_left = 0
            let team_not_lost = -1
            for (let team = 0; team < 10; team++) {
                if (!team_lost[team]) {
                    teams_left += 1
                    team_not_lost = team
                }
            }
            if (teams_left > 1) {
                return -1
            } else if (teams_left == 1) {
                return team_not_lost
            } else {
                return 'draw'
            }
        }
        return -1;
    }

    clean_up_battle() {
        for (let i = 0; i < this.heap.get_units_amount(); i++) {
            let unit = this.heap.get_unit(i);
            let char:CharacterGenericPart = this.world.get_char_from_id(unit.char_id);
            if (char != undefined) {
                char.set_flag('in_battle', false);
                char.set_battle_id(-1)
            }
            this.changed = true
        }
        this.send_stop()
    }

    reward() {}    
    async reward_team(pool: any, team: number) {}

    async process_input(pool: any, unit_index: number, input: Action) {
        if (!this.waiting_for_input) {
            return {action: 'pff', who: unit_index}
        }
        if (this.heap.selected != unit_index) {
            return {action: 'pff', who: unit_index}
        }

        if (input != undefined) {
            this.changed = true
            if (input.action == 'move') {
                return await this.action(pool, unit_index, {action: 'move', target: input.target})
            } else if (input.action == 'attack') {
                return await this.action(pool, unit_index, BattleAI.convert_attack_to_action(this, unit_index, input.target))
            } else if (input.action == 'flee') {
                return await this.action(pool, unit_index, {action: 'flee'})
            } else {
                return await this.action(pool, unit_index, input)
            }
        }        
    }

    units_amount() {
        return this.heap.get_units_amount()
    }
}
