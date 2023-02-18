// THIS MODULE MUST BE IMPORTED FIRST

import fs from "fs"
import path from "path"
import { SAVE_GAME_PATH } from "../SAVE_GAME_PATH"
import { battle_id } from "../../../shared/battle_data"
import { Battle } from "./battle/classes/battle"
import { Character } from "./character/character"
import { Factions } from "./factions"
import { OrderBulk, OrderItem } from "./market/classes"
import { cell_id, char_id, building_id, order_bulk_id, order_item_id } from "./types"
import { character_to_string, item_from_string, string_to_character } from "./strings_management"

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

export type reputation_level = 'enemy'|'neutral'|'friend'|'member'

interface reputation {
    faction: number
    level: reputation_level
}


var reputation: {[_ in char_id]: {[_ in number]: reputation}} = {}


var character_to_buildings: Map<char_id, Set<building_id>> = new Map()
var building_to_character: Map<building_id, char_id> = new Map()
var building_to_cell: Map<building_id, cell_id> = new Map()
var cell_to_buildings: Map<cell_id, Set<building_id>> = new Map()


// class EntityData<type, id_type extends number & {__brand: string}> {
//     list: type[]
//     dict: {[_ in id_type]: type}

//     constructor() {
//         this.list = []
//         this.dict = {}
//     }
// }

// const X = EntityData<Character, char_id>
const save_path = 
{
    REPUTATION: path.join(SAVE_GAME_PATH, 'reputation.txt'),
    BUILDINGS: path.join(SAVE_GAME_PATH, 'housing.txt'),
    BUILDINGS_OWNERSHIP: path.join(SAVE_GAME_PATH, 'housing_ownership.txt'),
    CHARACTERS: path.join(SAVE_GAME_PATH, 'characters.txt')
}

const save_path_bulk = path.join(SAVE_GAME_PATH, 'bulk_market.txt')

const save_path_item = path.join(SAVE_GAME_PATH, 'item_market.txt')


const loaded_flag = {
    Characters: false
}

function read_lines(file: string) {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, '')
    }
    let data = fs.readFileSync(file).toString()
    return data.split('\n')
}

export namespace Data {
    export function load() {
        CharacterDB.load(save_path.CHARACTERS)
        BulkOrders.save()
        ItemOrders.save()
        Reputation.load(save_path.REPUTATION)
        Buildings.load_ownership(save_path.BUILDINGS_OWNERSHIP)
    }
    export function save() {
        CharacterDB.save()
        BulkOrders.save()
        ItemOrders.save()
        Reputation.save(save_path.REPUTATION)
        Buildings.save(save_path.BUILDINGS)
    }

    export namespace Buildings {

        export function load(save_path: string) {
            console.log('loading buildings')
        }

        export function load_ownership(save_path: string) {
            console.log('loading buildings ownership')
            for (let line of read_lines(save_path)) {
                if (line == '') {continue}
                let {character, buildings}:{character: char_id, buildings: building_id[]} = JSON.parse(line)
                set_character_buildings(character, buildings)
            }
        }

        export function save(save_path: string) {

        }

        function set_character_buildings(character: char_id, buildings: building_id[]) {
            character_to_buildings.set(character, new Set(buildings))
            for (let building of buildings) {
                building_to_character.set(building, character)
            }
        }

        // function add_one_one
    }

    export namespace Reputation {
        export function load(save_path: string) {
            console.log('loading reputation')
            for (let line of read_lines(save_path)) {
                if (line == '') {continue}
                let reputation_line:{char: char_id, item: {[_ in number]: reputation}} = JSON.parse(line)
                reputation[reputation_line.char] = reputation_line.item
            }
            console.log('reputation loaded')
        }

        export function save(save_path: string) {
            console.log('saving reputation')
            let str:string = ''
            for (let [char_id, item] of Object.entries(reputation)) {
                str = str + JSON.stringify({char: char_id, item: item}) + '\n' 
            }
            fs.writeFileSync(save_path, str)
            console.log('reputation saved')
        }

        export function from_id(faction: number, char_id: char_id):reputation_level {
            if (reputation[char_id] == undefined) return 'neutral';
            let responce = reputation[char_id][faction]
            if (responce == undefined) { return 'neutral' }
            return responce.level
        }

        export function list_from_id(char_id: char_id): { id: number; name: string; reputation: reputation_level }[] {
            let responce = []
            for (let faction of Object.values(Factions)) {
                responce.push({
                    id: faction.id,
                    name: faction.name,
                    reputation: from_id(faction.id, char_id)
                })
            }

            return responce
        }

        /**
         * 
         * @param a his factions are checked  
         * @param X reputation level
         * @param b his reputation is checked
         * @returns **true** if b has a reputation level X with one of factions of a and **false** otherwise
         */
        export function a_X_b(a: char_id, X: reputation_level, b: char_id) {
            if (reputation[b] == undefined) return false
            const rep = reputation[a]
            for (let [faction, reputation] of Object.entries(rep)) {
                if (reputation.level == 'member') {
                    if (from_id(reputation.faction, b) == X) return true
                }
            }
            return false
        }

