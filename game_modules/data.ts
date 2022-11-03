// THIS MODULE MUST BE IMPORTED FIRST

import { battle_id, unit_id } from "../shared/battle_data"
import { Battle } from "./base_game_classes/battle/classes/battle"
import { Character } from "./base_game_classes/character/character"
import { char_id } from "./types"

var battles_list:Battle[] = []
var battles_dict:{[_ in battle_id]: Battle} = {}
var last_id:battle_id = 0 as battle_id

var last_character_id = 0 as char_id
export var character_list:Character[] = []
var characters_dict:{[_ in char_id]: Character} = {}


// class EntityData<type, id_type extends number & {__brand: string}> {
//     list: type[]
//     dict: {[_ in id_type]: type}

//     constructor() {
//         this.list = []
//         this.dict = {}
//     }
// }

// const X = EntityData<Character, char_id>


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

    export namespace Character {
        export function increase_id() {
            last_character_id = last_character_id + 1 as char_id
        }

        export function id() {
            return last_character_id
        }

        export function set_id(x: char_id) {
            last_character_id = x as char_id
        }

        export function set(id: char_id, data: Character) {
            character_list.push(data)
            characters_dict[id] = data
        }

        export function from_id(id: char_id) {
            return characters_dict[id]
        }
        export function list() {
            return character_list
        }
    }
}