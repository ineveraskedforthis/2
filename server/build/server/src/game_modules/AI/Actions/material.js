"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const content_1 = require("../../../.././../game_content/src/content");
const common_1 = require("../HelperFunctions/common");
const storage_1 = require("../Storage/storage");
const system_1 = require("../../market/system");
const market_1 = require("../../events/market");
const manager_1 = require("../../actions/manager");
const crafts_storage_1 = require("../../craft/crafts_storage");
const item_1 = require("../../../content_wrappers/item");
const data_objects_1 = require("../../data/data_objects");
const inventory_events_1 = require("../../events/inventory_events");
const character_conditions_1 = require("../../scripted-conditions/character-conditions");
const character_1 = require("../../scripted-values/character");
const character_2 = require("../../scripted-effects/character");
const data_id_1 = require("../../data/data_id");
// Used instead of a part of old crafting routine
// to decide required amounts of materials character needs
storage_1.AIActionsStorage.register_action_self({
    tag: "update-desired-stash",
    utility(actor, target) {
        if (common_1.AIfunctions.desired_stash_weight(actor) == 0) {
            return 1000;
        }
        if (Math.random() < 0.01) {
            return 1;
        }
        return 0;
    },
    potential_targets(actor) {
        return [actor];
    },
    action(actor) {
        common_1.AIfunctions.update_price_beliefs(actor);
        actor.ai_desired_stash.clear();
        // investments for rich characters:
        if (actor.savings.get() > 10000) {
            for (const item of content_1.MaterialConfiguration.MATERIAL) {
                actor.ai_desired_stash.inc(item, 1);
            }
        }
        // home owners want to maintain some amount of wood in their stash:
        data_id_1.DataID.Character.for_each_ownership(actor.id, (location_id) => {
            actor.ai_desired_stash.inc(31 /* MATERIAL.WOOD_RED */, 20);
        });
        // food: replace with distribution later
        for (const item of content_1.MaterialConfiguration.MATERIAL) {
            if (character_conditions_1.CharacterCondition.can_eat(actor, content_1.MaterialStorage.get(item))) {
                actor.ai_desired_stash.inc(item, 5);
            }
        }
        // craft bulk:
        const good_crafts = common_1.AIfunctions.profitable_bulk_craft(actor);
        for (const item of good_crafts) {
            for (const input of item.craft.input) {
                actor.ai_desired_stash.inc(input.material, input.amount) * 2;
            }
        }
        //craft items:
        const good_item_craft = common_1.AIfunctions.profitable_item_craft(actor);
        for (const item of good_item_craft) {
            for (const input of item.input) {
                actor.ai_desired_stash.inc(input.material, input.amount) * 2;
            }
        }
        //arrows:
        if (character_1.CharacterValues.skill(actor, 18 /* SKILL.RANGED */) > 20) {
            actor.ai_desired_stash.inc(0 /* MATERIAL.ARROW_BONE */, 40);
        }
        //zaz for mages
        if (character_1.CharacterValues.skill(actor, 26 /* SKILL.MAGIC */) > 10) {
            actor.ai_desired_stash.inc(30 /* MATERIAL.ZAZ */, 40);
        }
    }
});
storage_1.AIActionsStorage.register_action_self({
    tag: "craft-bulk",
    utility(actor, target) {
        const bulk_crafts = common_1.AIfunctions.profitable_bulk_craft(actor);
        for (let item of bulk_crafts) {
            if (item.profit <= 0)
                continue;
            if (character_conditions_1.CharacterCondition.can_potentially_bulk_craft(actor, item.craft)) {
                return 2;
            }
        }
        return 0;
    },
    potential_targets(actor) {
        return [actor];
    },
    action(actor, target) {
        common_1.AIfunctions.update_price_beliefs(actor);
        const bulk_crafts = common_1.AIfunctions.profitable_bulk_craft(actor);
        for (let item of bulk_crafts) {
            if (item.profit <= 0)
                continue;
            for (const input of item.craft.input) {
                system_1.MarketOrders.remove_by_condition(actor, input.material);
            }
            manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[item.craft.id], actor, actor.cell_id);
        }
    }
});
storage_1.AIActionsStorage.register_action_self({
    tag: "craft-item",
    utility(actor, target) {
        common_1.AIfunctions.update_price_beliefs(actor);
        const bulk_crafts = common_1.AIfunctions.profitable_item_craft(actor);
        for (let item of bulk_crafts) {
            if (character_conditions_1.CharacterCondition.can_item_craft(actor, item)) {
                return 10;
            }
        }
        return 0;
    },
    potential_targets(actor) {
        return [actor];
    },
    action(actor, target) {
        const bulk_crafts = common_1.AIfunctions.profitable_item_craft(actor);
        for (let item of bulk_crafts) {
            manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[item.id], actor, actor.cell_id);
        }
    }
});
storage_1.AIActionsStorage.register_action_material({
    tag: "eat",
    utility(actor, target) {
        if (actor.stash.get(target.id) == 0)
            return 0;
        if (character_conditions_1.CharacterCondition.can_eat(actor, target)) {
            return common_1.AIfunctions.lack_of_hp(actor) * 2 + actor.fatigue / 200 + actor.stress / 200;
        }
        return 0;
    },
    potential_targets(actor) {
        return content_1.MaterialConfiguration.MATERIAL.map(content_1.MaterialStorage.get);
    },
    action(actor, target) {
        if (target.unit_size < 0.1) {
            character_2.CharacterEffect.eat_5(actor, target);
        }
        else {
            character_2.CharacterEffect.eat(actor, target);
        }
    }
});
storage_1.AIActionsStorage.register_action_material({
    tag: "sell",
    utility(actor, target) {
        for (const order_id of data_id_1.DataID.Character.market_orders_list(actor.id)) {
            const order = data_objects_1.Data.MarketOrders.from_id(order_id);
            if (order.material != target.id)
                continue;
            if (order.typ != "sell")
                continue;
            if (order.owner_id != actor.id)
                continue;
            if (order.amount == 0)
                continue;
            if (order.price != actor.ai_price_sell_expectation[target.id]) {
                return 100;
            }
        }
        return (actor.stash.get(target.id) - actor.ai_desired_stash.get(target.id)) / 50;
    },
    potential_targets(actor) {
        return content_1.MaterialConfiguration.MATERIAL.map(content_1.MaterialStorage.get);
    },
    action(actor, target) {
        common_1.AIfunctions.update_price_beliefs(actor);
        system_1.MarketOrders.remove_by_condition(actor, target.id);
        const amount_to_sell = actor.stash.get(target.id) - actor.ai_desired_stash.get(target.id);
        market_1.EventMarket.sell_smart_with_limits(actor, target.id, common_1.AIfunctions.sell_price(actor, target.id), amount_to_sell);
    }
});
storage_1.AIActionsStorage.register_action_self({
    tag: "sell-equip-item",
    utility(actor, target) {
        return actor.equip.data.backpack.items.length / 10;
    },
    potential_targets(actor) {
        return [actor];
    },
    action(actor, target) {
        for (let [index, item] of Object.entries(actor.equip.data.backpack.items)) {
            if (item == undefined)
                continue;
            //console.log(item)
            const object = data_objects_1.Data.Items.from_id(item);
            let slot = 0 /* EQUIP_SLOT.WEAPON */;
            if (!(0, item_1.is_weapon)(object)) {
                slot = object.prototype.slot;
            }
            if (actor.equip.data.slots[slot] == undefined) {
                inventory_events_1.EventInventory.equip_from_backpack(actor, Number(index));
            }
            else {
                let price = common_1.AIfunctions.sell_price_item(actor, object);
                market_1.EventMarket.sell_item(actor, Number(index), price);
            }
        }
    },
});
storage_1.AIActionsStorage.register_action_material({
    tag: "buy",
    utility(actor, target) {
        let already_trying_to_buy = 0;
        for (const order_id of data_id_1.DataID.Character.market_orders_list(actor.id)) {
            const order = data_objects_1.Data.MarketOrders.from_id(order_id);
            if (order.material != target.id)
                continue;
            if (order.typ != "buy")
                continue;
            if (order.owner_id != actor.id)
                continue;
            if (order.amount == 0)
                continue;
            if (order.price != actor.ai_price_buy_expectation[target.id]) {
                return 100;
            }
            else {
                already_trying_to_buy += order.amount;
            }
        }
        const desired = actor.ai_desired_stash.get(target.id);
        const can_buy = actor.savings.get() / actor.ai_price_buy_expectation[target.id];
        const have = actor.stash.get(target.id);
        if (desired < have) {
            return -1;
        }
        // if (actor.is_player())
        //     console.log(target.name, desired, can_buy, have)
        return (Math.min(desired, can_buy) - have - already_trying_to_buy) / 50;
    },
    potential_targets(actor) {
        return content_1.MaterialConfiguration.MATERIAL.map(content_1.MaterialStorage.get);
    },
    action(actor, target) {
        common_1.AIfunctions.update_price_beliefs(actor);
        system_1.MarketOrders.remove_by_condition(actor, target.id);
        const desired = actor.ai_desired_stash.get(target.id);
        const can_buy = actor.savings.get() / actor.ai_price_buy_expectation[target.id];
        const have = actor.stash.get(target.id);
        const amount_to_buy = Math.max(0, Math.min(desired, can_buy) - have);
        if (actor.is_player())
            console.log(target.name, desired, can_buy, have, amount_to_buy, actor.ai_price_buy_expectation[target.id]);
        market_1.EventMarket.buy_smart_with_limits(actor, target.id, common_1.AIfunctions.buy_price(actor, target.id), amount_to_buy);
    }
});
storage_1.AIActionsStorage.register_action_self({
    tag: "open-shop",
    utility(actor, target) {
        if (actor.home_location_id == undefined) {
            return 0;
        }
        if (actor.cell_id != data_objects_1.Data.Locations.from_id(actor.home_location_id).cell_id) {
            return 0;
        }
        return (actor.equip.data.backpack.items.length / 10);
    },
    potential_targets(actor) {
        return [actor];
    },
    action(actor, target) {
        character_2.CharacterEffect.open_shop(actor);
    }
});
storage_1.AIActionsStorage.register_action_self({
    tag: "close-shop",
    utility(actor, target) {
        if (!actor.open_shop) {
            return 0;
        }
        if (actor.home_location_id == undefined) {
            return 0;
        }
        if (actor.cell_id != data_objects_1.Data.Locations.from_id(actor.home_location_id).cell_id) {
            return 0;
        }
        if (actor.equip.data.backpack.items.length > 0) {
            return 0;
        }
        return 1;
    },
    potential_targets(actor) {
        return [actor];
    },
    action(actor, target) {
        character_2.CharacterEffect.open_shop(actor);
    }
});
storage_1.AIActionsStorage.register_action_self({
    tag: "update-price-belief",
    utility(actor, target) {
        if (Math.random() < 0.01)
            return 1;
        return 0;
    },
    potential_targets(actor) {
        return [actor];
    },
    action(actor, target) {
        common_1.AIfunctions.update_price_beliefs(actor);
    }
});

