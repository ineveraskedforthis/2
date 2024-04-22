"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const system_1 = require("../../battle/system");
const common_1 = require("../HelperFunctions/common");
const storage_1 = require("../Storage/storage");
storage_1.AIActionsStorage.register_action_character({
    tag: "fight",
    action: (character, target) => {
        system_1.BattleSystem.start_battle(character, target);
    },
    potential_targets(actor) {
        return common_1.AIfunctions.enemies_in_cell(actor);
    },
    utility: (character, target) => {
        return common_1.AIfunctions.lack_of_hp(target) + common_1.AIfunctions.hp(character) - 0.5;
    }
});
storage_1.AIActionsStorage.register_action_self({
    tag: "join-battle",
    action(actor, target) {
        common_1.AIfunctions.join_local_battle(actor);
    },
    potential_targets(actor) {
        return [actor];
    },
    utility(actor, target) {
        if (common_1.AIfunctions.check_local_battles(actor)) {
            return 0.5;
        }
        return 0;
    },
});
storage_1.AIActionsStorage.register_action_character({
    tag: "fight-hunt",
    action: (character, target) => {
        system_1.BattleSystem.start_battle(character, target);
    },
    potential_targets(actor) {
        return common_1.AIfunctions.prey_in_cell(actor);
    },
    utility: (character, target) => {
        return common_1.AIfunctions.lack_of_hp(target) + common_1.AIfunctions.hp(character) - 0.5;
    }
});
