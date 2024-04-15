import { cell_id } from "@custom_types/ids"
import { Character } from "../character/character"
// import { attack } from "./attack"
import { Alerts } from "../client_communication/network_actions/alerts"
import { CharacterMapAction, TriggerResponse } from "./types"
import { Data } from "../data/data_objects"



export namespace ActionManager {
    export function start_action(action: CharacterMapAction, char: Character, cell: cell_id): TriggerResponse {
        if (char.action != undefined) {
            return { response: 'Notification:', value: "You are already doing something" }
        }

        let check = action.check(char, cell)
        if (check.response != "OK") {
            return check
        }

        let duration = action.duration(char)
        Alerts.action_ping(char, duration, action.is_move||false)
        if (action.immediate) {
            call_action(action, char, cell)
        } else {
            action.start(char, cell)

            char.action = action
            char.action_progress = 0
            char.action_duration = duration
        }
        return check
    }

    export function call_action(action: CharacterMapAction, char: Character, cell_id: cell_id): TriggerResponse {
        char.action = undefined
        char.action_duration = 0
        char.action_progress = 0

        let check = action.check(char, cell_id)
        if (check.response == "OK") {
            action.result(char, cell_id)
        }
        return check
    }

    export function update_characters(dt: number) {
        Data.Characters.for_each(character => {
            if (character.action != undefined) {
                character.action_progress += dt
                if (character.action_progress > character.action_duration) {
                    call_action(character.action, character, character.next_cell||character.cell_id)
                }
            }
        })
    }
}

