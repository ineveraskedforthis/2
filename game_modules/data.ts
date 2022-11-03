import { battle_id, unit_id } from "../shared/battle_data"
import { Battle } from "./base_game_classes/battle/classes/battle"

var battles_list:Battle[] = []
var battles_dict:{[_ in battle_id]: Battle} = {}
var last_id:battle_id = 0 as battle_id


export namespace Data {
    export namespace Battle {
        export function increase_id() {
            last_id = last_id + 1 as battle_id
        }

        export function id() {
            return last_id
        }

        export function set_id(x: battle_id) {
            last_id = x as battle_id
        }

        export function set(id: battle_id, data: Battle) {
            battles_list.push(data)
            battles_dict[id] = data
        }

        export function from_id(id: battle_id) {
            return battles_dict[id]
        }

        export function list() {
            return battles_list
        }
    }
}