import { BattleSystem } from "../../battle/system";
import { AIfunctions } from "../HelperFunctions/common";
import { AIActionsStorage } from "../Storage/storage";

AIActionsStorage.register_action_character({
    tag: "fight",
    action : (character, target) => {
        BattleSystem.start_battle(character, target)
    },

    potential_targets(actor) {
        return AIfunctions.enemies_in_cell(actor)
    },

    utility: (character, target) => {
        return AIfunctions.lack_of_hp(target) + AIfunctions.hp(character) - 0.5
    }
})

AIActionsStorage.register_action_self({
    tag: "join-battle",
    action(actor, target) {
        AIfunctions.join_local_battle(actor)
    },
    potential_targets(actor) {
        return [actor]
    },
    utility(actor, target) {
        if (AIfunctions.check_local_battles(actor)) {
            return 0.5
        }
        return 0
    },
})

AIActionsStorage.register_action_character({
    tag: "fight-hunt",
    action : (character, target) => {
        BattleSystem.start_battle(character, target)
    },

    potential_targets(actor) {
        return AIfunctions.prey_in_cell(actor)
    },

    utility: (character, target) => {
        return AIfunctions.lack_of_hp(target) + AIfunctions.hp(character) - 0.5
    }
})