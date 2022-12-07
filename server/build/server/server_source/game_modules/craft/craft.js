"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.craft_bulk = exports.craft_item = void 0;
const user_manager_1 = require("../client_communication/user_manager");
const events_1 = require("../events/events");
const system_1 = require("../items/system");
function craft_item(character, item, durability, skill, tier) {
    let spear = system_1.ItemSystem.create(item);
    spear.durability = durability(character, tier);
    character.equip.data.backpack.add(spear);
    user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 6 /* UI_Part.INVENTORY */);
    events_1.Event.on_craft_update(character, skill, tier);
}
exports.craft_item = craft_item;
function craft_bulk(character, material, amount, skill, tier) {
    character.stash.inc(material, amount(character, tier));
    events_1.Event.on_craft_update(character, skill, tier);
    user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 4 /* UI_Part.STASH */);
}
exports.craft_bulk = craft_bulk;
