import { SocketWrapper, User } from "../user";
import { materials, material_index } from "../../manager_classes/materials_manager";
import { Alerts } from "./alerts";
import { Convert } from "../../systems_communication";
import { EventInventory } from "../../events/inventory_events";
import { EventMarket } from "../../events/market";
import { Data } from "../../data";
import { AuctionResponce, } from "../../market/system";
import { order_bulk_id } from "../../types";
import { Character } from "../../character/character";
import { slot } from "../../../../../shared/inventory";
import { money } from "../../../../../shared/common";

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
    export function unequip(sw: SocketWrapper, msg: slot) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return
        if (character.in_battle()) { return }


        if (msg == "weapon")    {EventInventory.unequip(character, 'weapon')}
        else if (msg == 'secondary'){EventInventory.unequip_secondary(character)}
        else {
            switch(msg) {
                case 'body':        {EventInventory.unequip(character, 'body');break;}
                case 'legs':        {EventInventory.unequip(character, 'legs');break;}
                case 'foot':        {EventInventory.unequip(character, 'foot');break;}
                case 'head':        {EventInventory.unequip(character, 'head');break;}
                case 'arms':        {EventInventory.unequip(character, 'arms');break;}
            }
        }
    }
    
    export function buy(sw: SocketWrapper, msg: any) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return

        console.log('buy')
        console.log(msg)
        if (isNaN(msg.price)) {
            user.socket.emit('alert', 'invalid_price')
            return
        }
        msg.price = Math.floor(msg.price)
        if (msg.price < 0) {
            user.socket.emit('alert', 'invalid_price')
        }
        

        if (isNaN(msg.amount)) {
            user.socket.emit('alert', 'invalid_amount')
            return
        }
        msg.amount = Math.floor(msg.amount)
        if (msg.amount <= 0) {
            user.socket.emit('alert', 'invalid_amount')
            return
        }


        if (isNaN(msg.material)) {
            user.socket.emit('alert', 'invalid_material')
            return
        }
        msg.material = Math.floor(msg.material)
        if (!materials.validate_material(msg.material)) {
            user.socket.emit('alert', 'invalid_material')
            return
        }

        let responce = EventMarket.buy(
            character, 
            msg.material as material_index, 
            msg.amount, 
            msg.price)
        if (responce != 'ok') {
            Alerts.generic_user_alert(user, 'alert', responce)
            return
        }
    }

    export function sell(sw: SocketWrapper, msg: any) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return

        console.log('sell')
        console.log(msg)
        if (isNaN(msg.price)) {
            user.socket.emit('alert', 'invalid_price')
            return
        }
        msg.price = Math.floor(msg.price)
        if (msg.price < 0) {
            user.socket.emit('alert', 'invalid_price')
            return
        }
        

        if (isNaN(msg.amount)) {
            user.socket.emit('alert', 'invalid_amount')
            return
        }
        msg.amount = Math.floor(msg.amount)
        if (msg.amount <= 0) {
            user.socket.emit('alert', 'invalid_amount')
            return
        }


        if (isNaN(msg.material)) {
            user.socket.emit('alert', 'invalid_material')
            return
        }
        msg.material = Math.floor(msg.material)
        if (!materials.validate_material(msg.material)) {
            user.socket.emit('alert', 'invalid_material')
            return
        }

        if (msg.price > 99999999999) {
            user.socket.emit('alert', 'invalid_price')
            return
        }

        console.log('sell is valid')

        let responce = EventMarket.sell(
            character, 
            msg.material as material_index, 
            msg.amount, 
            msg.price)
            
        if (responce != 'ok') {
            Alerts.generic_user_alert(user, 'alert', responce)
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

        const responce = EventMarket.sell_item(character, index, price as money)

        if (responce.responce != AuctionResponce.OK) {
            Alerts.generic_user_alert(user, 'alert', responce.responce)
        }
    }

    export function execute_bulk_order(sw: SocketWrapper, amount: number, order_id: number) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return
        
        const order = Convert.id_to_bulk_order(order_id)
        if (order == undefined) return
        const seller = Convert.id_to_character(order.owner_id)

        if (seller.cell_id != character.cell_id) return;
        if (isNaN(amount)) return

        let responce = 'ok'
        if (order.typ == 'buy') {
            EventMarket.execute_buy_order(character, order.id, amount)
        }
        if (order.typ == 'sell') {
            EventMarket.execute_sell_order(character, order.id, amount)
        }

        user.socket.emit('alert', responce)
    }

    export function buyout(sw: SocketWrapper, msg: string) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return

        // validate that user input is safe
        let id = parseInt(msg);
        if (isNaN(id)) {
            return
        }

        EventMarket.buyout_item(character, Number(msg))
    }

    export function clear_bulk_order(sw: SocketWrapper, data: number) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return

        if (isNaN(data)) return

        let order = Data.BulkOrders.from_id(data as order_bulk_id)
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

    //  disenchant(user: User, msg: number) {
    //     if (user.logged_in) {
    //         let char = user.get_character();
    //         // let res =  char.disenchant(this.pool, msg);
    //         // if (res != 'ok') {
    //         //     socket.emit('alert', res);
    //         // }
    //     }
    // }
}