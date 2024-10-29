import { MATERIAL, MaterialStorage } from "@content/content"
import { money } from "@custom_types/common"
import { market_order_id } from "@custom_types/ids"
import { AIfunctions } from "../AI/HelperFunctions/common"
import { trim } from "../calculations/basic_functions"
import { UI_Part } from "../client_communication/causality_graph"
import { UserManagement } from "../client_communication/user_manager"
import { DataID } from "../data/data_id"
import { Data } from "../data/data_objects"
import { Character } from "../data/entities/character"
import { Effect } from "../effects/effects"
import { ItemOrders, MarketOrders } from "../market/system"
import { MarketOrder } from "../market/classes"

export namespace EventMarket {
    export function buy(character: Character, material:MATERIAL, amount: number, price: money) {
        const response = MarketOrders.new_buy_order(material, amount, price, character)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.BELONGINGS)
        Effect.Update.cell_market(character.cell_id)
        return response
    }

    export function sell(character: Character, material:MATERIAL, amount: number, price: money) {
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

    export function execute_sell_order(buyer: Character, order_id: market_order_id, amount: number) : number {

        let result = MarketOrders.execute_sell_order(order_id, amount, buyer)
        const order = Data.MarketOrders.from_id(order_id)
        const seller = Data.Characters.from_id(order.owner_id)

        if (result.tag == 'ok') {
            if (seller.user_id == undefined) {
                AIfunctions.on_sale_price_update(seller, order.material, result.amount)
            }
            if (buyer.user_id == undefined) {
                AIfunctions.on_buyment_price_update(buyer, order.amount, result.amount)
            }
        }


        UserManagement.add_user_to_update_queue(buyer.user_id, UI_Part.STASH)
        UserManagement.add_user_to_update_queue(buyer.user_id, UI_Part.SAVINGS)
        UserManagement.add_user_to_update_queue(seller.user_id, UI_Part.SAVINGS)
        UserManagement.add_user_to_update_queue(seller.user_id, UI_Part.STASH)

        Effect.Update.cell_market(buyer.cell_id)

        if (result.tag == "ok") {
            return result.amount
        }
        return 0
    }

    export function execute_buy_order(seller:Character, order_id: market_order_id, amount: number) {
        const result = MarketOrders.execute_buy_order(order_id, amount, seller)
        const order = Data.MarketOrders.from_id(order_id)
        const buyer = Data.Characters.from_id(order.owner_id)

        if (result.tag == 'ok') {
            if (seller.user_id == undefined) {
                AIfunctions.on_sale_price_update(seller, order.material, result.amount)
            }
            if (buyer.user_id == undefined) {
                AIfunctions.on_buyment_price_update(buyer, order.amount, result.amount)
            }
        }


        UserManagement.add_user_to_update_queue(buyer.user_id, UI_Part.STASH)
        UserManagement.add_user_to_update_queue(buyer.user_id, UI_Part.SAVINGS)
        UserManagement.add_user_to_update_queue(seller.user_id, UI_Part.SAVINGS)
        UserManagement.add_user_to_update_queue(seller.user_id, UI_Part.STASH)

        Effect.Update.cell_market(seller.cell_id)

        if (result.tag == "ok") {
            return result.amount
        }
        return 0
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

    export function sell_smart_with_limits(character: Character, material: MATERIAL, min_price: money, max_amount: number) {
        const sold = sell_with_limits(character, material, min_price, max_amount)
        sell(character, material, max_amount - sold, min_price)
    }

    export function buy_smart_with_limits(character: Character, material: MATERIAL, max_price: money, max_amount: number) {
        const bought = buy_with_limits(character, material, max_price, max_amount)
        buy(character, material, max_amount - bought, max_price)
    }

    export function sell_with_limits(character: Character, material: MATERIAL, min_price: money, max_amount: number) : number {
        let best_order : (MarketOrder|undefined) = undefined;
        let best_price = min_price;

        DataID.Cells.for_each_market_order(character.cell_id, (item) => {
            let order = Data.MarketOrders.from_id(item);
            if (order.typ == 'sell')
                return;
            if (order.material != material)
                return;
            if ((best_price <= order.price) && (order.amount > 0)) {
                best_price = order.price;
                best_order = order;
            }
        })

        if (best_order == undefined)
            return 0;

        if (character.savings.get() >= best_price) {
            return execute_buy_order(
                character,
                (best_order as MarketOrder).id,
                Math.min(
                    Math.floor(character.savings.get() / best_price),
                    max_amount
                )
            );
        }
        return 0;
    }

    export function buy_with_limits(character: Character, material: MATERIAL, max_price: money, max_amount: number) : number {
        let best_order = undefined;
        let best_price = max_price;
        DataID.Cells.for_each_market_order(character.cell_id, (item) => {
            let order = Data.MarketOrders.from_id(item);
            if (order.typ == 'buy')
                return;
            if (order.material != material)
                return;
            if ((best_price >= order.price) && (order.amount > 0)) {
                best_price = order.price;
                best_order = order;
            }
        })

        if (best_order == undefined)
            return 0;

        if (character.savings.get() >= best_price) {
            return execute_sell_order(
                character,
                (best_order as MarketOrder).id,
                Math.min(
                    Math.floor(character.savings.get() / best_price),
                    max_amount
                )
            );
        }
        return 0;
    }
}