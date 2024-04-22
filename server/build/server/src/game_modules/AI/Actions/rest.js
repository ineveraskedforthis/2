"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const actions_00_1 = require("../../actions/actions_00");
const manager_1 = require("../../actions/manager");
const data_id_1 = require("../../data/data_id");
const data_objects_1 = require("../../data/data_objects");
const effects_1 = require("../../effects/effects");
const scripted_values_1 = require("../../events/scripted_values");
const storage_1 = require("../Storage/storage");
storage_1.AIActionsStorage.register_action_location({
    tag: "rest_local",
    utility(actor, target) {
        const price = scripted_values_1.ScriptedValue.rest_price(actor, target);
        if (price > actor.savings.get()) {
            return 0;
        }
        const fatigue = actor.fatigue / 100;
        const stress = actor.stress / 100;
        const target_stress = scripted_values_1.ScriptedValue.target_stress(actor, target) / 100;
        const target_fatigue = scripted_values_1.ScriptedValue.target_fatigue(actor, target) / 100;
        const utility_fatigue = Math.max(0, fatigue - target_fatigue);
        const utility_stress = Math.max(0, stress - target_stress);
        return utility_fatigue + utility_stress;
    },
    potential_targets(actor) {
        return data_id_1.DataID.Cells.locations(actor.cell_id).map(data_objects_1.Data.Locations.from_id);
    },
    action(actor, target) {
        effects_1.Effect.enter_location(actor.id, target.id);
        manager_1.ActionManager.start_action(actions_00_1.CharacterAction.REST, actor, actor.cell_id);
    }
});
