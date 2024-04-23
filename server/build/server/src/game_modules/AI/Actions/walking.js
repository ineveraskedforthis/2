"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const actions_00_1 = require("../../actions/actions_00");
const manager_1 = require("../../actions/manager");
const data_id_1 = require("../../data/data_id");
const data_objects_1 = require("../../data/data_objects");
const storage_1 = require("../Storage/storage");
const system_1 = require("../../map/system");
const common_1 = require("../HelperFunctions/common");
const basic_functions_1 = require("../../calculations/basic_functions");
const effects_1 = require("../../effects/effects");
const character_1 = require("../../scripted-values/character");
storage_1.AIActionsStorage.register_action_location({
    tag: "go-home",
    utility(actor, target) {
        if (data_objects_1.Data.Locations.from_id(actor.location_id).cell_id == target.cell_id) {
            return 0;
        }
        const fatigue = actor.fatigue / 100;
        const stress = actor.stress / 100;
        const lack_of_hp = (actor.hp_max - actor.hp) / actor.hp_max;
        const utility_fatigue = Math.max(0, fatigue - 0.2);
        const utility_stress = Math.max(0, stress - 0.5);
        const weight = common_1.AIfunctions.loot_weight(actor) / 20;
        const trade_stash_weight = common_1.AIfunctions.trade_stash_weight(actor) / 20;
        const backpack_size = actor.equip.data.backpack.items.length;
        return 0.05 + utility_fatigue + utility_stress + lack_of_hp + weight + trade_stash_weight + backpack_size / 10;
    },
    potential_targets(actor) {
        const pre_result = [];
        for (const reputation of data_id_1.DataID.Reputation.character(actor.id)) {
            if (reputation.reputation == "friend" || reputation.reputation == "member" || reputation.reputation == "leader") {
                pre_result.push(data_id_1.DataID.Faction.spawn(reputation.faction_id));
            }
        }
        if (actor.home_location_id != undefined) {
            pre_result.push(actor.home_location_id);
        }
        return pre_result.map(data_objects_1.Data.Locations.from_id);
    },
    action(actor, target) {
        common_1.AIfunctions.go_to_location(actor, target);
    }
});
storage_1.AIActionsStorage.register_action_location({
    tag: "stay-home",
    utility(actor, target) {
        if (data_objects_1.Data.Locations.from_id(actor.location_id).cell_id != target.cell_id) {
            return 0;
        }
        const unsold_items = common_1.AIfunctions.trade_stash_weight(actor) / 100;
        const backpack_size = common_1.AIfunctions.items_for_sale(actor) / 10;
        return unsold_items + backpack_size;
    },
    potential_targets(actor) {
        const home = data_objects_1.Data.Locations.from_id(actor.location_id);
        if (home !== undefined) {
            return [home];
        }
        return [];
    },
    action(actor, target) {
        common_1.AIfunctions.go_to_location(actor, target);
    }
});
storage_1.AIActionsStorage.register_action_cell({
    tag: "walk",
    utility(actor, target) {
        if (actor.open_shop) {
            return 0;
        }
        return 0.01;
    },
    potential_targets(actor) {
        const cell = data_objects_1.Data.Cells.from_id(actor.cell_id);
        let possible_moves = [];
        for (let d of common_1.directions) {
            let tmp = [d[0] + cell.x, d[1] + cell.y];
            let target_id = data_objects_1.Data.World.coordinate_to_id(tmp);
            let target_cell = data_objects_1.Data.Cells.from_id(target_id);
            if (target_cell != undefined) {
                if (system_1.MapSystem.can_move(tmp)) {
                    possible_moves.push(tmp);
                }
            }
        }
        if (possible_moves.length > 0) {
            let move_direction = possible_moves[Math.floor(Math.random() * possible_moves.length)];
            return [data_objects_1.Data.World.coordinate_to_id(move_direction)].map(data_objects_1.Data.Cells.from_id);
        }
        return [];
    },
    action(actor, target) {
        if (Math.random() < 0.9) {
            const location_id = (0, basic_functions_1.select_weighted_callback)(data_id_1.DataID.Cells.locations(actor.cell_id), (item) => 1);
            effects_1.Effect.enter_location(actor.id, location_id);
            return;
        }
        manager_1.ActionManager.start_action(actions_00_1.CharacterAction.MOVE, actor, target.id);
    },
});
// AIs are pretty shortsighted
function locations_nearby(actor, predicate) {
    let result = data_id_1.DataID.Cells.locations(actor.cell_id).map(data_objects_1.Data.Locations.from_id).filter(predicate);
    for (const neighbour of data_objects_1.Data.World.neighbours(actor.cell_id)) {
        result = result
            .concat(data_id_1.DataID.Cells.locations(neighbour)
            .map(data_objects_1.Data.Locations.from_id)
            .filter((item) => item.berries > 0));
    }
    return result;
}
function inner_desire(actor, material) {
    return (actor.ai_desired_stash.get(material) - actor.stash.get(material)) / 50;
}
function for_sale_desire(actor, material) {
    return (actor.ai_gathering_target.get(material)
        - actor.stash.get(material)
        + common_1.AIfunctions.check_local_demand_for_material(actor, material)
        - common_1.AIfunctions.check_local_supply_for_material(actor, material)) / 50;
}
function toward_action(actor, target, action) {
    if (target.cell_id == actor.cell_id) {
        effects_1.Effect.enter_location(actor.id, target.id);
        manager_1.ActionManager.start_action(action, actor, actor.cell_id);
    }
    else {
        common_1.AIfunctions.go_to_location(actor, target);
    }
}
storage_1.AIActionsStorage.register_action_location({
    tag: "gather-fie-for-sell",
    utility(actor, target) {
        if (target.berries == 0)
            return 0;
        if (actor.open_shop)
            return 0;
        return for_sale_desire(actor, 28 /* MATERIAL.BERRY_FIE */) + Math.random() * 0.1 - actor.savings.get() / 1000;
    },
    potential_targets(actor) {
        return locations_nearby(actor, (item) => item.berries > 0);
    },
    action(actor, target) {
        common_1.AIfunctions.update_price_beliefs(actor);
        actor.ai_gathering_target.set(28 /* MATERIAL.BERRY_FIE */, common_1.AIfunctions.check_local_demand_for_material(actor, 28 /* MATERIAL.BERRY_FIE */));
        toward_action(actor, target, actions_00_1.CharacterAction.GATHER_BERRIES);
    }
});
storage_1.AIActionsStorage.register_action_location({
    tag: "gather-fie-for-yourself",
    utility(actor, target) {
        if (target.berries == 0)
            return 0;
        if (actor.open_shop)
            return 0;
        return inner_desire(actor, 28 /* MATERIAL.BERRY_FIE */) + Math.random() * 0.1 - actor.savings.get() / 1000;
    },
    potential_targets(actor) {
        return locations_nearby(actor, (item) => item.berries > 0);
    },
    action(actor, target) {
        toward_action(actor, target, actions_00_1.CharacterAction.GATHER_BERRIES);
    }
});
storage_1.AIActionsStorage.register_action_location({
    tag: "gather-zazberry-for-sell",
    utility(actor, target) {
        if (target.berries == 0)
            return 0;
        if (actor.open_shop)
            return 0;
        return for_sale_desire(actor, 29 /* MATERIAL.BERRY_ZAZ */) + Math.random() * 0.1 - actor.savings.get() / 1000;
    },
    potential_targets(actor) {
        return locations_nearby(actor, (item) => item.berries > 0);
    },
    action(actor, target) {
        common_1.AIfunctions.update_price_beliefs(actor);
        actor.ai_gathering_target.set(29 /* MATERIAL.BERRY_ZAZ */, common_1.AIfunctions.check_local_demand_for_material(actor, 28 /* MATERIAL.BERRY_FIE */));
        toward_action(actor, target, actions_00_1.CharacterAction.GATHER_BERRIES);
    }
});
storage_1.AIActionsStorage.register_action_location({
    tag: "gather-zazberry-for-yourself",
    utility(actor, target) {
        if (target.berries == 0)
            return 0;
        if (actor.open_shop)
            return 0;
        return inner_desire(actor, 29 /* MATERIAL.BERRY_ZAZ */) + Math.random() * 0.1 - actor.savings.get() / 1000;
    },
    potential_targets(actor) {
        return locations_nearby(actor, (item) => item.berries > 0);
    },
    action(actor, target) {
        toward_action(actor, target, actions_00_1.CharacterAction.GATHER_BERRIES);
    }
});
storage_1.AIActionsStorage.register_action_location({
    tag: "gather-wood-to-sell",
    utility(actor, target) {
        if (target.forest == 0)
            return 0;
        if (actor.open_shop)
            return 0;
        return for_sale_desire(actor, 31 /* MATERIAL.WOOD_RED */) + Math.random() * 0.1 - actor.savings.get() / 1000;
    },
    // AIs are pretty shortsighted
    potential_targets(actor) {
        let result = data_id_1.DataID.Cells.locations(actor.cell_id).map(data_objects_1.Data.Locations.from_id).filter((item) => item.forest > 0);
        for (const neighbour of data_objects_1.Data.World.neighbours(actor.cell_id)) {
            result = result.concat(data_id_1.DataID.Cells.locations(neighbour)
                .map(data_objects_1.Data.Locations.from_id)
                .filter((item) => (item.forest > 0) && (system_1.MapSystem.can_move(data_objects_1.Data.World.id_to_coordinate(item.cell_id)))));
        }
        return result;
    },
    action(actor, target) {
        common_1.AIfunctions.update_price_beliefs(actor);
        actor.ai_gathering_target.set(31 /* MATERIAL.WOOD_RED */, common_1.AIfunctions.check_local_demand_for_material(actor, 31 /* MATERIAL.WOOD_RED */));
        if (target.cell_id == actor.cell_id) {
            effects_1.Effect.enter_location(actor.id, target.id);
            manager_1.ActionManager.start_action(actions_00_1.CharacterAction.GATHER_WOOD, actor, actor.cell_id);
        }
        else {
            common_1.AIfunctions.go_to_location(actor, target);
        }
    }
});
storage_1.AIActionsStorage.register_action_location({
    tag: "gather-wood-for-yourself",
    utility(actor, target) {
        if (target.forest == 0)
            return 0;
        if (actor.open_shop)
            return 0;
        let desired = actor.ai_desired_stash.get(31 /* MATERIAL.WOOD_RED */)
            - actor.stash.get(31 /* MATERIAL.WOOD_RED */);
        return desired / 50 - actor.savings.get() / 1000;
    },
    // AIs are pretty shortsighted
    potential_targets(actor) {
        let result = data_id_1.DataID.Cells.locations(actor.cell_id).map(data_objects_1.Data.Locations.from_id).filter((item) => item.forest > 0);
        for (const neighbour of data_objects_1.Data.World.neighbours(actor.cell_id)) {
            result = result.concat(data_id_1.DataID.Cells.locations(neighbour)
                .map(data_objects_1.Data.Locations.from_id)
                .filter((item) => (item.forest > 0) && (system_1.MapSystem.can_move(data_objects_1.Data.World.id_to_coordinate(item.cell_id)))));
        }
        return result;
    },
    action(actor, target) {
        if (target.cell_id == actor.cell_id) {
            effects_1.Effect.enter_location(actor.id, target.id);
            manager_1.ActionManager.start_action(actions_00_1.CharacterAction.GATHER_WOOD, actor, actor.cell_id);
        }
        else {
            common_1.AIfunctions.go_to_location(actor, target);
        }
    }
});
storage_1.AIActionsStorage.register_action_location({
    tag: "gather-cotton-to-sell",
    utility(actor, target) {
        if (target.cotton == 0)
            return 0;
        if (actor.open_shop)
            return 0;
        let disbalance = +actor.ai_gathering_target.get(2 /* MATERIAL.COTTON */)
            + common_1.AIfunctions.check_local_demand_for_material(actor, 2 /* MATERIAL.COTTON */)
            - common_1.AIfunctions.check_local_supply_for_material(actor, 2 /* MATERIAL.COTTON */)
            - actor.stash.get(2 /* MATERIAL.COTTON */);
        return disbalance / 50 + Math.random() * 0.1 - actor.savings.get() / 1000;
    },
    // AIs are pretty shortsighted
    potential_targets(actor) {
        let result = data_id_1.DataID.Cells.locations(actor.cell_id).map(data_objects_1.Data.Locations.from_id).filter((item) => item.cotton > 0);
        for (const neighbour of data_objects_1.Data.World.neighbours(actor.cell_id)) {
            result =
                result
                    .concat(data_id_1.DataID.Cells.locations(neighbour)
                    .map(data_objects_1.Data.Locations.from_id)
                    .filter((item) => (item.cotton > 0) && (system_1.MapSystem.can_move(data_objects_1.Data.World.id_to_coordinate(item.cell_id)))));
        }
        return result;
    },
    action(actor, target) {
        common_1.AIfunctions.update_price_beliefs(actor);
        actor.ai_gathering_target.set(2 /* MATERIAL.COTTON */, common_1.AIfunctions.check_local_demand_for_material(actor, 2 /* MATERIAL.COTTON */));
        if (target.cell_id == actor.cell_id) {
            effects_1.Effect.enter_location(actor.id, target.id);
            manager_1.ActionManager.start_action(actions_00_1.CharacterAction.GATHER_COTTON, actor, actor.cell_id);
        }
        else {
            common_1.AIfunctions.go_to_location(actor, target);
        }
    }
});
storage_1.AIActionsStorage.register_action_location({
    tag: "gather-cotton-for-yourself",
    utility(actor, target) {
        if (target.cotton == 0)
            return 0;
        if (actor.open_shop)
            return 0;
        let desired = actor.ai_desired_stash.get(2 /* MATERIAL.COTTON */)
            - actor.stash.get(2 /* MATERIAL.COTTON */);
        return desired / 50 + Math.random() * 0.1 - actor.savings.get() / 1000;
    },
    // AIs are pretty shortsighted
    potential_targets(actor) {
        let result = data_id_1.DataID.Cells.locations(actor.cell_id).map(data_objects_1.Data.Locations.from_id).filter((item) => item.cotton > 0);
        for (const neighbour of data_objects_1.Data.World.neighbours(actor.cell_id)) {
            result =
                result
                    .concat(data_id_1.DataID.Cells.locations(neighbour)
                    .map(data_objects_1.Data.Locations.from_id)
                    .filter((item) => (item.cotton > 0) && (system_1.MapSystem.can_move(data_objects_1.Data.World.id_to_coordinate(item.cell_id)))));
        }
        return result;
    },
    action(actor, target) {
        if (target.cell_id == actor.cell_id) {
            effects_1.Effect.enter_location(actor.id, target.id);
            manager_1.ActionManager.start_action(actions_00_1.CharacterAction.GATHER_COTTON, actor, actor.cell_id);
        }
        else {
            common_1.AIfunctions.go_to_location(actor, target);
        }
    }
});
storage_1.AIActionsStorage.register_action_location({
    tag: "fish-to-sell",
    utility(actor, target) {
        if (target.fish == 0)
            return 0;
        if (actor.open_shop)
            return 0;
        let desired = +common_1.AIfunctions.check_local_demand_for_material(actor, 26 /* MATERIAL.FISH_OKU */)
            - common_1.AIfunctions.check_local_supply_for_material(actor, 26 /* MATERIAL.FISH_OKU */)
            + actor.ai_gathering_target.get(26 /* MATERIAL.FISH_OKU */)
            - actor.stash.get(26 /* MATERIAL.FISH_OKU */);
        const skill = character_1.CharacterValues.skill(actor, "fishing");
        return (desired / 50 + Math.random() * 0.1) * skill / 100 - actor.savings.get() / 2000;
    },
    // AIs are pretty shortsighted
    potential_targets(actor) {
        let result = data_id_1.DataID.Cells.locations(actor.cell_id).map(data_objects_1.Data.Locations.from_id).filter((item) => item.fish > 0);
        for (const neighbour of data_objects_1.Data.World.neighbours(actor.cell_id)) {
            result =
                result
                    .concat(data_id_1.DataID.Cells.locations(neighbour)
                    .map(data_objects_1.Data.Locations.from_id)
                    .filter((item) => (item.fish > 0) && (system_1.MapSystem.can_move(data_objects_1.Data.World.id_to_coordinate(item.cell_id)))));
        }
        return result;
    },
    action(actor, target) {
        common_1.AIfunctions.update_price_beliefs(actor);
        actor.ai_gathering_target.set(26 /* MATERIAL.FISH_OKU */, common_1.AIfunctions.check_local_demand_for_material(actor, 26 /* MATERIAL.FISH_OKU */));
        if (target.cell_id == actor.cell_id) {
            effects_1.Effect.enter_location(actor.id, target.id);
            manager_1.ActionManager.start_action(actions_00_1.CharacterAction.FISH, actor, actor.cell_id);
        }
        else {
            common_1.AIfunctions.go_to_location(actor, target);
        }
    }
});
storage_1.AIActionsStorage.register_action_location({
    tag: "fish-for-yourself",
    utility(actor, target) {
        if (target.fish == 0)
            return 0;
        if (actor.open_shop)
            return 0;
        let desired = actor.ai_desired_stash.get(26 /* MATERIAL.FISH_OKU */)
            - actor.stash.get(26 /* MATERIAL.FISH_OKU */);
        const skill = character_1.CharacterValues.skill(actor, "fishing");
        return (desired / 50 + Math.random() * 0.1) * skill / 100 - actor.savings.get() / 2000;
    },
    // AIs are pretty shortsighted
    potential_targets(actor) {
        let result = data_id_1.DataID.Cells.locations(actor.cell_id).map(data_objects_1.Data.Locations.from_id).filter((item) => item.fish > 0);
        for (const neighbour of data_objects_1.Data.World.neighbours(actor.cell_id)) {
            result =
                result
                    .concat(data_id_1.DataID.Cells.locations(neighbour)
                    .map(data_objects_1.Data.Locations.from_id)
                    .filter((item) => (item.fish > 0) && (system_1.MapSystem.can_move(data_objects_1.Data.World.id_to_coordinate(item.cell_id)))));
        }
        return result;
    },
    action(actor, target) {
        if (target.cell_id == actor.cell_id) {
            effects_1.Effect.enter_location(actor.id, target.id);
            manager_1.ActionManager.start_action(actions_00_1.CharacterAction.FISH, actor, actor.cell_id);
        }
        else {
            common_1.AIfunctions.go_to_location(actor, target);
        }
    }
});