import { money } from "@custom_types/common"
import { roll_price_belief_sell_increase } from "../AI/ACTIONS_BASIC"
import { trim } from "../calculations/basic_functions"
import { Character } from "../character/character"
import { UI_Part } from "../client_communication/causality_graph"
import { UserManagement } from "../client_communication/user_manager"
import { Data } from "../data"
import { material_index } from "@custom_types/inventory"
import { BulkOrders, ItemOrders } from "../market/system"
import { Convert } from "../systems_communication"
import { order_bulk_id } from "../types"
import { Effect } from "./effects"

export namespace EventMarket {
    export function buy(character: Character, material:material_index, amount: number, price: money) {
        const responce = BulkOrders.new_buy_order(material, amount, price, character)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)
        Effect.Update.cell_market(character.cell_id)
        return responce
    }

    export function sell(character: Character, material:material_index, amount: number, price: money) {
        // console.log('sell ' + material + ' ' + amount + ' ' + price)
        const responce = BulkOrders.new_sell_order(material, amount, price, character)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)
        Effect.Update.cell_market(character.cell_id)
        return responce
    }

    export function sell_item(character: Character, index: number, price: money) {
        // console.log('sell item index ' + index)
        const responce = ItemOrders.sell(character, index, price)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)
        Effect.Update.cell_market(character.cell_id)
        return responce
    }

    export function execute_sell_order(buyer: Character, order_id: order_bulk_id, amount: number) {



        let result = BulkOrders.execute_sell_order(order_id, amount, buyer)
        const order = Convert.id_to_bulk_order(order_id)
        const seller = Convert.id_to_character(order.owner_id)
        let order_amount = order.amount

        if ((seller.user_id == '#') && (result == 'ok')) {
            roll_price_belief_sell_increase(seller, order.tag, 1 / trim(order_amount, 1, 100))
        }

        UserManagement.add_user_to_update_queue(buyer.user_id, UI_Part.STASH)
        UserManagement.add_user_to_update_queue(buyer.user_id, UI_Part.SAVINGS)
        UserManagement.add_user_to_update_queue(seller.user_id, UI_Part.SAVINGS)
        UserManagement.add_user_to_update_queue(seller.user_id, UI_Part.STASH)

        Effect.Update.cell_market(buyer.cell_id)
    }

    export function execute_buy_order(seller:Character, order_id: order_bulk_id, amount: number) {
        BulkOrders.execute_buy_order(order_id, amount, seller)
        const order = Convert.id_to_bulk_order(order_id)
        const buyer = Convert.id_to_character(order.owner_id)

        UserManagement.add_user_to_update_queue(buyer.user_id, UI_Part.STASH)
        UserManagement.add_user_to_update_queue(buyer.user_id, UI_Part.SAVINGS)
        UserManagement.add_user_to_update_queue(seller.user_id, UI_Part.SAVINGS)
        UserManagement.add_user_to_update_queue(seller.user_id, UI_Part.STASH)

        Effect.Update.cell_market(seller.cell_id)
    }

    export function buyout_item(seller: Character, buyer: Character, item_index: number) {
        ItemOrders.buy(item_index, buyer, seller)
        UserManagement.add_user_to_update_queue(buyer.user_id, UI_Part.BELONGINGS)
        UserManagement.add_user_to_update_queue(seller.user_id, UI_Part.BELONGINGS)
        Effect.Update.cell_market(buyer.cell_id)
    }

    /**
     * Clears all character orders.
     * @param character
     */
    export function clear_orders(character: Character) {
        // console.log('clear all orders of ' + character.get_name())
        remove_bulk_orders(character)
        remove_item_orders(character)
        character.trade_savings.transfer_all(character.savings)
        character.trade_stash.transfer_all(character.stash)
    }

    export function remove_item_orders(character: Character) {
        ItemOrders.remove_all_character(character)

        Effect.Update.cell_market(character.cell_id)
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
        Effect.Update.cell_market(character.cell_id)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)
    }
}