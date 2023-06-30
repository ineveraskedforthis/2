import { action_points, BattleData, battle_id, battle_position, ms, unit_id } from "../../../../shared/battle_data"
import { Convert, Link, Unlink } from "../systems_communication"
import { Character } from "../character/character"
import { Battle } from "./classes/battle"
import { UnitsHeap } from "./classes/heap"
import { Unit } from "./classes/unit"
import { BattleEvent } from "./events"
import fs from "fs"
import { Data } from "../data"
import path from "path"
import { SAVE_GAME_PATH } from "../../SAVE_GAME_PATH"
import { BattleValues } from "./VALUES"
import { decide_AI_battle_action } from "./ACTIONS_AI_DECISION"
import { Alerts } from "../client_communication/network_actions/alerts"
import { UserManagement } from "../client_communication/user_manager"
import { UI_Part } from "../client_communication/causality_graph"

var last_unit_id = 0 as unit_id

function time_distance(a: ms, b: ms) {
    return b - a as ms
}

const save_path = path.join(SAVE_GAME_PATH, 'battles.txt')

export namespace BattleSystem {

    export function id_to_unit(id: unit_id, battle: Battle) {
        return battle.heap.get_unit(id)
    }

    export function load() {
        console.log('loading battles')
        if (!fs.existsSync(save_path)) {
            fs.writeFileSync(save_path, '')
        }
        let data = fs.readFileSync(save_path).toString()
        let lines = data.split('\n')

        for (let line of lines) {
            if (line == '') {continue}
            const battle = string_to_battle(line)
            if (battle.date_of_last_turn == '%') {
                battle.date_of_last_turn = Date.now() as ms
            }

            Data.Battle.set(battle.id, battle)
            const last_id = Data.Battle.id()
            Data.Battle.set_id(Math.max(battle.id, last_id) as battle_id)            
        }

        console.log('battles loaded')
    }

    export function save() {
        console.log('saving battles')
        let str:string = ''
        for (let item of Data.Battle.list()) {
            if (battle_finished(item)) {
                stop_battle(item)
            }
            str = str + battle_to_string(item) + '\n' 
        }
        fs.writeFileSync(save_path, str)
        console.log('battles saved')
    }

    function battle_to_string(battle: Battle) {
        return JSON.stringify(battle)
    }

    function string_to_battle(s: string) {
        const json:Battle = JSON.parse(s)
        const battle = new Battle(json.id, json_to_heap(json.heap))
        
        const unit = battle.heap.get_selected_unit()
        if (unit != undefined) {
            const character = Convert.unit_to_character(unit)
            if (character.is_player()) {
                battle.waiting_for_input = true
            } else {
                battle.waiting_for_input = false
            }
        } else {
            battle.waiting_for_input = false
        }
        // battle.ended = json.ended
        battle.last_event_index = json.last_event_index
        battle.grace_period = json.grace_period||0
        return battle
    }

    function json_to_heap(s: UnitsHeap) {
        const h = new UnitsHeap([])
        for (let unit of Object.values(s.data)) {
            const character = Convert.unit_to_character(unit)
            if (character != undefined) h.add_unit(unit)
        }
        return h
    }

    // only creates and initialise battle
    // does not add participants
    export function create_battle(): battle_id{
        Data.Battle.increase_id()
        const last_id = Data.Battle.id()
        let heap = new UnitsHeap([])
        let battle = new Battle(last_id, heap)
        battle.grace_period = 6
        Data.Battle.set(last_id, battle)
        return last_id
    }

    export function get_empty_team(battle: Battle) {
        let max = 0
        for (let unit of Object.values(battle.heap.data)) {
            if (max < unit.team) {
                max = unit.team
            }
        }
        return max + 1
    }

    // team 0 is a defender and spawns at the center
    // other teams spawn around center
    export function create_unit(character: Character, team: number, battle: Battle): Unit {
        last_unit_id = last_unit_id + 1 as unit_id
        
        // deciding position
        if (team == 0) {
            const dx = Math.random() * 2 - 1
            const dy = Math.random() * 2 - 1
            var position = {x: 0 + dx, y: 0 + dy} as battle_position
        } else {
            let dx = Math.random() * 2 - 1
            let dy = Math.random() * 2 - 1
            const norm = Math.sqrt((dx * dx + dy * dy))
            dx = dx + dx / norm * BattleValues.HALFWIDTH / 2
            dy = dy + dy / norm * BattleValues.HALFHEIGHT / 2
            // console.log(dx, dy)
            var position = {x: 0 + dx, y: 0 + dy} as battle_position
        }

        const unit = new Unit(
            last_unit_id, 
            position,
            team,
            3 as action_points,
            10 as action_points,
            100,
            4 as action_points, 
            character.id,
            battle.heap.get_max() + Math.floor((Math.random() * 50))
            )
        
        return unit
    }

