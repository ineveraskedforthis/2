import { cell_id } from "@custom_types/ids"
import { Character, CharacterMapAction, TriggerResponse } from "../data/entities/character"
import { Alerts } from "../client_communication/network_actions/alerts"
import { Data } from "../data/data_objects"
import { ms } from "@custom_types/battle_data"
import { MarketOrders } from "../market/system"



export namespace ActionManager {
    export function start_action(action: CharacterMapAction, char: Character, cell: cell_id): TriggerResponse {
        if (char.action != undefined) {
            return { response: 'Notification:', value: "You are already doing something", tag: "condition_failed"}
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

    export function update_characters(dt: ms) {
        Data.Characters.for_each(character => {
            if (character.action != undefined) {
                character.action_progress += dt / 1000
                if (character.action_progress > character.action_duration) {
                    // console.log("action", character.id)
                    call_action(character.action, character, character.next_cell||character.cell_id)
                }
            }
        })
    }
}

