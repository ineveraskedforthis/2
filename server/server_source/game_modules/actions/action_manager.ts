import { Character } from "../character/character"
// import { attack } from "./attack"
import { Alerts } from "../client_communication/network_actions/alerts"
import { Data } from "../data"
import { ActionTargeted, CharacterActionResponce } from "../action_types"

export function dummy_duration(char: Character) {
    return 0.5;
}

export function dummy_start(char: Character) {}


export namespace ActionManager {
    export function start_action(action: ActionTargeted, char: Character, data: [number, number]) {
        if (char.action != undefined) {
            return CharacterActionResponce.ALREADY_IN_ACTION
        }
        let check = action.check(char, data)
        if (check != CharacterActionResponce.OK) {
            return check
        }
        
        let duration = action.duration(char)
        Alerts.action_ping(char, duration, action.is_move||false)
        if (action.immediate) {
            call_action(action, char, data)
        } else {
            action.start(char, data)

            char.action = action
            char.action_progress = 0
            char.action_duration = duration
        }
        return check
    }

    export function call_action(action: ActionTargeted, char: Character, data: [number, number]): CharacterActionResponce {
        char.action = undefined
        char.action_duration = 0
        char.action_progress = 0

        let check = action.check(char, data)
        if (check == CharacterActionResponce.OK) {
            return action.result(char, data)
        }
        return check
    }

    export function update_characters(dt: number) {
        for (let character of Data.CharacterDB.list()) {
            if (character == undefined) continue

            if (character.action != undefined) {
                character.action_progress += dt
                if (character.action_progress > character.action_duration) {
                    call_action(character.action, character, character.next_cell)
                }
            }
        }
    }
}