    export function add_figther(battle: Battle, character: Character, team: number) {
        if (character.in_battle()) return 

        const unit = create_unit(character, team, battle)
        BattleEvent.NewUnit(battle, unit)
        Link.character_battle_unit(character, battle, unit)

        console.log(`${character.get_name()} joins battle ${battle.id}`)
        Alerts.battle_update_data(battle)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BATTLE)
        return unit
    }

    export function battle_finished(battle: Battle) {
        const current_unit = battle.heap.get_selected_unit()
        if (current_unit == undefined) {
            return true
        }

        for (const unit of Object.values(battle.heap.data)) {
            const character = Convert.unit_to_character(unit)

            if (!character.dead()) {
                return current_unit
            }
        }

        return true
    }

    export function update(dt:ms) {
        const current_date = Date.now() as ms

        for (let battle of Data.Battle.list()) {
            const unit = battle_finished(battle)
            if (unit === true) {
                stop_battle(battle)
                continue
            }
            

            let character:Character = Convert.unit_to_character(unit)    
            // console.log('turn of ', character.get_name())       
            if (character.dead()) {
                BattleEvent.EndTurn(battle, unit)
                continue
            }

            // if turn lasts longer than 60 seconds, it ends automatically
            if (battle.waiting_for_input) {
                // console.log('waiting')
                if ((battle.date_of_last_turn != '%') && (time_distance(battle.date_of_last_turn, current_date) > 60 * 1000)) {
                    // console.log('too long, end turn')
                    BattleEvent.EndTurn(battle, unit)
                }
                continue
            }

            //processing cases of player and ai separately for a now
            // if character is player, then wait for input
            if (character.is_player()) {
                // console.log('player turn, wait for input')
                battle.waiting_for_input = true
                continue
            } 
            
            // give AI 1 seconds before ending a turn to imitate spending time to a turn
            // wait 1 seconds for an AI turn
            if (battle.ai_timer != undefined) {
                battle.ai_timer = battle.ai_timer + dt as ms                
                if (battle.ai_timer < 500) {
                    continue
                } else {
                    battle.ai_timer = undefined
                    continue
                }
            } else {
                // console.log('decision AI', character.get_name())
                decide_AI_battle_action(battle, character, unit)
                // launch the timer
                battle.ai_timer = 0 as ms
            }
        }
    }

    export function data(battle: Battle):BattleData {
        let data:BattleData = {};
        for (let unit of Object.values(battle.heap.data)) {
            let character:Character = Convert.unit_to_character(unit)
            if (!character.dead()) data[unit.id] = (Convert.unit_to_unit_socket(unit))
        }
        return data
    }
    export function support_in_battle(character: Character, target: Character) {
        console.log('attempt to support in battle')

        if (character.id == target.id) return undefined
        if (!target.in_battle()) return
        if (character.cell_id != target.cell_id) {return undefined}
        console.log('validated')

        const battle = Convert.character_to_battle(target)
        if (battle == undefined) return
        const unit_target = Convert.character_to_unit(target)
        if (unit_target == undefined) return

        add_figther(battle, character, unit_target.team)
    }

    export function start_battle(attacker: Character, defender: Character) {
        console.log('attempt to start battle between ' + attacker.name + ' and ' + defender.name)
        if (attacker.id == defender.id) {console.log('wrong_cell'); return undefined}
        if (attacker.in_battle()) {console.log('attacker is alread in battle'); return undefined}
        if (attacker.cell_id != defender.cell_id) {console.log('different cells'); return undefined}
        console.log('valid participants')

        // two cases
        // if defender is in battle, attempt to join it against him as a new team
        // else create new battle
        const battle = Convert.character_to_battle(defender)
        const unit_def = Convert.character_to_unit(defender)
        if ((battle != undefined) && (unit_def != undefined)) {
            let team = BattleSystem.get_empty_team(battle)
            add_figther(battle, attacker, team)
        } else {
            const battle_id = BattleSystem.create_battle()
            const battle = Convert.id_to_battle(battle_id)
            add_figther(battle, defender, 0)
            add_figther(battle, attacker, 1)
        }
    }

    export function stop_battle(battle: Battle) {
        for (let unit of Object.values(battle.heap.data)) {
            const character = Convert.unit_to_character(unit)   
            Unlink.character_and_battle(character)
            UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BATTLE)
        }
    }
}