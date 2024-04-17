import { List } from "../../widgets/List/list.js";
import { selectOne } from "../HTMLwrappers/common.js";
import { BattleImage } from "./battle_image.js";
const columns = [
    {
        header_text: "Name",
        value: (unit) => unit.name,
        type: "string",
        custom_style: ["flex-1-0-5"]
    },
    {
        header_text: "AP",
        value: (unit) => unit.ap,
        type: "number",
        custom_style: ["flex-0-0-30px"],
    },
    {
        header_text: "HP",
        value: (unit) => unit.hp,
        type: "number",
        custom_style: ["flex-0-0-30px"]
    },
    {
        header_text: "Next turn",
        value: (unit) => unit.next_turn,
        type: "number",
        custom_style: ["flex-0-0-80px"]
    }
];
const enemy_list_div = selectOne('.enemy_list');
export const enemies_list = new List(enemy_list_div);
enemies_list.columns = columns;
enemies_list.onclick = (unit) => BattleImage.select(unit.id);
enemies_list.onmouseenter = (unit, line) => BattleImage.set_hover(unit.id, line);
enemies_list.onmouseleave = (unit, line) => BattleImage.remove_hover(unit.id, line);
enemies_list.per_line_class = ['enemy_status'];
enemies_list.per_line_class_by_item = (item) => ["fighter_" + item.id];
