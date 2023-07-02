import { Character } from "../character/character";
import { AI_ACTIONS } from "./ACTIONS_UTILITY";

export function decide_ai_action_campaign(character: Character) {
    let best_utility = 0
    let best_action: (character: Character) => void = (character) => undefined
    for (let item of Object.values(AI_ACTIONS)) {
        const utility = item.utility(character)
        if (utility > best_utility) {
            best_utility = utility
            best_action = item.action
        }
    }
    best_action(character)
}