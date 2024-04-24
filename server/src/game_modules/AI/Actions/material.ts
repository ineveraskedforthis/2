import { EQUIP_SLOT, MATERIAL, MaterialConfiguration, MaterialStorage } from "@content/content";
import { AIfunctions } from "../HelperFunctions/common";
import { AIActionsStorage } from "../Storage/storage";
import { MarketOrders } from "../../market/system";
import { EventMarket } from "../../events/market";
import { ActionManager } from "../../actions/manager";
import { craft_actions } from "../../craft/crafts_storage";
import { is_weapon } from "../../../content_wrappers/item";
import { Data } from "../../data/data_objects";
import { EventInventory } from "../../events/inventory_events";
import { CharacterCondition } from "../../scripted-conditions/character-conditions";
import { CharacterValues } from "../../scripted-values/character";
import { CharacterEffect } from "../../scripted-effects/character";
import { DataID } from "../../data/data_id";

// Used instead of a part of old crafting routine
// to decide required amounts of materials character needs
AIActionsStorage.register_action_self({
    tag: "update-desired-stash",
    utility(actor, target) {
        if (Math.random() < 0.01) {
            return 1
        }
        return 0
    },
    potential_targets(actor) {
        return [actor]
    },
    action(actor) {
        AIfunctions.update_price_beliefs(actor)
        actor.ai_desired_stash.clear()

        // investments for rich characters:
        if (actor.savings.get() > 1000) {
            for (const item of MaterialConfiguration.MATERIAL) {
                actor.ai_desired_stash.inc(item, 1)
            }
        }

        // food: replace with distribution later
        for (const item of MaterialConfiguration.MATERIAL) {
            if (CharacterCondition.can_eat(actor, MaterialStorage.get(item))) {
                actor.ai_desired_stash.inc(item, 10)
            }
        }

        // craft bulk:
        const good_crafts = AIfunctions.profitable_bulk_craft(actor)
        for (const item of good_crafts) {
            for (const input of item.craft.input) {
                actor.ai_desired_stash.inc(input.material, input.amount) * 10
            }
        }

        //craft items:
        const good_item_craft = AIfunctions.profitable_item_craft(actor)
        for (const item of good_item_craft) {
            for (const input of item.input) {
                actor.ai_desired_stash.inc(input.material, input.amount) * 10
            }
        }

        //arrows:
        if (CharacterValues.skill(actor, "ranged") > 20) {
            actor.ai_desired_stash.inc(MATERIAL.ARROW_BONE, 40)
        }

        //zaz for mages
        if (CharacterValues.skill(actor, "magic_mastery") > 10) {
            actor.ai_desired_stash.inc(MATERIAL.ZAZ, 40)
        }
    }
})

AIActionsStorage.register_action_self({
    tag: "craft-bulk",
    utility(actor, target) {
        const bulk_crafts = AIfunctions.profitable_bulk_craft(actor)
        for (let item of bulk_crafts) {
            if (item.profit <= 0) continue;

            if (CharacterCondition.can_potentially_bulk_craft(actor, item.craft)) {
                return 0.8
            }
        }

        return 0
    },

    potential_targets(actor) {
        return [actor]
    },

    action(actor, target) {
        AIfunctions.update_price_beliefs(actor)
        const bulk_crafts = AIfunctions.profitable_bulk_craft(actor)
        for (let item of bulk_crafts) {
            if (item.profit <= 0) continue;
            for (const input of item.craft.input) {
                MarketOrders.remove_by_condition(actor, input.material)
            }
            ActionManager.start_action(craft_actions[item.craft.id], actor, actor.cell_id);
        }
    }
})

AIActionsStorage.register_action_self({
    tag: "craft-item",
    utility(actor, target) {
        AIfunctions.update_price_beliefs(actor)
        const bulk_crafts = AIfunctions.profitable_item_craft(actor)
        for (let item of bulk_crafts) {
            if (CharacterCondition.can_item_craft(actor, item)) {
                return 0.8
            }
        }
        return 0
    },

    potential_targets(actor) {
        return [actor]
    },

    action(actor, target) {
        const bulk_crafts = AIfunctions.profitable_item_craft(actor)
        for (let item of bulk_crafts) {
            ActionManager.start_action(craft_actions[item.id], actor, actor.cell_id);
        }
    }
})

