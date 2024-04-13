import { money } from "@custom_types/common"
import { roll_price_belief_sell_increase } from "../AI/ACTIONS_BASIC"
import { trim } from "../calculations/basic_functions"
import { Character } from "../character/character"
import { UI_Part } from "../client_communication/causality_graph"
import { UserManagement } from "../client_communication/user_manager"
import { material_index } from "@custom_types/inventory"
import { MarketOrders, ItemOrders } from "../market/system"
import { Convert } from "../systems_communication"
import { market_order_id } from "@custom_types/common"
import { Effect } from "./effects"
import { Data } from "../data/data_objects"
import { DataID } from "../data/data_id"

export namespace EventMarket {
    export function buy(character: Character, material:material_index, amount: number, price: money) {
        const response = MarketOrders.new_buy_order(material, amount, price, character)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)
        Effect.Update.cell_market(character.cell_id)
        return response
    }

    export function sell(character: Character, material:material_index, amount: number, price: money) {
        // console.log('sell ' + material + ' ' + amount + ' ' + price)
        const response = MarketOrders.new_sell_order(material, amount, price, character)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)
        Effect.Update.cell_market(character.cell_id)
        return response
    }

    export function sell_item(character: Character, index: number, price: money) {
        // console.log('sell item index ' + index)
        const response = ItemOrders.sell(character, index, price)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)
        Effect.Update.cell_market(character.cell_id)
        return response
    }

    export function execute_sell_order(buyer: Character, order_id: market_order_id, amount: number) {



        let result = MarketOrders.execute_sell_order(order_id, amount, buyer)
        const order = Data.MarketOrders.from_id(order_id)
        const seller = Data.Characters.from_id(order.owner_id)
        let order_amount = order.amount

        if ((seller.user_id == undefined) && (result == 'ok')) {
            roll_price_belief_sell_increase(seller, order.material, 1 / trim(order_amount, 1, 100))
        }

        UserManagement.add_user_to_update_queue(buyer.user_id, UI_Part.STASH)
        UserManagement.add_user_to_update_queue(buyer.user_id, UI_Part.SAVINGS)
        UserManagement.add_user_to_update_queue(seller.user_id, UI_Part.SAVINGS)
        UserManagement.add_user_to_update_queue(seller.user_id, UI_Part.STASH)

        Effect.Update.cell_market(buyer.cell_id)
    }

    export function execute_buy_order(seller:Character, order_id: market_order_id, amount: number) {
        MarketOrders.execute_buy_order(order_id, amount, seller)
        const order = Data.MarketOrders.from_id(order_id)
        const buyer = Data.Characters.from_id(order.owner_id)

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
        let temporary_list:market_order_id[] = DataID.Character.market_orders_list(character.id)
        remove_orders_list(temporary_list)
    }

    function remove_orders_list(list: market_order_id[]) {
        for (let id of list) {
            remove_bulk_order(id)
        }
    }

    export function remove_bulk_order(order_id: market_order_id) {
        const order = Data.MarketOrders.from_id(order_id)
        MarketOrders.remove(order_id)
        const character = Data.Characters.from_id(order.owner_id)
        Effect.Update.cell_market(character.cell_id)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)
    }
}