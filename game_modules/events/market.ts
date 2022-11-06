import { Character } from "../base_game_classes/character/character"
import { UI_Part } from "../client_communication/causality_graph"
import { UserManagement } from "../client_communication/user_manager"
import { material_index } from "../manager_classes/materials_manager"
import { OrderBulk } from "../market/classes"
import { BulkOrders, ItemOrders } from "../market/system"
import { Convert } from "../systems_communication"
import { money } from "../types"
import { Effect } from "./effects"

export namespace EventMarket {
    export function buy(character: Character, material:material_index, amount: number, price: money) {
        console.log('buy ' + material + ' ' + amount + ' ' + price)
        const responce = BulkOrders.new_buy_order(material, amount, price, character)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)

        const cell = Convert.character_to_cell(character)
        Effect.Update.cell_market(cell)

        return responce
    }

    export function sell(character: Character, material:material_index, amount: number, price: money) {
        console.log('sell ' + material + ' ' + amount + ' ' + price)
        const responce = BulkOrders.new_sell_order(material, amount, price, character)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)

        const cell = Convert.character_to_cell(character)
        Effect.Update.cell_market(cell)

        return responce
    }

    export function sell_item(character: Character, index: number, price: money) {
        console.log('sell item index ' + index)
        const responce = ItemOrders.sell(character, index, price)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)

        const cell = Convert.character_to_cell(character)
        Effect.Update.cell_market(cell)
        return responce
    }

    // export function clear_orders(character: Character) {
    //     BulkOrders.
    //      character.world.entity_manager.remove_orders(pool, character)
    //      AuctionManagement.cancel_all_orders(pool, character.world.entity_manager, character.world.socket_manager, character)
    // }
}