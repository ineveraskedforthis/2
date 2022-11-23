import { battle_id, UnitSocket, unit_id } from "../shared/battle_data";
import { ItemData } from "../shared/inventory";
import { Battle } from "./battle/classes/battle";
import { Unit } from "./battle/classes/unit";
import { BattleEvent } from "./battle/events";
import { Character } from "./character/character";
import { CharacterSystem } from "./character/system";
import { ItemSystem } from "./items/system";
import { UI_Part } from "./client_communication/causality_graph";
import { SocketWrapper, User, UserData } from "./client_communication/user";
import { UserManagement } from "./client_communication/user_manager";
import { Data } from "./data";
import { Cell } from "./map/cell";
import { MapSystem } from "./map/system";
import { OrderBulk, OrderItem, OrderItemJson } from "./market/classes";
import { cell_id, char_id, order_bulk_id, order_item_id, user_online_id } from "./types";
import { Alerts } from "./client_communication/network_actions/alerts";


export namespace Convert {

    export function number_to_order_item_id(id: number): order_item_id|undefined {
        const temp = Data.ItemOrders.from_id(id as order_item_id)
        if (temp == undefined) return undefined
        return temp.id
    }

    
    export function id_to_order_item(id: order_item_id):OrderItem
    export function id_to_order_item(id: number):OrderItem|undefined
    export function id_to_order_item(id: order_item_id|number):OrderItem|undefined {
        return Data.ItemOrders.from_id(id as order_item_id)
    }

    export function order_to_socket_data(order: OrderItem):ItemData {
        let owner = Convert.id_to_character(order.owner_id)
        let responce = ItemSystem.item_data(order.item)

        responce.price = order.price
        responce.id = order.id
        responce.seller = owner.name
        return responce
    }
    

    export function json_to_order(data: OrderItemJson) {
        let item = ItemSystem.create(data.item)
        let order = new OrderItem(data.id, item, data.price, data.owner_id, data.finished)
        return order
    }

    export function id_to_bulk_order(id: order_bulk_id): OrderBulk;
    export function id_to_bulk_order(id: number): OrderBulk|undefined;
    export function id_to_bulk_order(id: order_bulk_id|number): OrderBulk|undefined {
        return Data.BulkOrders.from_id(id)
    }

    export function char_id_to_bulk_orders(id: char_id): Set<order_bulk_id> {
        return Data.CharacterBulkOrders(id)
    }

    export function cell_id_to_bulk_orders(id: cell_id): Set<order_bulk_id> {
        const cell = MapSystem.id_to_cell(id)
        if (cell == undefined) return new Set();
        const chars = cell.get_characters_id_set()
        const result:Set<order_bulk_id> = new Set()
        for (let char_id of chars) {
            const char_orders = char_id_to_bulk_orders(char_id)
            for (let [_, order] of char_orders.entries()) {
                result.add(order)
            }
        }
        return result
    }

    export function cell_id_to_item_orders_socket(cell_id: cell_id): ItemData[] {
        const cell = MapSystem.id_to_cell(cell_id)
        if (cell == undefined) return [];
        const chars = cell.get_characters_id_set()
        const result:ItemData[] = []
        for (let char_id of chars) {
            const char_orders = Data.CharacterItemOrders(char_id)
            for (let order_id of char_orders) {
                const order = Data.ItemOrders.from_id(order_id)
                if (order.finished) continue;
                result.push(order_to_socket_data(order))
            }
        }
        return result
    }

    export function id_to_battle(id: battle_id) {
        return Data.Battle.from_id(id)
    }


    export function id_to_character(id: undefined): undefined
    export function id_to_character(id: char_id): Character
    export function id_to_character(id: char_id|undefined): Character|undefined
    export function id_to_character(id: char_id|number): Character|undefined
    export function id_to_character(id: char_id|undefined|number): Character|undefined {
        if (id == undefined) return undefined
        if (id == -1) return undefined
        return Data.Character.from_id(id as char_id)
    }

    export function number_to_character(id: number): Character|undefined {
        return Data.Character.from_id(id as char_id)
    }

    export function unit_to_character(unit: Unit): Character {
        return id_to_character(unit.char_id)
    }

    export function user_to_character(user: User):Character|undefined {
        if (user.data.char_id == '@') return undefined;
        return id_to_character(user.data.char_id)
    }

    export function character_to_battle(character: Character): Battle|undefined {
        if (character.battle_id == -1) return undefined

        return Convert.id_to_battle(character.battle_id)
    }

