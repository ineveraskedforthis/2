import { battle_id } from "../../../../shared/battle_data"
import { Battle } from "../battle/classes/battle"
import { Character } from "../character/character"
import { hostile } from "../character/races/racial_hostility"
import { Event } from "../events/events"
import { Convert } from "../systems_communication"

export namespace AIhelper {
    export function enemies_in_cell(char: Character) {
        let cell = Convert.character_to_cell(char)
        let a = cell.get_characters_list()
        for (let {id, name} of a) {
            let target_char = Convert.id_to_character(id)
            if (hostile(char.race(), target_char.race())) {
                if (!target_char.in_battle() && !target_char.dead()) {
                    return target_char.id
                }                
            }
        } 
        return -1
    }
    export function battles_in_cell(char: Character) {
        let battles:battle_id[] = []
        let cell = Convert.character_to_cell(char)
        if (cell == undefined) return battles
        let a = cell.get_characters_list()
        for (let {id, name} of a) {
            let target_char = Convert.id_to_character(id)
            if (target_char.in_battle() && !target_char.dead()) {
                battles.push(target_char.battle_id)
            }        
        } 
        return battles
    }
    export function check_battles_to_join(agent: Character) {
        let battles = battles_in_cell(agent)
        for (let item of battles) {
            let battle = Convert.id_to_battle(item)
            if (!(battle.ended)) {
                let team = check_team_to_join(agent, battle)
                if (team == 'no_interest') continue
                else {
                    Event.join_battle(agent, battle, team)
                    return true
                }
            }
        }
        return false
    }
    export function check_team_to_join(agent: Character, battle: Battle, exclude?: number):number|'no_interest' {
        let data = battle.heap.raw_data
        for (let item of data) {
            const target = Convert.unit_to_character(item)
            if (agent.race() == target.race() && (item.team != exclude) && (!target.dead())) {
                return item.team
            }
        }
        return 'no_interest'
    }
}