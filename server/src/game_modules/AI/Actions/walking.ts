import { location_id } from "@custom_types/ids";
import { CharacterAction } from "../../actions/actions_00";
import { ActionManager } from "../../actions/manager";
import { DataID } from "../../data/data_id";
import { Data } from "../../data/data_objects";
import { AIActionsStorage } from "../Storage/storage";
import { MapSystem } from "../../map/system";
import { AIfunctions, directions } from "../HelperFunctions/common";
import { select_weighted_callback } from "../../calculations/basic_functions";
import { Effect } from "../../effects/effects";
import { MATERIAL } from "@content/content";

AIActionsStorage.register_action_location({
    tag: "go-home",
    utility(actor, target) {
        if (Data.Locations.from_id(actor.location_id).cell_id == target.cell_id) {
            return 0;
        }

        const fatigue = actor.fatigue / 100;
        const stress = actor.stress / 100;

        const lack_of_hp = (actor.hp_max - actor.hp) / actor.hp_max;
        const utility_fatigue = Math.max(0, fatigue - 0.2);
        const utility_stress = Math.max(0, stress - 0.5);
        const weight = AIfunctions.loot_weight(actor) / 20;

        return 0.05 + utility_fatigue + utility_stress + lack_of_hp + weight;
    },
    potential_targets(actor) {
        const pre_result: location_id[] = [];
        for (const reputation of DataID.Reputation.character(actor.id)) {
            if (reputation.reputation == "friend" || reputation.reputation == "member" || reputation.reputation == "leader") {
                pre_result.push(DataID.Faction.spawn(reputation.faction_id));
            }
        }
        if (actor.home_location_id != undefined) {
            pre_result.push(actor.home_location_id);
        }

        return pre_result.map(Data.Locations.from_id);
    },
    action(actor, target) {
        AIfunctions.go_to_location(actor, target)
    }
});


AIActionsStorage.register_action_cell({
    tag: "walk",

    utility(actor, target) {
        if (actor.open_shop) {
            return 0
        }
        return 0.1
    },

    potential_targets(actor) {
        const cell = Data.Cells.from_id(actor.cell_id)

        let possible_moves = []
        for (let d of directions) {
            let tmp: [number, number] = [d[0] + cell.x, d[1] + cell.y]
            let target_id = Data.World.coordinate_to_id(tmp)
            let target_cell = Data.Cells.from_id(target_id)
            if (target_cell != undefined) {
                if (MapSystem.can_move(tmp)) {
                    possible_moves.push(tmp)
                }
            }
        }

        if (possible_moves.length > 0) {
            let move_direction = possible_moves[Math.floor(Math.random() * possible_moves.length)]
            return [Data.World.coordinate_to_id(move_direction)].map(Data.Cells.from_id)
        }

        return []
    },

    action(actor, target) {
        if (Math.random() < 0.9) {
            const location_id = select_weighted_callback<location_id>(
                DataID.Cells.locations(actor.cell_id),
                (item) => 1
            )
            Effect.enter_location(actor.id, location_id)

            return
        }

        ActionManager.start_action(CharacterAction.MOVE, actor, target.id)
    },
})

AIActionsStorage.register_action_location({
    tag: "gather-berries",

    utility(actor, target) {
        if (target.berries == 0) return 0
        if (actor.open_shop) return 0

        let desired =
            actor.ai_desired_stash.get(MATERIAL.BERRY_FIE)
            + actor.ai_desired_stash.get(MATERIAL.BERRY_ZAZ)
            + 10
            - actor.stash.get(MATERIAL.BERRY_FIE)
            - actor.stash.get(MATERIAL.BERRY_ZAZ)
            + actor.ai_gathering_target.get(MATERIAL.BERRY_FIE)
            + actor.ai_gathering_target.get(MATERIAL.BERRY_ZAZ)

        return desired / 100
    },

    // AIs are pretty shortsighted
    potential_targets(actor) {
        let result = DataID.Cells.locations(actor.cell_id).map(Data.Locations.from_id).filter((item) => item.berries > 0)
        for (const neighbour of Data.World.neighbours(actor.cell_id)) {
            result = result.concat(DataID.Cells.locations(neighbour).map(Data.Locations.from_id).filter((item) => item.berries > 0))
        }
        return result
    },

    action(actor, target) {
        actor.ai_gathering_target.set(MATERIAL.BERRY_FIE, AIfunctions.check_local_demand_for_material(actor, MATERIAL.BERRY_FIE))
        actor.ai_gathering_target.set(MATERIAL.BERRY_ZAZ, AIfunctions.check_local_demand_for_material(actor, MATERIAL.BERRY_ZAZ))

        if (target.cell_id == actor.cell_id) {
            Effect.enter_location(actor.id, target.id)
            ActionManager.start_action(CharacterAction.GATHER_BERRIES, actor, actor.cell_id)
        } else {
            AIfunctions.go_to_location(actor, target)
        }
    }
})


