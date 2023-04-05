import { CharacterAction } from "../action_types"
import { ActionManager } from "../actions/action_manager"
import { Character } from "../character/character"
import { Event } from "../events/events"
import { Convert } from "../systems_communication"
import { AIactions } from "./AIactions"
import { rat_go_home, rat_walk } from "./actions"
import { steppe_constraints } from "./constraints"
import { AIhelper } from "./helpers"

export function RatRoutine(char: Character) {
    if ((char.get_fatigue() > 70) || (char.get_stress() > 30)) {
        ActionManager.start_action(CharacterAction.REST, char, [0, 0])
        return
    } else if (char.get_fatigue() > 30) {
        rat_go_home(char, steppe_constraints)
        return
    }

    let target = AIhelper.enemies_in_cell(char)
    const target_char = Convert.id_to_character(target)
    if (target_char != undefined) {
        Event.start_battle(char, target_char)
    } else {
        rat_walk(char, steppe_constraints)
        return
    }
}