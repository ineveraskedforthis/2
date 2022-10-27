import { roll_affix_armour, roll_affix_weapon } from "../../base_game_classes/affix";
import { SocketWrapper, User } from "../user";
import { ZAZ } from "../../manager_classes/materials_manager";
import { Alerts } from "./alerts";
import { Validator } from "./common_validations";
import { Convert } from "../../systems_communication";
import { CharacterSystem } from "../../base_game_classes/character/system";
import { Event } from "../../events/events";
import { EventInventory } from "../../events/inventory_events";

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
}