AIActionsStorage.register_action_location({
    tag: "gather-wood",

    utility(actor, target) {
        if (target.berries == 0) return 0
        if (actor.open_shop) return 0

        let desired =
            actor.ai_desired_stash.get(MATERIAL.WOOD_RED)
            + 10
            - actor.stash.get(MATERIAL.WOOD_RED)
            + AIfunctions.check_local_demand_for_material(actor, MATERIAL.WOOD_RED)
            + actor.ai_gathering_target.get(MATERIAL.WOOD_RED)

        return desired / 100
    },

    // AIs are pretty shortsighted
    potential_targets(actor) {
        let result = DataID.Cells.locations(actor.cell_id).map(Data.Locations.from_id).filter((item) => item.forest > 0)
        for (const neighbour of Data.World.neighbours(actor.cell_id)) {
            result = result.concat(
                DataID.Cells.locations(neighbour)
                .map(Data.Locations.from_id)
                .filter((item) => (item.forest > 0) && (MapSystem.can_move(Data.World.id_to_coordinate(item.cell_id)))))
        }
        return result
    },

    action(actor, target) {
        actor.ai_gathering_target.set(MATERIAL.WOOD_RED, AIfunctions.check_local_demand_for_material(actor, MATERIAL.WOOD_RED))

        if (target.cell_id == actor.cell_id) {
            Effect.enter_location(actor.id, target.id)
            ActionManager.start_action(CharacterAction.GATHER_WOOD, actor, actor.cell_id)
        } else {
            AIfunctions.go_to_location(actor, target)
        }
    }
})


AIActionsStorage.register_action_location({
    tag: "gather-cotton",

    utility(actor, target) {
        if (target.cotton == 0) return 0
        if (actor.open_shop) return 0

        let desired =
            actor.ai_desired_stash.get(MATERIAL.COTTON)
            + 10
            - actor.stash.get(MATERIAL.COTTON)
            + AIfunctions.check_local_demand_for_material(actor, MATERIAL.COTTON)
            + actor.ai_gathering_target.get(MATERIAL.COTTON)

        return desired / 100 + Math.random() * 0.1
    },

    // AIs are pretty shortsighted
    potential_targets(actor) {
        let result = DataID.Cells.locations(actor.cell_id).map(Data.Locations.from_id).filter((item) => item.cotton > 0)
        for (const neighbour of Data.World.neighbours(actor.cell_id)) {
            result =
                result
                .concat(DataID.Cells.locations(neighbour)
                .map(Data.Locations.from_id)
                .filter((item) => (item.cotton > 0) && (MapSystem.can_move(Data.World.id_to_coordinate(item.cell_id)))))
        }
        return result
    },

    action(actor, target) {
        actor.ai_gathering_target.set(MATERIAL.COTTON, AIfunctions.check_local_demand_for_material(actor, MATERIAL.COTTON))

        if (target.cell_id == actor.cell_id) {
            Effect.enter_location(actor.id, target.id)
            ActionManager.start_action(CharacterAction.GATHER_COTTON, actor, actor.cell_id)
        } else {
            AIfunctions.go_to_location(actor, target)
        }
    }
})


AIActionsStorage.register_action_location({
    tag: "fish",

    utility(actor, target) {
        if (target.cotton == 0) return 0
        if (actor.open_shop) return 0

        let desired =
            actor.ai_desired_stash.get(MATERIAL.COTTON)
            + 10
            - actor.stash.get(MATERIAL.COTTON)
            + AIfunctions.check_local_demand_for_material(actor, MATERIAL.COTTON)
            + actor.ai_gathering_target.get(MATERIAL.COTTON)

        return desired / 100 + Math.random() * 0.1
    },

    // AIs are pretty shortsighted
    potential_targets(actor) {
        let result = DataID.Cells.locations(actor.cell_id).map(Data.Locations.from_id).filter((item) => item.fish > 0)
        for (const neighbour of Data.World.neighbours(actor.cell_id)) {
            result =
                result
                .concat(DataID.Cells.locations(neighbour)
                .map(Data.Locations.from_id)
                .filter((item) => (item.fish > 0) && (MapSystem.can_move(Data.World.id_to_coordinate(item.cell_id)))))
        }
        return result
    },

    action(actor, target) {
        actor.ai_gathering_target.set(MATERIAL.FISH_OKU, AIfunctions.check_local_demand_for_material(actor, MATERIAL.FISH_OKU))

        if (target.cell_id == actor.cell_id) {
            Effect.enter_location(actor.id, target.id)
            ActionManager.start_action(CharacterAction.FISH, actor, actor.cell_id)
        } else {
            AIfunctions.go_to_location(actor, target)
        }
    }
})