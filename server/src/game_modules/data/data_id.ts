// THIS MODULE MUST BE IMPORTED FIRST

import { battle_id } from "@custom_types/battle_data"
import { reputation_level } from "@custom_types/character"
import { ReputationData } from "@custom_types/common"
import { cell_id, character_id, item_id, location_id, market_order_id, user_id } from "@custom_types/ids"


var last_id_battle                          = 0 as battle_id
var last_id_character                       = 0 as character_id
var last_id_market_order                    = 0 as market_order_id
var last_id_location                        = 0 as location_id
var last_id_user                            = 0 as user_id
var last_id_item                            = 0 as item_id


var user_id_list                            : user_id[]                                                         = []
var user_id_character                       : Partial<Record<user_id, character_id>>                            = []

var item_id_list                            : item_id[]                                                         = []
//var item_id_backpack                        : Record<item_id, backpack_id>

//var backpack_id_list                        : backpack_id[]                                                     = []
//var backpack_id_items                       : Record<backpack_id, item_id>                                      = []

var character_chunks                        : character_id[][]                                                  = [[]]
var character_chunks_time_since_last_update : number[]                                                          = [0]
var character_chunk_to_update               : number                                                            = 0
var character_chunks_time_since_last_update2: number[]                                                          = [0]
var character_chunk_to_update2              : number                                                            = 0
var character_chunk_to_put_id_in            : number                                                            = 0
var character_id_list                       : character_id[]                                                    = []
var character_id_location                   : Record<character_id, location_id>                                 = []
var character_id_owned_location_set         : Record<character_id, Set<location_id>>                            = []
var character_id_owned_market_order_set     : Record<character_id, Set<market_order_id>>                        = []
var character_id_owned_market_order_list    : Record<character_id, market_order_id[]>                           = []
var character_id_faction_id_reputation      : Record<character_id, Partial<Record<string, reputation_level>>>   = []
var character_id_leader_of                  : Record<character_id, Set<string>>                                 = []
var character_id_battle                     : Partial<Record<character_id, battle_id>>                          = []
var character_id_user                       : Partial<Record<character_id, user_id>>                            = []
var character_id_home_location              : Partial<Record<character_id, location_id>>                        = []

var battle_id_list                          : battle_id[]                                                       = []
//var battle_id_characters                    : Record<battle_id, Set<character_id>>                              = []

var faction_id_list:string[]                                                                                    = []
var faction_id_leader                       : Partial<Record<string, character_id>>                             = {}
var faction_id_spawn                        : Record<string, location_id>                                       = {}

var cell_id_list                            : cell_id[]                                                         = []
var cell_id_location_id_list                : Record<cell_id, location_id[]>                                    = []
var cell_id_location_main                   : Record<cell_id, location_id>                                      = []

var location_id_list                        : location_id[]                                                     = []
var location_id_cell                        : Record<location_id, cell_id>                                      = []
var location_id_owner                       : Partial<Record<location_id, character_id>>                        = []
var location_id_guests                      : Record<location_id, Set<character_id>>                            = []
var location_id_guests_list                 : Record<location_id, character_id[]>                               = []

var market_order_id_list                    : market_order_id[]                                                 = []
var market_order_id_owner                   : Record<market_order_id, character_id>                             = []

const empty_set_orders_bulk: Set<market_order_id> = new Set()

export namespace DataID {
    export namespace Connection {

        export function set_main_location(cell: cell_id, location: location_id) {
            cell_id_location_main[cell] = location
        }

        function update_guest_lists(location: location_id) {
            location_id_guests_list[location] = Array.from(location_id_guests[location])
        }

        export function set_character_location(character: character_id, location: location_id): location_id {
            let old_location = character_id_location[character]
            character_id_location[character] = location
            location_id_guests[old_location].delete(character)
            location_id_guests[location].add(character)

            update_guest_lists(old_location)
            update_guest_lists(location)

            return old_location
        }

        export function set_character_home(character: character_id, location: location_id|undefined) {
            character_id_home_location[character] = location
        }

        export function set_character_battle(character: character_id, battle: battle_id|undefined) {
            const old_battle = character_id_battle[character]
            //if (old_battle != undefined) {
            //    battle_id_characters[old_battle].delete(character)
            //}

            character_id_battle[character] = battle
            //if (battle != undefined)
            //    battle_id_characters[battle].add(character);
        }