    export function character_to_unit(character: Character): Unit|undefined {
        const battle = character_to_battle(character)
        if (battle == undefined)    return
        return battle.heap.get_unit(character.battle_unit_id)
    }

    export function character_to_user_data(character:Character):UserData|undefined {
        if (character.user_id == '#') return undefined
        return UserManagement.get_user_data(character.user_id)
    }

    export function unit_to_unit_socket(unit: Unit): UnitSocket {
        const character = unit_to_character(unit)
        return {
            tag: character.model(),
            position: unit.position,
            range: character.range(),
            name: character.name,
            hp: character.get_hp(),
            max_hp: character.stats.max.hp,
            ap: unit.action_points_left,
            id: unit.id,
            next_turn: unit.next_turn_after,
            dead: character.dead()
        }
    }

    export function socket_wrapper_to_user_character(socket: SocketWrapper): [User, Character]|[undefined, undefined] {
        if (socket.user_id == '#') {return [undefined, undefined]}
        const user = UserManagement.get_user(socket.user_id)
        const character = Convert.user_to_character(user)
        if (character == undefined) {return [undefined, undefined]}

        return [user, character]
    }

    export function character_to_user(character:Character):User|undefined {
        let data = character_to_user_data(character)
        if (data == undefined) return undefined
        return UserManagement.get_user(data.id as user_online_id)
    }

    export function character_to_cell(character: Character):Cell {
        let cell = MapSystem.SAFE_id_to_cell(character.cell_id)
        return cell
    }
}

export namespace Link {
    export function character_battle_unit(character: Character, battle: Battle, unit: Unit) {
        character.battle_id = battle.id
        character.battle_unit_id = unit.id
    }

    export function character_and_user_data(character: Character, user: UserData) {
        console.log('linking user and character')
        character.user_id = user.id
        user.char_id = character.id
        if (UserManagement.user_is_online(user.id)) {
            console.log('user is online')
            let user_online = UserManagement.get_user(user.id as user_online_id)
            user_online.character_created = true
            UserManagement.add_user_to_update_queue(user_online.data.id, 'character_creation')
        }
        UserManagement.save_users()
        CharacterSystem.save()
    }

    export function character_and_cell(character: Character, cell: Cell) {
        // console.log('linking character with cell ' + cell.x + ' ' + cell.y)
        // add to the list and notify locals
        // note: rewrite later to lazy sending: send local characters to local characters once in X seconds if there are changes
        //       and send list immediately only to entering user
        cell.enter(character.id)
        character.cell_id = cell.id
        const locals = cell.get_characters_list()
        for (let item of locals) {
            const id = item.id
            const local_character = Convert.id_to_character(id)
            UserManagement.add_user_to_update_queue(local_character.user_id, UI_Part.LOCAL_CHARACTERS)
            UserManagement.add_user_to_update_queue(local_character.user_id, UI_Part.MARKET)
        }

        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.LOCAL_CHARACTERS)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.MARKET)

        // exploration
        character.explored[cell.id] = true
        let neighbours = MapSystem.neighbours_cells(cell.id)
        for (let item of neighbours) {
            character.explored[item.id] = true
        }

        //updates
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.EXPLORED)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.LOCAL_ACTIONS)
    }
}

export namespace Unlink {
    export function user_data_and_character(user: UserData| undefined, character: Character|undefined) {
        if (user == undefined) return
        if (character == undefined) return
        console.log('unlinking user and character')
        user.char_id = '@'
        character.user_id = '#'
        UserManagement.add_user_to_update_queue(user.id, 'character_removal')
    }

    export function character_and_cell(character: Character, cell: Cell) {
        cell.exit(character.id)
        Alerts.cell_locals(cell)
    }

    export function character_and_battle(character: Character, battle: Battle|undefined) {
        if (battle == undefined) return
        const unit = Convert.character_to_unit(character)
        BattleEvent.Leave(battle, unit)
        character.battle_id = -1 as battle_id
        character.battle_unit_id = -1 as unit_id
    }
}

    // enter(char: Character) {
    //     this.characters_set.add(char.id)
    //     this.world.socket_manager.send_market_info_character(this, char)
        
    //     this.world.socket_manager.send_cell_updates(this)
    // }

    // exit(char: Character) {
    //     this.characters_set.delete(char.id)
    //     this.world.socket_manager.send_cell_updates(this)
    // }
