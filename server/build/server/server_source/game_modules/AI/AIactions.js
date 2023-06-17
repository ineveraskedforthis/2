"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIactions = void 0;
const manager_1 = require("../actions/manager");
const materials_manager_1 = require("../manager_classes/materials_manager");
const helpers_1 = require("./helpers");
const system_1 = require("../market/system");
const market_1 = require("../events/market");
const basic_functions_1 = require("../calculations/basic_functions");
const crafts_storage_1 = require("../craft/crafts_storage");
const items_1 = require("../craft/items");
var AIactions;
(function (AIactions) {
    function craft_bulk(character, craft, budget) {
        const buy = helpers_1.AIhelper.buy_craft_inputs(character, budget, craft.input);
        const sell_prices = helpers_1.AIhelper.sell_prices_craft_bulk(character, craft);
        for (let item of sell_prices) {
            const current = character.stash.get(item.material);
            if (current == 0)
                continue;
            system_1.BulkOrders.remove_by_condition(character, item.material);
            let total_amount = character.stash.get(item.material);
            market_1.EventMarket.sell(character, item.material, total_amount, item.price);
        }
        for (let item of buy) {
            if (character.stash.get(item.material) > 50)
                continue;
            if (item.amount == 0)
                continue;
            system_1.BulkOrders.remove_by_condition(character, item.material);
            market_1.EventMarket.buy(character, item.material, item.amount, item.price);
        }
        manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[craft.id], character, character.cell_id);
    }
    AIactions.craft_bulk = craft_bulk;
    function make_armour(character, price_skin) {
        system_1.BulkOrders.remove_by_condition(character, materials_manager_1.RAT_SKIN);
        let resource = character.stash.get(materials_manager_1.RAT_SKIN);
        let savings = character.savings.get();
        let skin_to_buy = Math.floor(savings / price_skin);
        // console.log('armour')
        // console.log(resource, savings, skin_to_buy)
        if (skin_to_buy > 5) {
            system_1.BulkOrders.remove_by_condition(character, materials_manager_1.RAT_SKIN);
            market_1.EventMarket.buy(character, materials_manager_1.RAT_SKIN, (0, basic_functions_1.trim)(skin_to_buy, 0, 50), price_skin);
        }
        if (resource > 10) {
            const flags = check_if_set_is_ready(character);
            if (!flags.body)
                manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[items_1.CraftItem.RatSkin.armour.id], character, character.cell_id);
            else if (!flags.legs)
                manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[items_1.CraftItem.RatSkin.pants.id], character, character.cell_id);
            else if (!flags.foot)
                manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[items_1.CraftItem.RatSkin.boots.id], character, character.cell_id);
            else
                sell_armour_set(character, price_skin);
        }
    }
    AIactions.make_armour = make_armour;
    function check_if_set_is_ready(character) {
        let flags = { 'legs': false, 'body': false, 'foot': false };
        let data = character.equip.data.backpack.items;
        for (let [index, item] of Object.entries(data)) {
            if (item?.slot == 'body') {
                flags.body = true;
            }
            if (item?.slot == 'legs') {
                flags.legs = true;
            }
            if (item?.slot == 'foot') {
                flags.foot = true;
            }
        }
        // console.log(flags)
        return flags;
    }
    function sell_armour_set(character, price_skin) {
        let data = character.equip.data.backpack.items;
        for (let [index, item] of Object.entries(data)) {
            if (item?.slot == 'body') {
                let price = helpers_1.AIhelper.sell_price_craft_item(character, items_1.CraftItem.RatSkin.armour);
                market_1.EventMarket.sell_item(character, Number(index), price);
            }
            if (item?.slot == 'foot') {
                let price = helpers_1.AIhelper.sell_price_craft_item(character, items_1.CraftItem.RatSkin.boots);
                market_1.EventMarket.sell_item(character, Number(index), price);
            }
            if (item?.slot == 'legs') {
                let price = helpers_1.AIhelper.sell_price_craft_item(character, items_1.CraftItem.RatSkin.pants);
                market_1.EventMarket.sell_item(character, Number(index), price);
            }
        }
    }
    function sell_weapons(character) {
        let data = character.equip.data.backpack.items;
        for (let [index, item] of Object.entries(data)) {
            if (item?.slot == 'weapon') {
                const price_noise = Math.random() * 100;
                let price = Math.floor(150 + price_noise);
                market_1.EventMarket.sell_item(character, Number(index), price);
            }
        }
    }
    function make_wooden_weapon(character, price_wood) {
        system_1.BulkOrders.remove_by_condition(character, materials_manager_1.WOOD);
        let savings = character.savings.get();
        let wood_to_buy = Math.floor(savings / price_wood);
        if (wood_to_buy > 5) {
            system_1.BulkOrders.remove_by_condition(character, materials_manager_1.WOOD);
            market_1.EventMarket.buy(character, materials_manager_1.WOOD, (0, basic_functions_1.trim)(wood_to_buy, 0, 50), price_wood);
        }
        let resource = character.stash.get(materials_manager_1.WOOD);
        if (resource > 20) {
            const dice = Math.random();
            if (dice < 0.5)
                manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[items_1.CraftItem.Wood.spear.id], character, character.cell_id);
            else if (dice < 0.8)
                manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[items_1.CraftItem.Wood.mace.id], character, character.cell_id);
            else
                manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[items_1.CraftItem.Wood.bow.id], character, character.cell_id);
        }
        sell_weapons(character);
    }
    AIactions.make_wooden_weapon = make_wooden_weapon;
    function make_bone_weapon(character, bone_price) {
        system_1.BulkOrders.remove_by_condition(character, materials_manager_1.RAT_BONE);
        let savings = character.savings.get();
        let bones_to_buy = Math.floor(savings / bone_price);
        if (bones_to_buy > 5) {
            system_1.BulkOrders.remove_by_condition(character, materials_manager_1.RAT_BONE);
            market_1.EventMarket.buy(character, materials_manager_1.RAT_BONE, (0, basic_functions_1.trim)(bones_to_buy, 0, 50), bone_price);
        }
        let resource = character.stash.get(materials_manager_1.RAT_BONE);
        if (resource > 20) {
            const dice = Math.random();
            if (dice < 1)
                manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[items_1.CraftItem.Bone.dagger.id], character, character.cell_id);
        }
        sell_weapons(character);
    }
    AIactions.make_bone_weapon = make_bone_weapon;
    function make_boots(character, skin_price) {
        system_1.BulkOrders.remove_by_condition(character, materials_manager_1.RAT_SKIN);
        let savings = character.savings.get();
        let skin_to_buy = Math.floor(savings / skin_price);
        if (skin_to_buy > 5) {
            system_1.BulkOrders.remove_by_condition(character, materials_manager_1.RAT_SKIN);
            market_1.EventMarket.buy(character, materials_manager_1.RAT_SKIN, (0, basic_functions_1.trim)(skin_to_buy, 0, 50), skin_price);
        }
        let resource = character.stash.get(materials_manager_1.RAT_SKIN);
        if (resource > 10) {
            const dice = Math.random();
            if (dice < 1)
                manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[items_1.CraftItem.RatSkin.boots.id], character, character.cell_id);
        }
        sell_armour_set(character, skin_price);
    }
    AIactions.make_boots = make_boots;
})(AIactions = exports.AIactions || (exports.AIactions = {}));