        export function set_character_user(character: character_id|undefined, user: user_id|undefined) {
            if (user == undefined) {
                if (character == undefined) {
                    return
                } else {
                    const old_user = character_id_user[character]
                    if (old_user != undefined) {
                        user_id_character[old_user] = undefined
                    }
                    character_id_user[character] = undefined
                }
            } else {
                const old_character = user_id_character[user]
                if (old_character != undefined) {
                    character_id_user[old_character] = undefined
                }
                if (character == undefined) {
                    user_id_character[user] = undefined
                } else {
                    const old_user = character_id_user[character]
                    if (old_user != undefined) {
                        user_id_character[old_user] = undefined
                    }

                    user_id_character[user] = character
                    character_id_user[character] = user
                }
            }
        }

        export function set_location_owner(new_owner: character_id|undefined, location: location_id) {
            let old_owner = location_id_owner[location]
            location_id_owner[location] = new_owner

            if (old_owner != undefined) {
                character_id_owned_location_set[old_owner].delete(location)
            }
            if (new_owner != undefined) {
                character_id_owned_location_set[new_owner].add(location)
            }
        }

        export function set_faction_leader(leader: character_id|undefined, faction: string) {
            const old_leader = faction_id_leader[faction]

            if (old_leader != undefined) {
                character_id_leader_of[old_leader].delete(faction)
            }

            if (leader == undefined) {
                faction_id_leader[faction] = undefined
                return
            }

            character_id_leader_of[leader].add(faction)
        }

        export function set_spawn(faction: string, location: location_id) {
            faction_id_spawn[faction] = location
        }

        export function is_character_location(location: location_id, character: character_id) {
            return location_id_guests[location].has(character)
        }
    }

    export namespace Items {
        export function update_last_id(x: number) {
            last_id_item = Math.max(x, last_id_item) as item_id
        }

        export function set_up(item: item_id) {
            item_id_list.push(item)
            update_last_id(item)
        }

        export function new_id(): item_id {
            last_id_item++;
            return register(last_id_item)
        }

        export function register(item: item_id) {
            set_up(item)
            return item
        }

        export function for_each(callback: (id: item_id) => void) {
            item_id_list.forEach((value, index) => {
                callback(value)
            })
        }
    }

    export namespace Cells {
        export function register(id: cell_id) {
            cell_id_list.push(id)
            cell_id_location_id_list[id] = []

        }

        export function for_each(callback: (id: cell_id) => void) {
            cell_id_list.forEach((value, index) => {
                callback(value)
            })
        }

        export function locations(cell: cell_id) {
            return cell_id_location_id_list[cell]
        }

        export function for_each_guest(cell: cell_id, callback: (guest: character_id) => void) {
            for (const location of locations(cell)) {
                for (const guest of Location.guest_list(location)) {
                    callback(guest)
                }
            }
        }

        export function guests_amount(cell: cell_id) {
            let total = 0
            for (const location of locations(cell)) {
                total += Location.guest_list(location).length
            }
            return total
        }

        export function for_each_market_order(cell: cell_id, callback: (market_order: market_order_id) => void) {
            for (const location of locations(cell)) {
                for (const guest of Location.guest_list(location)) {
                    for (const order of character_id_owned_market_order_list[guest]) {
                        callback(order)
                    }
                }
            }
        }

        export function main_location(cell: cell_id) {
            return cell_id_location_main[cell]
        }
    }

    export namespace Location {
        export function update_last_id(x: number) {
            last_id_location = Math.max(x, last_id_location) as location_id
        }

        export function set_up(location: location_id) {
            location_id_list.push(location)
            location_id_guests[location] = new Set()
            location_id_guests_list[location] = []
            update_last_id(location)
        }

        export function new_id(cell: cell_id): location_id {
            last_id_location++;
            return register(last_id_location, cell)
        }

        export function register(location: location_id, cell: cell_id) {
            set_up(location)
            let cell_location_list = cell_id_location_id_list[cell]
            cell_location_list.push(location)
            location_id_cell[location] = cell
            return location
        }

        export function cell_id(location: location_id): cell_id {
            return location_id_cell[location]
        }

        export function owner_id(location: location_id): character_id|undefined {
            return location_id_owner[location]
        }

