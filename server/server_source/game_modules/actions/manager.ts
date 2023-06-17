import { cell_id } from "@custom_types/common"
import { Character } from "../character/character"
// import { attack } from "./attack"
import { Alerts } from "../client_communication/network_actions/alerts"
import { Data } from "../data"
import { CharacterMapAction, TriggerResponse } from "./types"



export namespace ActionManager {
    export function start_action(action: CharacterMapAction, char: Character, cell: cell_id): TriggerResponse {
        if (char.action != undefined) {
            return { response: 'ALREADY_IN_AN_ACTION' }
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
        for (let character of Data.CharacterDB.list()) {
            if (character == undefined) continue

            if (character.action != undefined) {
                character.action_progress += dt
                if (character.action_progress > character.action_duration) {
                    call_action(character.action, character, character.next_cell||character.cell_id)
                }
            }
        }
    }
}

