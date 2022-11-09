// THIS MODULE MUST BE IMPORTED FIRST

import { battle_id, unit_id } from "../shared/battle_data"
import { Battle } from "./battle/classes/battle"
import { Character } from "./character/character"
import { OrderBulk, OrderItem } from "./market/classes"
import { char_id, order_bulk_id, order_item_id } from "./types"

var battles_list:Battle[] = []
var battles_dict:{[_ in battle_id]: Battle} = {}
var last_id:battle_id = 0 as battle_id

var last_character_id = 0 as char_id
export var character_list:Character[] = []
var characters_dict:{[_ in char_id]: Character} = {}

var orders_bulk:OrderBulk[] = []
var orders_item:OrderItem[] = []

var bulk_dict: {[_ in order_bulk_id]: OrderBulk} = {}
var item_dict: {[_ in order_item_id]: OrderItem} = {}

var char_id_to_orders_bulk: {[_ in char_id]: Set<order_bulk_id>|undefined} = {}
var char_id_to_orders_item: {[_ in char_id]: Set<order_item_id>|undefined} = {}

const empty_set_orders_bulk: Set<order_bulk_id> = new Set()
const empty_set_orders_item: Set<order_item_id> = new Set()

var last_id_bulk = 0 as order_bulk_id
var last_id_item = 0 as order_item_id


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

    export namespace BulkOrders {
        export function increase_id() {
            last_id_bulk = last_id_bulk + 1 as order_bulk_id
        }

        export function id() {
            return last_id_bulk
        }

        export function set_id(x: order_bulk_id) {
            last_id_bulk = x as order_bulk_id
        }

        export function set(id: order_bulk_id, owner_id: char_id, data: OrderBulk) {
            orders_bulk.push(data)
            bulk_dict[id] = data
            const set = char_id_to_orders_bulk[owner_id]
            if (set == undefined) char_id_to_orders_bulk[owner_id] = new Set([id])
            else set.add(id)
        }

        export function from_id(id: order_bulk_id) {
            return bulk_dict[id]
        }

        export function list() {
            return orders_bulk
        }
    }
    export namespace ItemOrders {
        export function increase_id() {
            last_id_item = last_id_item + 1 as order_item_id
        }

        export function id() {
            return last_id_item
        }

        export function set_id(x: order_item_id) {
            last_id_item = x as order_item_id
        }

        export function set(id: order_item_id, owner_id: char_id, data: OrderItem) {
            orders_item.push(data)
            item_dict[id] = data
            const set = char_id_to_orders_item[owner_id]
            if (set == undefined) char_id_to_orders_item[owner_id] = new Set([id])
            else set.add(id)
        }

        export function from_id(id: order_item_id) {
            return item_dict[id]
        }

        export function list() {
            return orders_item
        }
    }

    export function CharacterBulkOrders(char_id: char_id) {
        const set = char_id_to_orders_bulk[char_id]
        if (set == undefined) return empty_set_orders_bulk 
        else return set
    }

    export function CharacterItemOrders(char_id: char_id) {
        const set = char_id_to_orders_item[char_id]
        if (set == undefined) return empty_set_orders_item
        else return set
    }

}