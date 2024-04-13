import { action_points, BattleData, battle_id, battle_position, ms } from "@custom_types/battle_data"
import { Convert, Link, Unlink } from "../systems_communication"
import { Character } from "../character/character"
import { Battle } from "./classes/battle"
import { BattleEvent } from "./events"
import { BattleValues } from "./VALUES"
import { decide_AI_battle_action } from "./ACTIONS_AI_DECISION"
import { Alerts } from "../client_communication/network_actions/alerts"
import { UserManagement } from "../client_communication/user_manager"
import { UI_Part } from "../client_communication/causality_graph"
import { Data } from "../data/data_objects"
import { CharactersHeap } from "./classes/heap"
import { character_id } from "@custom_types/common"

var last_character_id = 0 as character_id

function time_distance(a: ms, b: ms) {
    return b - a as ms
}


export namespace BattleSystem {
    export function get_empty_team(battle: Battle) {
        let max = 0
        battle.heap.map(Data.Characters.from_id).forEach((unit) => {
            if (unit == undefined) return;
            if (max < unit.team) {
                max = unit.team
            }
        });
        return max + 1
    }

    // team 0 is a defender and spawns at the center
    // other teams spawn around center
    export function create_unit(character: Character, team: number, battle: Battle) {
        last_character_id = last_character_id + 1 as character_id

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

        // setting up character

        character.position = position
        character.team = team
        character.action_points_left = 3 as action_points
        character.action_points_max = 10 as action_points
        character.next_turn_after = CharactersHeap.get_max(battle) + Math.floor((Math.random() * 50))
    }

    export function add_figther(battle: Battle, character: Character, team: number) {
        if (character.in_battle()) return

        const unit = create_unit(character, team, battle)
        character.battle_id = battle.id

        BattleEvent.NewUnit(battle, character)

        console.log(`${character.get_name()} joins battle ${battle.id}`)
        Alerts.battle_update_data(battle)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BATTLE)
        return unit
    }

    export function battle_finished(battle: Battle) {
        const current_unit = CharactersHeap.get_selected_unit(battle)
        if (current_unit == undefined) {
            return true
        }

        for (let i = 0; i < battle.last; i++) {
            const unit = battle.heap[i];
            if (unit == undefined) continue;
            const character = Data.Characters.from_id(unit)
            if (!character.dead()) {
                return current_unit
            }
        }

        battle.stopped = true
        return true
    }

    export function update(dt:ms) {
        const current_date = Date.now() as ms

        Data.Battles.for_each(battle => {
            if (battle.stopped) {
                return
            }

            const unit = battle_finished(battle)
            if (unit === true) {
                stop_battle(battle)
                return
            }

            // console.log('turn of ', character.get_name())
            if (unit.dead()) {
                BattleEvent.EndTurn(battle, unit)
                return
            }

            // if turn lasts longer than 60 seconds, it ends automatically
            if (battle.waiting_for_input) {
                // console.log('waiting')
                if ((battle.date_of_last_turn != '%') && (time_distance(battle.date_of_last_turn, current_date) > 60 * 1000)) {
                    // console.log('too long, end turn')
                    BattleEvent.EndTurn(battle, unit)
                }

                if ((battle.date_of_last_turn == '%')) {
                    battle.date_of_last_turn = Date.now() as ms;
                }
                return
            }

            //processing cases of player and ai separately for a now
            // if character is player, then wait for input
            if (unit.is_player()) {
                // console.log('player turn, wait for input')
                battle.waiting_for_input = true
                return
            }

            // give AI 1 seconds before ending a turn to imitate spending time to a turn
            // wait 1 seconds for an AI turn
            if (battle.ai_timer != undefined) {
                battle.ai_timer = battle.ai_timer + dt as ms
                if (battle.ai_timer < 500) {
                    return
                } else {
                    battle.ai_timer = undefined
                    return
                }
            } else {
                // console.log('decision AI', character.get_name())
                decide_AI_battle_action(battle, unit)
                // launch the timer
                battle.ai_timer = 0 as ms
            }
        })
    }

    export function data(battle: Battle):BattleData {
        let data:BattleData = {};
        battle.heap.map(Data.Characters.from_id).forEach((unit) => {
            if (unit == undefined) return;
            if (!unit.dead()) data[unit.id] = (Convert.unit_to_unit_socket(unit))
        })
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

        add_figther(battle, character, target.team)
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
        if ((battle != undefined)) {
            let team = BattleSystem.get_empty_team(battle)
            add_figther(battle, attacker, team)
        } else {
            const battle = Data.Battles.create()
            add_figther(battle, defender, 0)
            add_figther(battle, attacker, 1)
        }
    }

    export function stop_battle(battle: Battle) {
        console.log("stop battle: ", battle.id)
        battle.stopped = true
        const to_delete: character_id[] = []
        for (let unit of battle.heap) {
            if (unit != undefined) to_delete.push(unit)
        }

        for (let unit of to_delete) {
            const character = Data.Characters.from_id(unit)
            CharactersHeap.delete_unit(battle, character)
            character.battle_id = undefined
            UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BATTLE)
        }
    }
}