import { EQUIP_SLOT, MATERIAL, MATERIAL_CATEGORY, MaterialConfiguration, MaterialStorage, SKILL } from "@content/content";
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
        if (AIfunctions.desired_stash_weight(actor) == 0) {
            return 1000
        }
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
        if (actor.savings.get() > 10000) {
            for (const item of MaterialConfiguration.MATERIAL) {
                actor.ai_desired_stash.inc(item, 1)
            }
        }

        // home owners want to maintain some amount of wood in their stash:
        DataID.Character.for_each_ownership(actor.id, (location_id) => {
            actor.ai_desired_stash.inc(MATERIAL.WOOD_RED, 20)
        })

        // food: replace with distribution later
        for (const item of MaterialConfiguration.MATERIAL) {
            if (CharacterCondition.can_eat(actor, MaterialStorage.get(item))) {
                actor.ai_desired_stash.inc(item, 5)
            }
        }

        // craft bulk:
        const good_crafts = AIfunctions.profitable_bulk_craft(actor)
        for (const item of good_crafts) {
            for (const input of item.craft.input) {
                actor.ai_desired_stash.inc(input.material, input.amount) * 2
            }
        }

        //craft items:
        const good_item_craft = AIfunctions.profitable_item_craft(actor)
        for (const item of good_item_craft) {
            for (const input of item.input) {
                actor.ai_desired_stash.inc(input.material, input.amount) * 2
            }
        }

        //arrows:
        if (CharacterValues.skill(actor, SKILL.RANGED) > 20) {
            actor.ai_desired_stash.inc(MATERIAL.ARROW_BONE, 40)
        }

        //zaz for mages
        if (CharacterValues.skill(actor, SKILL.MAGIC) > 10) {
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
                return 2
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
                return 10
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
        if (actor.stash.get(target.id) == 0)
            return 0;
        if (CharacterCondition.can_eat(actor, target)) {
            return AIfunctions.lack_of_hp(actor) * 2 + actor.fatigue / 200 + actor.stress / 200
        }
        return 0
    },
    potential_targets(actor) {
        return MaterialConfiguration.MATERIAL.map(MaterialStorage.get)
    },
    action(actor, target) {
        if (target.unit_size < 0.1) {
            CharacterEffect.eat_5(actor, target)
        } else {
            CharacterEffect.eat(actor, target)
        }
    }
})

AIActionsStorage.register_action_material({
    tag: "sell",
    utility(actor, target) {
        for (const order_id of DataID.Character.market_orders_list(actor.id)) {
            const order = Data.MarketOrders.from_id(order_id)
            if (order.material != target.id) continue;
            if (order.typ != "sell") continue;
            if (order.owner_id != actor.id) continue;
            if (order.amount == 0) continue;
            if (order.price != actor.ai_price_sell_expectation[target.id]) {
                return 100
            }
        }
        return (actor.stash.get(target.id) - actor.ai_desired_stash.get(target.id)) / 50
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
        let already_trying_to_buy = 0

        for (const order_id of DataID.Character.market_orders_list(actor.id)) {
            const order = Data.MarketOrders.from_id(order_id)
            if (order.material != target.id) continue;
            if (order.typ != "buy") continue;
            if (order.owner_id != actor.id) continue;
            if (order.amount == 0) continue;
            if (order.price != actor.ai_price_buy_expectation[target.id]) {
                return 100
            } else {
                already_trying_to_buy += order.amount
            }
        }

        const desired = actor.ai_desired_stash.get(target.id)
        const can_buy = actor.savings.get() / actor.ai_price_buy_expectation[target.id]
        const have = actor.stash.get(target.id)

        if (desired < have) {
            return -1
        }

        // if (actor.is_player())
        //     console.log(target.name, desired, can_buy, have)

        return (Math.min(desired, can_buy) - have - already_trying_to_buy) / 50
    },
    potential_targets(actor) {
        return MaterialConfiguration.MATERIAL.map(MaterialStorage.get)
    },
    action(actor, target) {
        AIfunctions.update_price_beliefs(actor)
        MarketOrders.remove_by_condition(actor, target.id)

        const desired = actor.ai_desired_stash.get(target.id)
        const can_buy = actor.savings.get() / actor.ai_price_buy_expectation[target.id]
        const have = actor.stash.get(target.id)
        const amount_to_buy = Math.max(0, Math.min(desired, can_buy) - have)

        if (actor.is_player())
            console.log(target.name, desired, can_buy, have, amount_to_buy, actor.ai_price_buy_expectation[target.id])

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
    tag: "close-shop",
    utility(actor, target) {
        if (!actor.open_shop) {
            return 0;
        }
        if (actor.home_location_id == undefined) {
            return 0
        }
        if (actor.cell_id != Data.Locations.from_id(actor.home_location_id).cell_id) {
            return 0
        }

        if (actor.equip.data.backpack.items.length > 0) {
            return 0
        }

        return 1
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