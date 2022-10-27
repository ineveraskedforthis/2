"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryCommands = void 0;
const systems_communication_1 = require("../../systems_communication");
const inventory_events_1 = require("../../events/inventory_events");
var InventoryCommands;
(function (InventoryCommands) {
    function equip(sw, msg) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        inventory_events_1.EventInventory.equip_from_backpack(character, msg);
    }
    InventoryCommands.equip = equip;
    function switch_weapon(sw) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        if (character.in_battle()) {
            return;
        }
        inventory_events_1.EventInventory.switch_weapon(character);
    }
    InventoryCommands.switch_weapon = switch_weapon;
    // expected inputs 'right_hand', 'body', 'legs', 'foot', 'head', 'arms'
    function unequip(sw, msg) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        if (msg == "right_hand") {
            inventory_events_1.EventInventory.unequip(character, 'weapon');
        }
        else if (msg == 'secondary') {
            inventory_events_1.EventInventory.unequip_secondary(character);
        }
        else {
            switch (msg) {
                case 'body': {
                    inventory_events_1.EventInventory.unequip(character, 'body');
                    break;
                }
                case 'legs': {
                    inventory_events_1.EventInventory.unequip(character, 'legs');
                    break;
                }
                case 'foot': {
                    inventory_events_1.EventInventory.unequip(character, 'foot');
                    break;
                }
                case 'head': {
                    inventory_events_1.EventInventory.unequip(character, 'head');
                    break;
                }
                case 'arms': {
                    inventory_events_1.EventInventory.unequip(character, 'arms');
                    break;
                }
            }
        }
    }
    InventoryCommands.unequip = unequip;
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
})(InventoryCommands = exports.InventoryCommands || (exports.InventoryCommands = {}));
