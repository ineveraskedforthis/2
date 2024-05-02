var _a;
import { List } from "../../../widgets/List/list.js";
import { selectOne } from "../../HTMLwrappers/common.js";
import { BattleImage } from "../battle_image.js";
export const keybinds = {
    'Move': 'q',
    'MoveTowards': 'w',
    'Slash': 'e',
    'Pierce': 'r',
    'Knock': 't',
    'MagicBolt': 'a',
    'Shoot': 's',
    'Retreat': 'd',
    'EndTurn': 'f',
};
const columns = [
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
];
export class ActionsListWidget {
    static update_action(action) {
        for (var i = 0; i < this.list.data.length; i++) {
            if (this.list.data[i].tag == action.tag)
                break;
        }
        if (i == this.list.data.length) {
            this.list.data.push(action);
            return false;
        }
        this.list.data[i] = action;
        this.list.update_display();
        return true;
    }
    static update_display() {
        this.list.update_display();
    }
}
_a = ActionsListWidget;
ActionsListWidget.list = new List(selectOne(".battle_control"));
(() => {
    _a.list.columns = columns;
    _a.list.per_line_class_by_item = (item) => {
        switch (item.possible) {
            case 0 /* BattleActionPossibilityReason.Okay */: return ['battle_action'];
            case 1 /* BattleActionPossibilityReason.NotEnoughAP */: return ['disabled_ap', 'battle_action'];
            case 2 /* BattleActionPossibilityReason.FarAway */: return ['disabled_far_away', 'battle_action'];
            case 3 /* BattleActionPossibilityReason.NoResource */: return ['disabled_lack', 'battle_action'];
            case 4 /* BattleActionPossibilityReason.InvalidAction */: return ['disabled_invalid', 'battle_action'];
        }
    };
    _a.list.onclick = (unit) => { BattleImage.send_action(unit.tag, unit.target); };
})();
