import { SocketWrapper, User } from "../user";
import { Alerts } from "./alerts";
import { Convert } from "../../systems_communication";
import { EventInventory } from "../../events/inventory_events";
import { EventMarket } from "../../events/market";
import { AuctionResponse, } from "../../market/system";
import { market_order_id } from "@custom_types/ids";
import { Character } from "../../character/character";
import { Data } from "../../data/data_objects";
import { EquipSlotConfiguration, EquipSlotStorage, MaterialConfiguration } from "@content/content";
import { money } from "@custom_types/common";

function r(f: (user: User, character: Character) => void): (sw: SocketWrapper) => void {
    return (sw: SocketWrapper) => {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return
        f(user, character)
    }
}

export namespace InventoryCommands {
    export function equip(sw: SocketWrapper, msg: number) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return
        if (character.in_battle()) { return }

        EventInventory.equip_from_backpack(character, msg)
    }

    export function switch_weapon(sw: SocketWrapper) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return
        if (character.in_battle()) { return }
        EventInventory.switch_weapon(character)
    }

    // expected inputs 'right_hand', 'body', 'legs', 'foot', 'head', 'arms'
    export function unequip(sw: SocketWrapper, msg: string) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return
        if (character.in_battle()) { return }
        if (EquipSlotConfiguration.is_valid_string_id(msg))
        EventInventory.unequip(character, EquipSlotStorage.from_string(msg).id)
    }

    type trade_object_key = "price" | "amount" | "material"

    export function buy(sw: SocketWrapper, msg: Partial<Record<trade_object_key, number>>) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return

        console.log('buy')
        console.log(msg)

        if (typeof msg != "object") {
            return
        }
        if (msg == null) {
            return
        }
        const key_price : trade_object_key = "price"
        const key_amount : trade_object_key = "amount"
        const key_material : trade_object_key = "material"
        if (!(key_price in msg)) {
            return
        }
        if (!(key_amount in msg)) {
            return
        }
        if (!(key_material in msg)) {
            return
        }
        let price = msg[key_price]
        let amount = msg[key_amount]
        let material = msg[key_material]
        if (!(typeof price == "number")) {
            return
        }
        if (!(typeof amount == "number")) {
            return
        }
        if (!(typeof material == "number")) {
            return
        }
        if (isNaN(price)) {
            user.socket.emit('alert', 'invalid_price')
            return
        }
        if (isNaN(amount)) {
            user.socket.emit('alert', 'invalid_amount')
            return
        }
        if (isNaN(material)) {
            user.socket.emit('alert', 'invalid_material')
            return
        }
        price = Math.floor(price)
        amount = Math.floor(amount)
        material = Math.floor(material)
        if (!(typeof price == "number")) {
            return
        }
        if (!(typeof amount == "number")) {
            return
        }
        if (!(typeof material == "number")) {
            return
        }
        if (price < 0) {
            user.socket.emit('alert', 'invalid_price')
        }
        if (amount <= 0) {
            user.socket.emit('alert', 'invalid_amount')
            return
        }
        if (!MaterialConfiguration.is_valid_id(material)) {
            user.socket.emit('alert', 'invalid_material')
            return
        }

        let response = EventMarket.buy(
            character,
            material,
            amount,
            price as money)
        if (response != 'ok') {
            Alerts.generic_user_alert(user, 'alert', response)
            return
        }
    }

    export function sell(sw: SocketWrapper, msg: any) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return

        console.log('sell')
        console.log(msg)
        if (typeof msg != "object") {
            return
        }
        if (msg == null) {
            return
        }
        if (!("price" in msg)) {
            return
        }
        if (!("amount" in msg)) {
            return
        }
        if (!("material" in msg)) {
            return
        }
        let price = msg["price"]
        let amount = msg["amount"]
        let material = msg["material"]
        if (!(typeof price == "number")) {
            return
        }
        if (!(typeof amount == "number")) {
            return
        }
        if (!(typeof material == "number")) {
            return
        }
        if (isNaN(price)) {
            user.socket.emit('alert', 'invalid_price')
            return
        }
        if (isNaN(amount)) {
            user.socket.emit('alert', 'invalid_amount')
            return
        }
        if (isNaN(material)) {
            user.socket.emit('alert', 'invalid_material')
            return
        }
        price = Math.floor(price)
        amount = Math.floor(amount)
        material = Math.floor(material)
        if (!(typeof price == "number")) {
            return
        }
        if (!(typeof amount == "number")) {
            return
        }
        if (!(typeof material == "number")) {
            return
        }
        if (price < 0) {
            user.socket.emit('alert', 'invalid_price')
        }
        if (amount <= 0) {
            user.socket.emit('alert', 'invalid_amount')
            return
        }
        if (!MaterialConfiguration.is_valid_id(material)) {
            user.socket.emit('alert', 'invalid_material')
            return
        }

        if (price > 99999999999) {
            user.socket.emit('alert', 'invalid_price')
            return
        }

        console.log('sell is valid')

        let response = EventMarket.sell(
            character,
            material,
            amount,
            price as money)

        if (response != 'ok') {
            Alerts.generic_user_alert(user, 'alert', response)
        }
    }

    export function sell_item(sw: SocketWrapper, msg: any) {
        console.log('attempt to sell item ' + JSON.stringify(msg))
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return

        let index = parseInt(msg.index);
        let price = parseInt(msg.price);
        if (isNaN(index) || isNaN(price)) return;
        console.log('validated')

        const response = EventMarket.sell_item(character, index, price as money)

        if (response.response != AuctionResponse.OK) {
            console.log("impossible sale")
            console.log(response.response)
            Alerts.generic_user_alert(user, 'alert', response.response)
        }
    }

    export function execute_bulk_order(sw: SocketWrapper, amount: number, order_id: number) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return

        const order = Data.MarketOrders.from_number(order_id)
        if (order == undefined) return
        const seller = Data.Characters.from_id(order.owner_id)

        if (seller.cell_id != character.cell_id) return;
        if (isNaN(amount)) return

        let response = 'ok'
        if (order.typ == 'buy') {
            EventMarket.execute_buy_order(character, order.id, amount)
        }
        if (order.typ == 'sell') {
            EventMarket.execute_sell_order(character, order.id, amount)
        }

        user.socket.emit('alert', response)
    }

    function validate_item_buyout(msg: unknown): msg is {character_id: number, item_id: number} {
        if (msg == undefined) return false
        if (typeof msg != 'object') return false
        if (!('character_id' in msg)) return false
        if (!('item_id' in msg)) return false
        return true
    }

    export function buyout(sw: SocketWrapper, msg: unknown) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return
        if (!validate_item_buyout(msg)) return

        const character_id = msg.character_id
        const item_id = msg.item_id

        if (typeof character_id !== 'number') return
        if (typeof item_id !== 'number') return

        let seller = Data.Characters.from_number(character_id)
        if (seller == undefined) return

        EventMarket.buyout_item(seller, character, item_id)
    }

    export function clear_bulk_order(sw: SocketWrapper, data: number) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return

        if (isNaN(data)) return

        let order = Data.MarketOrders.from_id(data as market_order_id)
        if (order == undefined) return

        if (order.owner_id != character.id) {
            user.socket.emit('alert', 'not your order')
            return
        }

        EventMarket.remove_bulk_order(order.id)
    }

    export function clear_bulk_orders(sw: SocketWrapper) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return

        EventMarket.remove_bulk_orders(character)
    }

    export function clear_item_orders(sw: SocketWrapper) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return

        EventMarket.remove_item_orders(character)
    }

    export function break_item(sw: SocketWrapper, msg: number) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return
        msg = Number(msg)

        if (isNaN(msg)) return

        EventInventory.destroy_in_backpack(character, msg)
    }

    export function enchant(sw: SocketWrapper, msg: number) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return
        msg = Number(msg)

        if (isNaN(msg)) return

        EventInventory.enchant(character, msg)
    }

    export function reroll_enchant(sw: SocketWrapper, msg: number) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return
        msg = Number(msg)

        if (isNaN(msg)) return

        EventInventory.reroll_enchant(character, msg)
    }
}