import { Character } from "../base_game_classes/character/character"
import { UI_Part } from "../client_communication/causality_graph"
import { UserManagement } from "../client_communication/user_manager"
import { material_index } from "../manager_classes/materials_manager"
import { OrderBulk } from "../market/classes"
import { BulkOrders } from "../market/system"
import { Convert } from "../systems_communication"
import { money } from "../types"

export namespace EventMarket {
    export function buy(character: Character, material:material_index, amount: number, price: money) {
        console.log('buy ' + material + ' ' + amount + ' ' + price)
        const responce = BulkOrders.new_buy_order(material, amount, price, character)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)

        const cell = Convert.character_to_cell(character)
        const locals = cell.get_characters_list()
        for (let item of locals) {
            const id = item.id
            const local_character = Convert.id_to_character(id)
            UserManagement.add_user_to_update_queue(local_character.user_id, UI_Part.MARKET)
        }

        return responce
    }

    export function sell(character: Character, material:material_index, amount: number, price: money) {
        console.log('sell ' + material + ' ' + amount + ' ' + price)
        const responce = BulkOrders.new_sell_order(material, amount, price, character)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)

        const cell = Convert.character_to_cell(character)
        const locals = cell.get_characters_list()
        for (let item of locals) {
            const id = item.id
            const local_character = Convert.id_to_character(id)
            UserManagement.add_user_to_update_queue(local_character.user_id, UI_Part.MARKET)
        }

        return responce
    }

    // export function clear_orders(character: Character) {
    //     BulkOrders.
    //      character.world.entity_manager.remove_orders(pool, character)
    //      AuctionManagement.cancel_all_orders(pool, character.world.entity_manager, character.world.socket_manager, character)
    // }
}