        /**
         * sets reputation of b to X with factions of a 
         * @param a his factions are checked  
         * @param X reputation level
         * @param b his reputation is changed
         * @returns 
         */
        export function set_a_X_b(a: char_id, X: reputation_level, b: char_id) {
            if (reputation[a] == undefined) return
            if (reputation[b] == undefined) reputation[b] = {}
            const rep = reputation[a]
            for (let [faction, reputation] of Object.entries(rep)) {
                if (reputation.level == 'member') {
                    set(reputation.faction, b, X)
                }
            }
            return false
        }

        export function set(faction: number, char_id: char_id, level: reputation_level) {
            if (reputation[char_id] == undefined) reputation[char_id] = {}
            if (reputation[char_id][faction] == undefined) reputation[char_id][faction] = {faction: faction, level: level}
            else reputation[char_id][faction].level = level
        }

        export function a_is_enemy_of_b(a: char_id, b: char_id) {
            if (reputation[a] == undefined) return false
            if (reputation[b] == undefined) return false
            const rep = reputation[a]
            for (let [faction, reputation] of Object.entries(rep)) {
                if (reputation.level == 'member') {
                    if (from_id(reputation.faction, b) == 'enemy') return true
                }
            }
            return false
        }
    }

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

    export namespace CharacterDB {
        export function load(save_path: string) {
            if (loaded_flag.Characters) {
                return
            }
            console.log('loading characters')
            if (!fs.existsSync(save_path)) {
                fs.writeFileSync(save_path, '')
            }
            let data = fs.readFileSync(save_path).toString()
            let lines = data.split('\n')
    
            for (let line of lines) {
                if (line == '') {continue}
                const character = string_to_character(line)
                Data.CharacterDB.set(character.id, character)
                Data.CharacterDB.set_id(Math.max(character.id, Data.CharacterDB.id()) as char_id)
            }
            loaded_flag.Characters = true
            console.log('characters loaded')
        }
    
        export function save() {
            console.log('saving characters')
            let str:string = ''
            for (let item of Data.CharacterDB.list()) {
                if (item.dead()) continue
                str = str + character_to_string(item) + '\n' 
            }
            fs.writeFileSync(save_path.CHARACTERS, str)
            console.log('characters saved')
        }

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

        export function from_id(id: char_id): Character
        export function from_id(id: number): Character|undefined
        export function from_id(id: char_id|number): Character|undefined {
            return characters_dict[id as char_id]
        }
        export function list() {
            return character_list
        }
    }

    export namespace BulkOrders {
        
        export function save() {
            console.log('saving bulk market orders')
            let str:string = ''
            for (let item of Data.BulkOrders.list()) {
                if (item.amount == 0) continue;
                str = str + JSON.stringify(item) + '\n' 
                
            }
            fs.writeFileSync(save_path_bulk, str)
            console.log('bulk market orders saved')
            
        }
    
        export function load() {
            console.log('loading bulk market orders')
            if (!fs.existsSync(save_path_bulk)) {
                fs.writeFileSync(save_path_bulk, '')
            }
            let data = fs.readFileSync(save_path_bulk).toString()
            let lines = data.split('\n')
            for (let line of lines) {
                if (line == '') {continue}
                const order: OrderBulk = JSON.parse(line)
                // console.log(order)
                Data.BulkOrders.set(order.id, order.owner_id, order)
                const last_id = Data.BulkOrders.id()
                Data.BulkOrders.set_id(Math.max(order.id, last_id) as order_bulk_id)            
            }
            console.log('bulk market orders loaded')
        }

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

        export function from_id(id: order_bulk_id): OrderBulk
        export function from_id(id: number): OrderBulk|undefined
        export function from_id(id: order_bulk_id|number): OrderBulk|undefined {
            return bulk_dict[id as order_bulk_id]
        }

        export function list() {
            return orders_bulk
        }

        export function from_char_id(id: char_id) {
            return char_id_to_orders_bulk[id]
        }
    }
    export namespace ItemOrders {
        export function save() {
            console.log('saving item market orders')
            let str:string = ''
            for (let item of Data.ItemOrders.list()) {
                if (item.finished) continue;
                str = str + JSON.stringify(item) + '\n' 
                
            }
            fs.writeFileSync(save_path_item, str)
            console.log('item market orders saved')
            
        }
    
        export function load() {
            console.log('loading item market orders')
            if (!fs.existsSync(save_path_item)) {
                fs.writeFileSync(save_path_item, '')
            }
            let data = fs.readFileSync(save_path_item).toString()
            let lines = data.split('\n')
            for (let line of lines) {
                if (line == '') {continue}
                const order_raw: OrderItem = JSON.parse(line)
                const item = item_from_string(JSON.stringify(order_raw.item))
                const order = new OrderItem(order_raw.id, item, order_raw.price, order_raw.owner_id, order_raw.finished)
                
                Data.ItemOrders.set(order.id, order.owner_id, order)
                const last_id = Data.ItemOrders.id()
                Data.ItemOrders.set_id(Math.max(order.id, last_id) as order_item_id)            
            }
            console.log('item market orders loaded')
        }

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