"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventInventory = void 0;
const user_manager_1 = require("../client_communication/user_manager");
const affix_1 = require("../base_game_classes/affix");
const alerts_1 = require("../client_communication/network_actions/alerts");
const effects_1 = require("../effects/effects");
const events_1 = require("./events");
const system_1 = require("../character/system");
const data_objects_1 = require("../data/data_objects");
const item_1 = require("../../content_wrappers/item");
var EventInventory;
(function (EventInventory) {
    function equip_from_backpack(character, index) {
        character.equip.equip_from_backpack(index, character.model);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 10 /* UI_Part.INVENTORY */);
    }
    EventInventory.equip_from_backpack = equip_from_backpack;
    function unequip(character, slot) {
        character.equip.unequip(slot);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 10 /* UI_Part.INVENTORY */);
    }
    EventInventory.unequip = unequip;
    function destroy_in_backpack(character, index) {
        const item = character.equip.data.backpack.items[index];
        if (item == undefined)
            return;
        const item_data = data_objects_1.Data.Items.from_id(item);
        events_1.Event.change_stash(character, item_data.prototype.material, 1);
        character.equip.data.backpack.remove(index);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 10 /* UI_Part.INVENTORY */);
    }
    EventInventory.destroy_in_backpack = destroy_in_backpack;
    function destroy_in_backpack_by_item_id(character, item) {
        console.log("attempt to destroy item with id ", item);
        const index = character.equip.data.backpack.items.indexOf(item);
        destroy_in_backpack(character, index);
    }
    EventInventory.destroy_in_backpack_by_item_id = destroy_in_backpack_by_item_id;
    function switch_weapon(character) {
        character.equip.switch_weapon();
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 10 /* UI_Part.INVENTORY */);
    }
    EventInventory.switch_weapon = switch_weapon;
    function add_item(character, item) {
        const response = character.equip.data.backpack.add(item);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 10 /* UI_Part.INVENTORY */);
        return response;
    }
    EventInventory.add_item = add_item;
    function enchant(character, index) {
        let enchant_rating = system_1.CharacterSystem.enchant_rating(character);
        let item = data_objects_1.Data.Items.from_id(character.equip.data.backpack.items[index]);
        if (item == undefined)
            return;
        if (character.stash.get(30 /* MATERIAL.ZAZ */) < 1) {
            alerts_1.Alerts.not_enough_to_character(character, 'ZAZ', character.stash.get(30 /* MATERIAL.ZAZ */), 1, undefined);
            return;
        }
        events_1.Event.change_stash(character, 30 /* MATERIAL.ZAZ */, -1);
        const pure_skill = system_1.CharacterSystem.pure_skill(character, 'magic_mastery');
        if (pure_skill < 10)
            effects_1.Effect.Change.skill(character, 'magic_mastery', 1, "Enchanting" /* CHANGE_REASON.ENCHANTING */);
        if ((0, item_1.is_weapon)(item))
            (0, affix_1.roll_affix_weapon)(enchant_rating, item);
        else
            (0, affix_1.roll_affix_armour)(enchant_rating, item);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 7 /* UI_Part.BELONGINGS */);
    }
    EventInventory.enchant = enchant;
    function reroll_enchant(character, index) {
        let enchant_rating = system_1.CharacterSystem.enchant_rating(character) * 0.8;
        let item = data_objects_1.Data.Items.from_id(character.equip.data.backpack.items[index]);
        if (item == undefined)
            return;
        if (character.stash.get(30 /* MATERIAL.ZAZ */) < 1) {
            alerts_1.Alerts.not_enough_to_character(character, 'ZAZ', character.stash.get(30 /* MATERIAL.ZAZ */), 1, undefined);
            return;
        }
        let rolls = item.affixes.length;
        events_1.Event.change_stash(character, 30 /* MATERIAL.ZAZ */, -1);
        const pure_skill = system_1.CharacterSystem.pure_skill(character, 'magic_mastery');
        if (pure_skill < 10 * rolls)
            effects_1.Effect.Change.skill(character, 'magic_mastery', 1, "Enchanting" /* CHANGE_REASON.ENCHANTING */);
        item.affixes = [];
        for (let i = 0; i < rolls; i++) {
            if ((0, item_1.is_weapon)(item))
                (0, affix_1.roll_affix_weapon)(enchant_rating, item);
            else
                (0, affix_1.roll_affix_armour)(enchant_rating, item);
        }
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 7 /* UI_Part.BELONGINGS */);
    }
    EventInventory.reroll_enchant = reroll_enchant;
    function test(character) {
    }
})(EventInventory || (exports.EventInventory = EventInventory = {}));