        export function guest_list(location: location_id): character_id[] {
            return location_id_guests_list[location]
        }

        export function for_each_guest(location: location_id, callback: (guest: character_id) => void) {
            location_id_guests_list[location].forEach((guest, index) => {
                callback(guest)
            })
        }

        export function for_each_ownership(callback: (location: location_id, owner: character_id|undefined) => void) {
            location_id_list.forEach((value, index) => {
                callback(value, owner_id(value))
            })
        }

        export function set_ownership(character: character_id, location: location_id) {
            Connection.set_location_owner(character, location)
        }

        export function unset_ownership(location: location_id) {
            Connection.set_location_owner(undefined, location)
        }


        export function for_each(callback: (location: location_id) => void) {
            location_id_list.forEach((value, index) => {
                callback(value)
            })
        }
    }

    export namespace Faction {
        export function register(faction_id: string, spawn: location_id) {
            faction_id_list.push(faction_id)
            faction_id_spawn[faction_id] = spawn
        }

        export function list_of_id() {
            return faction_id_list
        }


        export function spawn(faction: string) {
            return faction_id_spawn[faction]
        }
    }

    export namespace Reputation {
        export function get(character: character_id, faction: string): reputation_level {
            const reputation = character_id_faction_id_reputation[character][faction]
            if (reputation == undefined) {
                return "neutral"
            }
            return reputation
        }
        export function set(character: character_id, faction: string, reputation: reputation_level) {
            console.log(character, 'is now a', reputation, 'of', faction)
            character_id_faction_id_reputation[character][faction] = reputation
        }

        export function character(character: character_id): ReputationData[] {
            const response: ReputationData[] = []
            for (const faction of faction_id_list) {
                response.push({
                    faction_id: faction,
                    reputation: get(character, faction)
                })
            }

            return response
        }

