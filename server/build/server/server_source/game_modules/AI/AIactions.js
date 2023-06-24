"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIactions = void 0;
const manager_1 = require("../actions/manager");
const helpers_1 = require("./helpers");
const system_1 = require("../market/system");
const market_1 = require("../events/market");
const crafts_storage_1 = require("../craft/crafts_storage");
const inventory_events_1 = require("../events/inventory_events");
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
    function buy_inputs_to_craft_item(character, item, budget) {
        // BulkOrders.remove_by_condition(character, )
        let inputs = item.input;
        const buy = helpers_1.AIhelper.buy_craft_inputs(character, budget, inputs);
        for (let item of buy) {
            if (character.stash.get(item.material) > 50)
                continue;
            if (item.amount == 0)
                continue;
            system_1.BulkOrders.remove_by_condition(character, item.material);
            market_1.EventMarket.buy(character, item.material, item.amount, item.price);
        }
    }
    AIactions.buy_inputs_to_craft_item = buy_inputs_to_craft_item;
    function craft_item(character, item) {
        console.log(character.name, ' crafts ', item.id);
        manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[item.id], character, character.cell_id);
    }
    AIactions.craft_item = craft_item;
    function sell_items(character) {
        for (let [index, item] of Object.entries(character.equip.data.backpack.items)) {
            if (item == undefined)
                continue;
            let slot = item.slot;
            if (slot == 'weapon') {
                if (character.equip.data.weapon == undefined) {
                    inventory_events_1.EventInventory.equip_from_backpack(character, Number(index));
                }
                else {
                    let price = helpers_1.AIhelper.sell_price_item(character, item, item.durability);
                    market_1.EventMarket.sell_item(character, Number(index), price);
                }
            }
            else {
                if (character.equip.data.armour[slot] == undefined) {
                    inventory_events_1.EventInventory.equip_from_backpack(character, Number(index));
                }
                else {
                    let price = helpers_1.AIhelper.sell_price_item(character, item, item.durability);
                    market_1.EventMarket.sell_item(character, Number(index), price);
                }
            }
        }
    }
    AIactions.sell_items = sell_items;
    // export function make_armour(character: Character, price_skin: money) {
    //     BulkOrders.remove_by_condition(character, RAT_SKIN);
    //     let resource = character.stash.get(RAT_SKIN);
    //     let savings = character.savings.get();
    //     let skin_to_buy = Math.floor(savings / price_skin);
    //     // console.log('armour')
    //     // console.log(resource, savings, skin_to_buy)
    //     if (skin_to_buy > 5) {
    //         BulkOrders.remove_by_condition(character, RAT_SKIN);
    //         EventMarket.buy(character, RAT_SKIN, trim(skin_to_buy, 0, 50), price_skin);
    //     }
    //     if (resource > 10) {
    //         const flags = check_if_set_is_ready(character);
    //         if (!flags.body)
    //             ActionManager.start_action(craft_actions[CraftItem.RatSkin.armour.id], character, character.cell_id);
    //         else if (!flags.legs)
    //             ActionManager.start_action(craft_actions[CraftItem.RatSkin.pants.id], character, character.cell_id);
    //         else if (!flags.foot)
    //             ActionManager.start_action(craft_actions[CraftItem.RatSkin.boots.id], character, character.cell_id);
    //         else
    //             sell_armour_set(character, price_skin);
    //     }
    // }
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
    // function sell_armour_set(character: Character, price_skin: money) {
    //     let data = character.equip.data.backpack.items;
    //     for (let [index, item] of Object.entries(data)) {
    //         if (item?.slot == 'body') {
    //             let price = AIhelper.sell_price_craft_item(character, CraftItem.RatSkin.armour);
    //             EventMarket.sell_item(character, Number(index), price);
    //         }
    //         if (item?.slot == 'foot') {
    //             let price = AIhelper.sell_price_craft_item(character, CraftItem.RatSkin.boots);
    //             EventMarket.sell_item(character, Number(index), price);
    //         }
    //         if (item?.slot == 'legs') {
    //             let price = AIhelper.sell_price_craft_item(character, CraftItem.RatSkin.pants);
    //             EventMarket.sell_item(character, Number(index), price);
    //         }
    //     }
    // }
    // function sell_weapons(character: Character) {
    //     let data = character.equip.data.backpack.items;
    //     for (let [index, item] of Object.entries(data)) {
    //         if (item?.slot == 'weapon') {
    //             const price_noise = Math.random() * 100;
    //             let price = Math.floor(150 + price_noise) as money;
    //             EventMarket.sell_item(character, Number(index), price);
    //         }
    //     }
    // }
    // export function make_wooden_weapon(character: Character, price_wood: money) {
    //     BulkOrders.remove_by_condition(character, WOOD);
    //     let savings = character.savings.get();
    //     let wood_to_buy = Math.floor(savings / price_wood);
    //     if (wood_to_buy > 5) {
    //         BulkOrders.remove_by_condition(character, WOOD);
    //         EventMarket.buy(character, WOOD, trim(wood_to_buy, 0, 50), price_wood);
    //     }
    //     let resource = character.stash.get(WOOD);
    //     if (resource > 20) {
    //         const dice = Math.random();
    //         if (dice < 0.5)
    //             ActionManager.start_action(craft_actions[CraftItem.Wood.spear.id], character, character.cell_id);
    //         else if (dice < 0.8)
    //             ActionManager.start_action(craft_actions[CraftItem.Wood.mace.id], character, character.cell_id);
    //         else
    //             ActionManager.start_action(craft_actions[CraftItem.Wood.bow.id], character, character.cell_id);
    //     }
    //     sell_weapons(character);
    // }
    // export function make_bone_weapon(character: Character, bone_price: money) {
    //     BulkOrders.remove_by_condition(character, RAT_BONE);
    //     let savings = character.savings.get();
    //     let bones_to_buy = Math.floor(savings / bone_price);
    //     if (bones_to_buy > 5) {
    //         BulkOrders.remove_by_condition(character, RAT_BONE);
    //         EventMarket.buy(character, RAT_BONE, trim(bones_to_buy, 0, 50), bone_price);
    //     }
    //     let resource = character.stash.get(RAT_BONE);
    //     if (resource > 20) {
    //         const dice = Math.random();
    //         if (dice < 1)
    //             ActionManager.start_action(craft_actions[CraftItem.Bone.dagger.id], character, character.cell_id);
    //     }
    //     sell_weapons(character);
    // }
    // export function make_boots(character: Character, skin_price: money) {
    //     BulkOrders.remove_by_condition(character, RAT_SKIN);
    //     let savings = character.savings.get();
    //     let skin_to_buy = Math.floor(savings / skin_price);
    //     if (skin_to_buy > 5) {
    //         BulkOrders.remove_by_condition(character, RAT_SKIN);
    //         EventMarket.buy(character, RAT_SKIN, trim(skin_to_buy, 0, 50), skin_price);
    //     }
    //     let resource = character.stash.get(RAT_SKIN);
    //     if (resource > 10) {
    //         const dice = Math.random();
    //         if (dice < 1)
    //             ActionManager.start_action(craft_actions[CraftItem.RatSkin.boots.id], character, character.cell_id);
    //     }
    //     sell_armour_set(character, skin_price);
    // }
})(AIactions = exports.AIactions || (exports.AIactions = {}));