AIActionsStorage.register_action_material({
    tag: "eat",
    utility(actor, target) {
        if (CharacterCondition.can_eat(actor, target)) {
            return AIfunctions.lack_of_hp(actor) * 2 + actor.fatigue / 200 + actor.stress / 200
        }
        return 0
    },
    potential_targets(actor) {
        return MaterialConfiguration.MATERIAL.map(MaterialStorage.get)
    },
    action(actor, target) {
        CharacterEffect.eat(actor, target)
    }
})

AIActionsStorage.register_action_material({
    tag: "sell",
    utility(actor, target) {
        let desire_to_update_prices = 0
        for (const order_id of DataID.Character.market_orders_list(actor.id)) {
            const order = Data.MarketOrders.from_id(order_id)
            if (order.material != target.id) continue;
            if (order.typ == "buy") continue;
            if (order.price != actor.ai_price_sell_expectation[target.id]) {
                desire_to_update_prices += order.amount * actor.ai_price_sell_expectation[target.id] / 30
            }
        }
        return (actor.stash.get(target.id) - actor.ai_desired_stash.get(target.id)) / 50 + desire_to_update_prices
    },
    potential_targets(actor) {
        return MaterialConfiguration.MATERIAL.map(MaterialStorage.get)
    },
    action(actor, target) {
        AIfunctions.update_price_beliefs(actor)
        MarketOrders.remove_by_condition(actor, target.id)
        const amount_to_sell = actor.stash.get(target.id) - actor.ai_desired_stash.get(target.id)
        EventMarket.sell_smart_with_limits(actor, target.id, AIfunctions.sell_price(actor, target.id), amount_to_sell)
    }
})

AIActionsStorage.register_action_self({
    tag: "sell-equip-item",

    utility(actor, target) {
        return actor.equip.data.backpack.items.length / 10
    },

    potential_targets(actor) {
        return [actor]
    },

    action(actor, target) {
        for (let [index, item] of Object.entries(actor.equip.data.backpack.items)) {
            if (item == undefined) continue
            //console.log(item)
            const object = Data.Items.from_id(item)
            let slot = EQUIP_SLOT.WEAPON
            if (!is_weapon(object)) {
                slot = object.prototype.slot
            }
            if (actor.equip.data.slots[slot] == undefined) {
                EventInventory.equip_from_backpack(actor, Number(index))
            } else {
                let price = AIfunctions.sell_price_item(actor, object);
                EventMarket.sell_item(actor, Number(index), price);
            }
        }
    },
})

AIActionsStorage.register_action_material({
    tag: "buy",
    utility(actor, target) {
        let desire_to_update_prices = 0
        for (const order_id of DataID.Character.market_orders_list(actor.id)) {
            const order = Data.MarketOrders.from_id(order_id)
            if (order.material != target.id) continue;
            if (order.typ == "sell") continue;
            if (order.price != actor.ai_price_buy_expectation[target.id]) {
                desire_to_update_prices += order.amount * order.price / 30
            }
        }
        return (actor.ai_desired_stash.get(target.id) - actor.stash.get(target.id)) / 50
    },
    potential_targets(actor) {
        return MaterialConfiguration.MATERIAL.map(MaterialStorage.get)
    },
    action(actor, target) {
        AIfunctions.update_price_beliefs(actor)
        MarketOrders.remove_by_condition(actor, target.id)
        const amount_to_buy = actor.ai_desired_stash.get(target.id) - actor.stash.get(target.id)
        EventMarket.buy_smart_with_limits(actor, target.id, AIfunctions.buy_price(actor, target.id), amount_to_buy)
    }
})

AIActionsStorage.register_action_self({
    tag: "open-shop",
    utility(actor, target) {
        if (actor.home_location_id == undefined) {
            return 0
        }
        if (actor.cell_id != Data.Locations.from_id(actor.home_location_id).cell_id) {
            return 0
        }
        return (actor.equip.data.backpack.items.length / 10)
    },

    potential_targets(actor) {
        return [actor]
    },

    action(actor, target) {
        CharacterEffect.open_shop(actor)
    }
})


AIActionsStorage.register_action_self({
    tag: "update-price-belief",
    utility(actor, target) {
        if (Math.random() < 0.01) return 1
        return 0
    },

    potential_targets(actor) {
        return [actor]
    },

    action(actor, target) {
        AIfunctions.update_price_beliefs(actor)
    }
})