        /**
         *
         * @param a his factions are checked
         * @param X reputation level
         * @param b his reputation is checked
         * @returns **true** if b has a reputation level X with one of factions of a and **false** otherwise
         */
        export function a_X_b(a: character_id, X: reputation_level, b: character_id) {
            for (const faction of faction_id_list) {
                if (get(a, faction) == 'member') {
                    if (get(b, faction) == X) {
                        return true
                    }
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
        export function set_a_X_b(a: character_id, X: reputation_level, b: character_id) {
            for (const faction of faction_id_list) {
                if ((get(a, faction) == 'member') || (get(a, faction) == 'leader')) {
                    set(b, faction, X)
                }
            }
            return false
        }

        export function a_is_enemy_of_b(a: character_id, b: character_id) {
            for (const faction of faction_id_list) {
                if ((get(b, faction) == 'member') || (get(b, faction) == "leader")) {
                    if (get(a, faction) == 'enemy') return true
                }
            }
            return false
        }
    }

    export namespace Battle {

        export function new_id() {
            last_id_battle++;
            const id = last_id_battle;

            battle_id_list.push(id)
            //battle_id_characters[id] = new Set()

            return last_id_battle
        }

        export function register(id: battle_id, units: character_id[]) {
            update_last_id(id)

            battle_id_list.push(id)
            units.forEach(unit => {
                character_id_battle[unit] = id
            })
        }

        export function update_last_id(x: battle_id) {
            last_id_battle = Math.max(x, last_id_battle) as battle_id
        }

        export function for_each(callback: (battle: battle_id) => void) {
            return battle_id_list.forEach(callback)
        }
    }

    export namespace Character {

        export function update(dt_ms: number, time_between_updates: number, callback: (id: character_id) => void) {
            for (let i = 0; i < character_chunks_time_since_last_update.length; i++) {
                character_chunks_time_since_last_update[i] += dt_ms
            }

            while (character_chunks_time_since_last_update[character_chunk_to_update] >= time_between_updates) {
                for (const item of character_chunks[character_chunk_to_update]) {
                    callback(item)
                }
                character_chunks_time_since_last_update[character_chunk_to_update] -= time_between_updates
            }

            character_chunk_to_update = (character_chunk_to_update + 1) % character_chunks.length;
        }

        export function update2(dt_ms: number, time_between_updates: number, callback: (id: character_id) => void) {
            for (let i = 0; i < character_chunks_time_since_last_update2.length; i++) {
                character_chunks_time_since_last_update2[i] += dt_ms
            }

            while (character_chunks_time_since_last_update2[character_chunk_to_update2] >= time_between_updates) {
                for (const item of character_chunks[character_chunk_to_update2]) {
                    callback(item)
                }
                character_chunks_time_since_last_update2[character_chunk_to_update2] -= time_between_updates
            }

            character_chunk_to_update2 = (character_chunk_to_update2 + 1) % character_chunks.length;
        }

        export function add_id_to_chunk(id: character_id) {
            character_chunks[character_chunk_to_put_id_in].push(id);
            character_chunk_to_put_id_in = (character_chunk_to_put_id_in + 1) % character_chunks.length;
        }

        export function set_amount_of_chunks(N: number) {
            character_chunks = []
            character_chunks_time_since_last_update = []
            character_chunks_time_since_last_update2 = []
            character_chunk_to_update = 0
            character_chunk_to_update2 = 0
            character_chunk_to_put_id_in = 0

            for (let i = 0; i < N; i++) {
                character_chunks.push([])
                character_chunks_time_since_last_update.push(0)
                character_chunks_time_since_last_update2.push(0)
            }

            for_each((id) => add_id_to_chunk(id));
        }

        export function set_up_id(id: character_id, location: location_id) {
            character_id_list.push(id)
            character_id_faction_id_reputation[id] = {}

            character_id_owned_location_set[id] = new Set()
            character_id_owned_market_order_set[id] = new Set()
            character_id_owned_market_order_list[id] = []
            character_id_leader_of[id] = new Set()

            character_id_location[id] = location
            location_id_guests[location].add(id)

            add_id_to_chunk(id);
        }

        export function new_id(location: location_id): character_id {
            last_id_character++;
            set_up_id(last_id_character, location)
            return last_id_character
        }

        export function register(character: character_id, location: location_id) {
            set_up_id(character, location)
            update_last_id(character)
        }

        export function update_last_id(x: character_id) {
            last_id_character = Math.max(x, last_id_character) as character_id
        }

        export function ownership(character: character_id) {
            return Array.from(character_id_owned_location_set[character])
        }

        export function for_each_ownership(character: character_id, callback : (location: location_id) => void) {
            let locations = character_id_owned_location_set[character]
            for (let id of locations.values()) {
                callback(id)
            }
        }

        export function unset_all_ownership(character: character_id) {
            let locations = character_id_owned_location_set[character]
            for (let id of locations.values()) {
                location_id_owner[id] = undefined
            }
            character_id_owned_location_set[character].clear()
        }

        export function list_of_id(){
            return character_id_list
        }

        export function battle_id(character: character_id) {
            return character_id_battle[character]
        }

        export function location_id(character: character_id) {
            return character_id_location[character]
        }

        export function home_location_id(character: character_id) {
            return character_id_home_location[character]
        }

        export function user_id(character: character_id) {
            return character_id_user[character]
        }

        export function market_orders_list(character: character_id) {
            return character_id_owned_market_order_list[character]
        }

        export function for_each(callback: (character: character_id) => void) {
            return character_id_list.forEach(callback)
        }
    }

    export namespace MarketOrders {
        function update_character_id_owned_market_order_list(owner: character_id) {
            character_id_owned_market_order_list[owner] = Array.from(character_id_owned_market_order_set[owner])
        }

        export function new_id(owner: character_id) {
            last_id_market_order++;
            const id = last_id_market_order;

            market_order_id_list.push(id)
            market_order_id_owner[id] = owner

            character_id_owned_market_order_set[owner].add(id)

            update_character_id_owned_market_order_list(owner)

            return id
        }

        export function register(order: market_order_id, owner: character_id) {
            market_order_id_list.push(order)
            market_order_id_owner[order] = owner
            DataID.MarketOrders.update_last_id(order)

            character_id_owned_market_order_set[owner].add(order)

            update_character_id_owned_market_order_list(owner)
        }

        export function for_each(callback: (order: market_order_id) => void) {
            return market_order_id_list.forEach(callback)
        }

        export function list() {
            return market_order_id_list
        }

        export function update_last_id(x: market_order_id) {
            last_id_market_order = Math.max(x, last_id_market_order) as market_order_id
        }

        export function owner(order: market_order_id) {
            return market_order_id_owner[order]
        }
    }
}