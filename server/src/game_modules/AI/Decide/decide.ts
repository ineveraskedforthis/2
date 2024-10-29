import { Character } from "../../data/entities/character";
import { AIActionsStorage } from "../Storage/storage";
import "../Actions/_loader";
import { MarketOrders } from "../../market/system";

interface ActionCalculation<Target> {
    tag: string
    target: Target,
    utility: number,
    action: (actor: Character, target: Target) => void
}

export function decide(character: Character) {
    if (character.dead()) return;
    if (character.is_player()) return;
    if (character.in_battle()) return;
    if (character.action != undefined) return;

    let best : undefined | ActionCalculation<any>

    for (const item of AIActionsStorage.actions) {
        const targets = item.potential_targets(character)
        for (const target of targets) {
            const utility = item.utility(character, target)


            if ((best == undefined) || best.utility < utility) {
                best = {
                    tag: item.tag,
                    target: target,
                    utility: utility,
                    action: item.action
                }
            }
        }
    }

    if (best) {
        // console.log(best.tag + " " + character.id)
        best.action(character, best.target)
        character.current_ai_action = best.tag + " " +  best.target.id
    }
}