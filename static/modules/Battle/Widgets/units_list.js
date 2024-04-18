var _a;
import { List } from "../../../widgets/List/list.js";
import { select, selectOne } from "../../HTMLwrappers/common.js";
import { BattleImage } from "../battle_image.js";
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
        custom_display: (unit) => unit.ap.toFixed(2),
        type: "number",
        custom_style: ["flex-0-0-50px"],
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
        custom_style: ["flex-0-0-30px"]
    }
];
export class UnitsListWidget {
    static get_line(id) {
        return select('.fighter_' + id);
    }
    static unselect(id) {
        for (const item of this.get_line(id)) {
            item.classList.remove("selected_unit");
        }
    }
    static unhover(id) {
        for (const item of this.get_line(id)) {
            item.classList.remove("hovered_unit");
        }
    }
    static unturn(id) {
        for (const item of this.get_line(id)) {
            item.classList.remove("current_turn");
        }
    }
    static set selected(id) {
        for (const item of this.get_line(id)) {
            item.classList.add("selected_unit");
        }
    }
    static set hovered(id) {
        for (const item of this.get_line(id)) {
            item.classList.add("hovered_unit");
        }
    }
    static set current_turn(id) {
        for (const item of this.get_line(id)) {
            item.classList.add("current_turn");
        }
    }
    static remove_unit(id) {
        this.enemies_list.data = this.enemies_list.data.filter((item) => (item.id != id));
    }
}
_a = UnitsListWidget;
UnitsListWidget.enemies_list = new List(selectOne('.enemy_list'));
(() => {
    _a.enemies_list.columns = columns;
    _a.enemies_list.onclick = (unit) => BattleImage.select(unit.id);
    _a.enemies_list.onmouseenter = (unit, line) => BattleImage.set_hover(unit);
    _a.enemies_list.onmouseleave = (unit, line) => BattleImage.clear_hover();
    _a.enemies_list.per_line_class = ['enemy_status'];
    _a.enemies_list.per_line_class_by_item = (item) => ["fighter_" + item.id];
})();
