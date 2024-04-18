import { ActionManager } from "../../actions/manager";
import { CharacterAction } from "../../actions/actions_00";
import { Convert } from "../../systems_communication";
import { SocketWrapper, User } from "../user";
import { UserManagement } from "../user_manager";
import { Alerts } from "./alerts";
import { CharacterMapAction, TriggerResponse } from "../../actions/types";
import { battle_action_position, battle_action_self, battle_action_character } from "../../battle/actions";
import { Validator } from "./common_validations";
import { Data } from "../../data/data_objects";
import { CharactersHeap } from "../../battle/classes/heap";
import { character_id } from "@custom_types/ids";
import { ActionPositionKeys, ActionUnitKeys, battle_position } from "@custom_types/battle_data";

export namespace HandleAction {
    function response_to_alert(user: User, response: TriggerResponse) {
        // console.log(response.response)
        switch(response.response) {
            case "Notification:":Alerts.generic_user_alert(user, "alert", response.value)
            case "OK":return
            case "Not enough resources":Alerts.generic_user_alert(user, "alert", "Not enough: " + JSON.stringify(response.value))
        }
    }
    export function move(sw: SocketWrapper, data: {x: unknown, y: unknown}) {
        // do not handle unlogged or characterless
        if (sw.user_id == undefined) return
        const user = UserManagement.get_user(sw.user_id)
        const character = Convert.user_to_character(user)
        if (character == undefined) return

        // sanitise data
        const x = Number(data.x)
        const y = Number(data.y)
        if ((Number.isNaN(x)) || (Number.isNaN(y))) {
            return
        }

        const destination: [number, number] = [x, y]
        const cell = Data.World.coordinate_to_id(destination)
        let response = ActionManager.start_action(CharacterAction.MOVE, character, cell)
        response_to_alert(user, response)
    }

    export function act(sw: SocketWrapper, action: CharacterMapAction) {
        // do not handle unlogged or characterless
        if (sw.user_id == undefined) return
        const user = UserManagement.get_user(sw.user_id)
        const character = Convert.user_to_character(user)
        if (character == undefined) return

        const destination = character.cell_id
        let response = ActionManager.start_action(action, character, destination)
        // console.log(response)
        response_to_alert(user, response)
    }

    export function battle_self(sw: SocketWrapper, tag: unknown) {
        // console.log('action self', tag)
        if (typeof tag != 'string') return

        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return
        if (!character.in_battle()) return

        const battle =   Convert.character_to_battle(character)
        if (battle == undefined) return

        if (!battle.waiting_for_input) {
            console.log('not waiting for input')
            return
        }
        if (CharactersHeap.get_selected_unit(battle)?.id != character.id) {
            console.log('not selected unit')
            return
        }

        console.log('action is validated')
        battle_action_self(tag, battle, character)
    }

    export function battle_unit(sw: SocketWrapper, action: unknown) {
        console.log('action unit', action)
        if (!Validator.is_tag_value(action)) {
            return
        }

        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return
        if (!character.in_battle()) return

        const battle = Convert.character_to_battle(character)
        if (battle == undefined) {
            Alerts.alert(character, "Not in battle")
            return
        }

        if (!battle.waiting_for_input) {
            Alerts.alert(character, "Not your turn")
            return
        }
        if (CharactersHeap.get_selected_unit(battle)?.id != character.id) {
            Alerts.alert(character, "Not your turn")
            return
        }

        const target_unit = CharactersHeap.get_unit(battle, action.target as character_id)
        if (target_unit == undefined) {
            Alerts.alert(character, "Undefined target")
            return
        }

        battle_action_character(action.tag as ActionUnitKeys, battle, character, target_unit)
    }

    export function battle_position(sw: SocketWrapper, action: unknown) {
        // console.log('action position', action)
        if (!Validator.is_tag_point(action)) return;

        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character == undefined) return
        if (!character.in_battle()) return

        const battle =   Convert.character_to_battle(character)
        if (battle == undefined) return
        const unit =     character
        if (unit == undefined) return

        if (!battle.waiting_for_input) {
            return
        }
        if (CharactersHeap.get_selected_unit(battle)?.id != unit.id) {
            return
        }

        const target = action.target as battle_position

        battle_action_position(action.tag as ActionPositionKeys, battle, character, target)
    }
}