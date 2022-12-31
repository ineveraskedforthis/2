"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.craft_bulk = exports.craft_item = void 0;
const user_manager_1 = require("../client_communication/user_manager");
const events_1 = require("../events/events");
const system_1 = require("../items/system");
function craft_item(character, item, durability, skill, tier) {
    let result = system_1.ItemSystem.create(item);
    result.durability = durability(character, tier);
    result.durability += Math.round(Math.random() * 10);
    if (result.slot == 'weapon') {
        if (character.perks.weapon_maker)
            result.durability += 10;
    }
    else {
        if (character.perks.skin_armour_master && (item.material.string_tag == 'rat_skin')) {
            result.durability += 10;
        }
        if (character.perks.shoemaker && (item.slot == 'foot')) {
            result.durability += 10;
        }
    }
    character.equip.data.backpack.add(result);
    user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 6 /* UI_Part.INVENTORY */);
    user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 4 /* UI_Part.STASH */);
    events_1.Event.on_craft_update(character, skill, tier);
}
exports.craft_item = craft_item;
function craft_bulk(character, material, amount, skill, tier) {
    character.stash.inc(material, amount(character, tier));
    events_1.Event.on_craft_update(character, skill, tier);
    user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 4 /* UI_Part.STASH */);
}
exports.craft_bulk = craft_bulk;
