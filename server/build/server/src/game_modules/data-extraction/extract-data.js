"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Extract = void 0;
const content_1 = require("../../.././../game_content/src/content");
const data_objects_1 = require("../data/data_objects");
const item_system_1 = require("../systems/items/item_system");
var Extract;
(function (Extract) {
    function CharacterEquipModel(character) {
        let response = {};
        for (let k of content_1.EquipSlotConfiguration.SLOT) {
            const item_id = character.equip.data.slots[k];
            if (item_id == undefined)
                continue;
            const item_data = data_objects_1.Data.Items.from_id(item_id);
            response[k] = item_data.prototype.id_string;
        }
        return response;
    }
    Extract.CharacterEquipModel = CharacterEquipModel;
    function InventoryData(inventory) {
        return {
            items: inventory.items.map((item, index) => {
                const item_object = data_objects_1.Data.Items.from_id(item);
                let new_item = item_system_1.ItemSystem.data(item_object);
                new_item.backpack_index = index;
                return new_item;
            })
        };
    }
    Extract.InventoryData = InventoryData;
    function EquipData(equip) {
        let response = {
            equip: EquipToStringEquip(equip.data.slots),
            backpack: InventoryData(equip.data.backpack)
        };
        return response;
    }
    Extract.EquipData = EquipData;
    function EquipToStringEquip(data) {
        const result = {};
        for (const key of content_1.EquipSlotConfiguration.SLOT) {
            const item_id = data[key];
            if (item_id == undefined)
                continue;
            const item_data = data_objects_1.Data.Items.from_id(item_id);
            result[content_1.EquipSlotStorage.get(key).id_string] = item_system_1.ItemSystem.data(item_data);
        }
        return result;
    }
    Extract.EquipToStringEquip = EquipToStringEquip;
})(Extract || (exports.Extract = Extract = {}));

