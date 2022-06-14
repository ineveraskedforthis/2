import { CharacterGenericPart } from "../character_generic_part";
import {CharacterActionResponce} from '../../manager_classes/action_manager'

export const rest = {
    duration(char: CharacterGenericPart) {
        return 0.1 + char.get_fatigue() / 20;
    },

    check: async function(pool: any, char:CharacterGenericPart, data: any): Promise<CharacterActionResponce> {
        if (!char.in_battle()) {
            let cell = char.get_cell();
            if (cell == undefined) {
                return CharacterActionResponce.INVALID_CELL
            }
            if (cell.can_rest() || (char.misc.tag == 'rat')) {
                return CharacterActionResponce.OK
            } 
            return CharacterActionResponce.NO_RESOURCE
        } 
        return CharacterActionResponce.IN_BATTLE
    },

    result: async function(pool: any, char:CharacterGenericPart, data: any) {
        char.changed = true
        let cell = char.get_cell();
        if (cell == undefined) return 
        if (cell.can_rest() || (char.misc.tag == 'rat')) {
            char.change_fatigue(-20)
            char.change_stress(-5)
        } else {
            let df = 10
            if (char.get_fatigue() - df < 40) {
                df = char.get_fatigue() - 40
            }
            char.change_fatigue(df)
        }

        char.send_status_update()
    },

    start: async function(pool: any, char:CharacterGenericPart, data: any) {
    },
}