"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventInventory = void 0;
const user_manager_1 = require("../client_communication/user_manager");
var EventInventory;
(function (EventInventory) {
    function equip_from_backpack(character, index) {
        character.equip.equip_from_backpack(index);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 6 /* UI_Part.INVENTORY */);
    }
    EventInventory.equip_from_backpack = equip_from_backpack;
    function unequip(character, slot) {
        character.equip.unequip(slot);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 6 /* UI_Part.INVENTORY */);
    }
    EventInventory.unequip = unequip;
    function unequip_secondary(character) {
        character.equip.unequip_secondary();
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 6 /* UI_Part.INVENTORY */);
    }
    EventInventory.unequip_secondary = unequip_secondary;
    function switch_weapon(character) {
        character.equip.switch_weapon();
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 6 /* UI_Part.INVENTORY */);
    }
    EventInventory.switch_weapon = switch_weapon;
    function add_item(character, item) {
        const responce = character.equip.data.backpack.add(item);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 3 /* UI_Part.BELONGINGS */);
        return responce;
    }
    EventInventory.add_item = add_item;
    function test(character) {
    }
})(EventInventory = exports.EventInventory || (exports.EventInventory = {}));
