"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventInventory = void 0;
const user_manager_1 = require("../client_communication/user_manager");
const affix_1 = require("../base_game_classes/affix");
const materials_manager_1 = require("../manager_classes/materials_manager");
const alerts_1 = require("../client_communication/network_actions/alerts");
const effects_1 = require("./effects");
const events_1 = require("./events");
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
    function destroy_in_backpack(character, index) {
        const item = character.equip.data.backpack.items[index];
        if (item == undefined)
            return;
        const material = materials_manager_1.materials.tag_to_index(item.material.string_tag);
        events_1.Event.change_stash(character, material, 1);
        character.equip.data.backpack.remove(index);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 6 /* UI_Part.INVENTORY */);
    }
    EventInventory.destroy_in_backpack = destroy_in_backpack;
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
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 6 /* UI_Part.INVENTORY */);
        return responce;
    }
    EventInventory.add_item = add_item;
    function enchant(character, index) {
        let enchant_rating = character.stats.stats.magic_power * (1 + character.skills.magic_mastery / 100);
        // so it's ~15 at 50 magic mastery
        // and 1 at 20 magic mastery
        if (character.perks.mage_initiation) {
            enchant_rating = enchant_rating * 2;
        }
        let item = character.equip.data.backpack.items[index];
        if (item == undefined)
            return;
        if (character.stash.get(materials_manager_1.ZAZ) < 1) {
            alerts_1.Alerts.not_enough_to_character(character, 'ZAZ', 1, character.stash.get(materials_manager_1.ZAZ));
            return;
        }
        events_1.Event.change_stash(character, materials_manager_1.ZAZ, -1);
        if (character.skills.magic_mastery < 10)
            effects_1.Effect.Change.skill(character, 'magic_mastery', 1);
        if (item.is_weapon())
            (0, affix_1.roll_affix_weapon)(enchant_rating, item);
        else
            (0, affix_1.roll_affix_armour)(enchant_rating, item);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 3 /* UI_Part.BELONGINGS */);
    }
    EventInventory.enchant = enchant;
    function test(character) {
    }
})(EventInventory = exports.EventInventory || (exports.EventInventory = {}));
