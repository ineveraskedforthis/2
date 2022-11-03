import { roll_affix_armour, roll_affix_weapon } from "../../base_game_classes/affix";
import { SocketWrapper, User } from "../user";
import { materials, material_index, ZAZ } from "../../manager_classes/materials_manager";
import { Alerts } from "./alerts";
import { Validator } from "./common_validations";
import { Convert } from "../../systems_communication";
import { CharacterSystem } from "../../base_game_classes/character/system";
import { Event } from "../../events/events";
import { EventInventory } from "../../events/inventory_events";
import { OrderBulk } from "../../market/classes";
import { EventMarket } from "../../events/market";
import { Data } from "../../data";

export namespace InventoryCommands {
    export function equip(sw: SocketWrapper, msg: number) {
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return
        
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

        if (msg == "right_hand")    {EventInventory.unequip(character, 'weapon')}
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

    // export function enchant_weapon(sw: SocketWrapper, msg: number) {
    //     if (!Validator.valid_user(user)) return false
    //     let character = Convert.user_to_character(user)
    //     let item = character.equip.data.backpack.weapons[msg];
        

    //     if (item != undefined) {
    //         let REQUIRED_AMOUNT = 1
    //         let AMOUNT = character.stash.get(ZAZ)

    //         if ( AMOUNT >= REQUIRED_AMOUNT) {
    //             roll_affix_weapon(character.get_enchant_rating(), item)
    //             character.stash.inc(ZAZ, -1)
    //         } else {
    //             Alerts.not_enough_to_user(user, 'zaz', REQUIRED_AMOUNT, AMOUNT)
    //         }                
    //     }
    // }

    // export function enchant_armour(sw: SocketWrapper, msg: number) {
    //     if (!Validator.valid_user(user)) return false
    //     let character = Convert.user_to_character(user)

    //     let item = character.equip.data.backpack.armours[msg]
    //     if (item != undefined) {
    //         let REQUIRED_AMOUNT = 1
    //         let AMOUNT = character.stash.get(ZAZ)

    //         if (AMOUNT >= REQUIRED_AMOUNT) {
    //             roll_affix_armour(character.get_enchant_rating(), item)
    //             character.stash.inc(ZAZ, -1)
    //         } else {
    //             Alerts.not_enough_to_user(user, 'zaz', REQUIRED_AMOUNT, AMOUNT)
    //         }                
    //     }            
    // }




    // export function sell_item(sw: SocketWrapper, msg: any) {
    //     if (!Validator.valid_user(user)) return false
    //     let character = Convert.user_to_character(user)
    //     let index = parseInt(msg.index);

    //     let type = msg.item_type
    //     let price = parseInt(msg.price);
    //     if ((type != 'armour') && (type != 'weapon')) return;
    //     if (isNaN(index) || isNaN(price)) return;
    //     AuctionManagement.sell(entity_manager, character, type, index, price as money, price as money)
    // }

    // export function buyout(sw: SocketWrapper, msg: string) {
    //     if (!Validator.valid_user(user)) return false
    //     let character = Convert.user_to_character(user)

    //     // validate that user input is safe
    //     let id = parseInt(msg);
    //     if (isNaN(id)) {
    //         return
    //     }

    //     let responce = AuctionManagement.buyout(entity_manager, character, id as auction_order_id_raw)
    // }

    
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

        let responce = EventMarket.sell(
            character, 
            msg.material as material_index, 
            msg.amount, 
            msg.price)
            
        if (responce != 'ok') {
            Alerts.generic_user_alert(user, 'alert', responce)
        }
    }

    // export function clear_bulk_order(sw: SocketWrapper, data: number) {
    //     const [user, character] = Convert.socket_wrapper_to_user_character(sw)
    //     if (character == undefined) return

    //     let order = Data. this.world.entity_manager.orders[data]
    //     if (order.owner_id != character.id) {
    //         user.socket.emit('alert', 'not your order')
    //         return
    //     }

    //     this.world.entity_manager.remove_order(this.pool, data as market_order_index)

    // }
}