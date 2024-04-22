import { CharacterAction } from "../../actions/actions_00";
import { ActionManager } from "../../actions/manager";
import { DataID } from "../../data/data_id";
import { Data } from "../../data/data_objects";
import { Effect } from "../../effects/effects";
import { ScriptedValue } from "../../events/scripted_values";
import { AIActionsStorage } from "../Storage/storage";

AIActionsStorage.register_action_location({
    tag : "rest_local",
    utility(actor, target) {
        const price = ScriptedValue.rest_price(actor, target)
        if (price > actor.savings.get()) {
            return 0
        }

        const fatigue = actor.fatigue / 100
        const stress = actor.stress / 100

        const target_stress = ScriptedValue.target_stress(actor, target) / 100
        const target_fatigue = ScriptedValue.target_fatigue(actor, target) / 100

        const utility_fatigue = Math.max(0, fatigue - target_fatigue)
        const utility_stress = Math.max(0, stress - target_stress)

        return utility_fatigue + utility_stress
    },

    potential_targets(actor) {
        return DataID.Cells.locations(actor.cell_id).map(Data.Locations.from_id)
    },

    action(actor, target) {
        Effect.enter_location(actor.id, target.id)
        ActionManager.start_action(CharacterAction.REST, actor, actor.cell_id)
    }
})

