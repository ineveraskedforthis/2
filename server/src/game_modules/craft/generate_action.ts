import { MaterialStorage } from "@content/content";
import { cell_id } from "@custom_types/ids";
import { box } from "@custom_types/inventory";
import { Character, MapActionTriggerTargeted, NotificationResponse, TriggerResponse } from "../data/entities/character";
import { check_inputs } from "./helpers";

export function generate_check_funtion(inputs: box[]): MapActionTriggerTargeted {
    return (char: Character, cell: cell_id) : TriggerResponse => {
        if (char.in_battle())
            return NotificationResponse.InBattle;
        if (check_inputs(inputs, char.stash)) {
            return { response: 'OK' };
        }
        return { response: "Not enough resources", value: inputs.map((value) => {return {
            required_amount: value.amount,
            required_thing: MaterialStorage.get(value.material).name
        }})};
    }
}