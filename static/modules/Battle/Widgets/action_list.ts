import { BattleActionData, BattleActionPossibilityReason } from "../../../../shared/battle_data.js"
import { Column, List } from "../../../widgets/List/list.js";
import { selectOne } from "../../HTMLwrappers/common.js";
import { BattleImage } from "../battle_image.js";

export const keybinds: { [key: string]: string } = {
    'Move': 'q',
    'MoveTowards': 'w',
    'Slash': 'e',
    'Pierce': 'r',
    'Knock': 't',
    'MagicBolt': 'a',
    'Shoot': 's',
    'Retreat': 'd',
    'EndTurn': 'f',
}

const columns : Column<BattleActionData>[] = [
    {
        header_text: "",
        value: (item) => keybinds[item.tag] || "",
        type: "string",
        custom_style: ["flex-0-0-30px"]
    },
    {
        header_text: "Name",
        value: (item) => item.name,
        type: "string",
        custom_style: ["flex-1-0-5"]
    },
    {
        header_text: "AP",
        value: (item) => item.cost,
        type: "number",
        custom_display: (item) => item.cost.toFixed(1),
        custom_style: ["flex-0-0-30px"]
    },
    {
        header_text: "Dmg",
        value: (item) => item.damage,
        type: "number",
        custom_style: ["flex-0-0-30px"]
    },
    {
        header_text: "D/AP",
        value: (item) => item.damage == 0 ? 0 : item.damage / item.cost,
        custom_display: (item) => (item.damage == 0 ? 0 : item.damage / item.cost).toFixed(1),
        type: "number",
        custom_style: ["flex-0-0-50px"]
    },
    {
        header_text: "Chance",
        value: (item) => item.probability,
        type: "number",
        custom_display: (item) => Math.floor(item.probability * 100).toFixed(1) + '%',
        custom_style: ["flex-0-0-50px"]
    },
]

export class ActionsListWidget {
    static list = new List<BattleActionData>(selectOne(".battle_control"))
    static {
        this.list.columns = columns
        this.list.per_line_class_by_item = (item) => {
            switch(item.possible) {
                case BattleActionPossibilityReason.Okay: return ['battle_action'];
                case BattleActionPossibilityReason.NotEnoughAP: return ['disabled_ap', 'battle_action']
                case BattleActionPossibilityReason.FarAway: return ['disabled_far_away', 'battle_action']
                case BattleActionPossibilityReason.NoResource: return ['disabled_lack', 'battle_action']
                case BattleActionPossibilityReason.InvalidAction: return ['disabled_invalid', 'battle_action']
            }
        }
        this.list.onclick = (unit) => {BattleImage.send_action(unit.tag, unit.target)};
    }

    static update_action(action: BattleActionData): boolean {
        for (var i = 0; i < this.list.data.length; i++) {
            if (this.list.data[i].tag == action.tag) break;
        }

        if (i == this.list.data.length) {
            this.list.data.push(action)
            return false
        }

        this.list.data[i] = action
        this.list.update_display()
        return true
    }

    static update_display() {
        this.list.update_display()
    }
}