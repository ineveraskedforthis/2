import { Character } from "../character/character"
import { UI_Part } from "../client_communication/causality_graph"
import { Alerts } from "../client_communication/network_actions/alerts"
import { UserManagement } from "../client_communication/user_manager"
import { Data } from "../data"
import { material_index } from "../manager_classes/materials_manager"
import { Cell } from "../map/cell"
import { OrderBulk } from "../market/classes"
import { BulkOrders, ItemOrders } from "../market/system"
import { Convert } from "../systems_communication"
import { money, order_bulk_id } from "../types"
import { Effect } from "./effects"

export namespace EventMarket {
    export function buy(character: Character, material:material_index, amount: number, price: money) {
        const responce = BulkOrders.new_buy_order(material, amount, price, character)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)

        const cell = Convert.character_to_cell(character)
        Effect.Update.cell_market(cell)

        return responce
    }

    export function sell(character: Character, material:material_index, amount: number, price: money) {
        // console.log('sell ' + material + ' ' + amount + ' ' + price)
        const responce = BulkOrders.new_sell_order(material, amount, price, character)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)

        const cell = Convert.character_to_cell(character)
        Effect.Update.cell_market(cell)

        return responce
    }

    export function sell_item(character: Character, index: number, price: money) {
        // console.log('sell item index ' + index)
        const responce = ItemOrders.sell(character, index, price)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)

        const cell = Convert.character_to_cell(character)
        Effect.Update.cell_market(cell)
        return responce
    }

    export function execute_sell_order(buyer: Character, order_id: order_bulk_id, amount: number) {
        BulkOrders.execute_sell_order(order_id, amount, buyer)
        const order = Convert.id_to_bulk_order(order_id)
        const seller = Convert.id_to_character(order.owner_id)

        UserManagement.add_user_to_update_queue(buyer.user_id, UI_Part.STASH)
        UserManagement.add_user_to_update_queue(buyer.user_id, UI_Part.SAVINGS)
        UserManagement.add_user_to_update_queue(seller.user_id, UI_Part.SAVINGS)
        UserManagement.add_user_to_update_queue(seller.user_id, UI_Part.STASH)

        const cell = Convert.character_to_cell(seller)
        Effect.Update.cell_market(cell)
    }

    export function execute_buy_order(seller:Character, order_id: order_bulk_id, amount: number) {
        BulkOrders.execute_buy_order(order_id, amount, seller)
        const order = Convert.id_to_bulk_order(order_id)
        const buyer = Convert.id_to_character(order.owner_id)

        UserManagement.add_user_to_update_queue(buyer.user_id, UI_Part.STASH)
        UserManagement.add_user_to_update_queue(buyer.user_id, UI_Part.SAVINGS)
        UserManagement.add_user_to_update_queue(seller.user_id, UI_Part.SAVINGS)
        UserManagement.add_user_to_update_queue(seller.user_id, UI_Part.STASH)
        
        const cell = Convert.character_to_cell(seller)
        Effect.Update.cell_market(cell)
    }

    export function buyout_item(buyer: Character, order_id: number) {
        

        const order = Convert.id_to_order_item(order_id)
        if (order == undefined) return 

        const seller = Convert.id_to_character(order.owner_id)
        ItemOrders.buy_unsafe(order_id, buyer)

        UserManagement.add_user_to_update_queue(buyer.user_id, UI_Part.BELONGINGS)
        UserManagement.add_user_to_update_queue(seller.user_id, UI_Part.SAVINGS)

        const cell = Convert.character_to_cell(buyer)
        Effect.Update.cell_market(cell)
    }

    /**
     * Clears all character orders.
     * @param character 
     */
    export function clear_orders(character: Character) {
        // console.log('clear all orders of ' + character.name)
        remove_bulk_orders(character)
        remove_item_orders(character)
        character.trade_savings.transfer_all(character.savings)        
    }

    export function remove_item_orders(character: Character) {
        ItemOrders.remove_all_character(character)

        const cell = Convert.character_to_cell(character)
        Effect.Update.cell_market(cell)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)
    }

    export function remove_bulk_orders(character: Character) {
        let temporary_list:order_bulk_id[] = Array.from(Data.CharacterBulkOrders(character.id))
        remove_orders_list(temporary_list)
    }

    function remove_orders_list(list: order_bulk_id[]) {
        for (let id of list) {
            remove_bulk_order(id)
        }
    }

    export function remove_bulk_order(order_id: order_bulk_id) {
        const order = Data.BulkOrders.from_id(order_id)      
        BulkOrders.remove(order_id)

        const character = Data.CharacterDB.from_id(order.owner_id)
        const cell = Convert.character_to_cell(character)
        Effect.Update.cell_market(cell)   
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)     
    }
}