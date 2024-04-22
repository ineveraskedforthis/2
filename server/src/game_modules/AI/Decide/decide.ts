import { Character } from "../../character/character";
import { Data } from "../../data/data_objects";
import { AIActionsStorage } from "../Storage/storage";

import "../Actions/_loader"

interface ActionCalculation<Target> {
    tag: string
    target: Target,
    utility: number,
    action: (actor: Character, target: Target) => void
}

export function decide() {
    Data.Characters.for_each((character) => {
        if (character.dead()) return;
        if (character.is_player()) return;
        if (character.in_battle()) return;
        if (character.action != undefined) return;

        // console.log("decide", character.name)

        let best : undefined | ActionCalculation<any>

        for (const item of AIActionsStorage.actions) {
            const targets = item.potential_targets(character)
            for (const target of targets) {
                const utility = item.utility(character, target)
                // console.log(item.tag, utility)

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
            console.log(character.name, best.tag)
            best.action(character, best.target)
        }
    })
}