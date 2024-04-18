import { character_id } from "@custom_types/ids.js";
import { Column, List } from "../../../widgets/List/list.js";
import { select, selectOne } from "../../HTMLwrappers/common.js";
import { BattleImage } from "../battle_image.js";
import { UnitViewMinimal } from "../Types/UnitView.js";

const columns : Column<UnitViewMinimal>[] = [
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
        custom_style: [ "flex-0-0-30px"],
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
]




export class UnitsListWidget {
    static enemies_list = new List<UnitViewMinimal>(selectOne('.enemy_list'))
    static {
        this.enemies_list.columns = columns
        this.enemies_list.onclick = (unit) => BattleImage.select(unit.id);
        this.enemies_list.onmouseenter = (unit: UnitViewMinimal, line: HTMLElement) => BattleImage.set_hover(unit);
        this.enemies_list.onmouseleave = (unit: UnitViewMinimal, line: HTMLElement) => BattleImage.clear_hover();
        this.enemies_list.per_line_class = ['enemy_status']
        this.enemies_list.per_line_class_by_item = (item) => ["fighter_" + item.id]
    }

    static get_line(id: character_id):NodeListOf<Element>
    static get_line(id: character_id|undefined):NodeListOf<Element>
    static get_line(id: character_id|undefined):NodeListOf<Element> {
        return select('.fighter_' + id)
    }

    static unselect(id: character_id) {
        for (const item of this.get_line(id)) {
            item.classList.remove("selected_unit")
        }
    }

    static unhover(id: character_id) {
        for (const item of this.get_line(id)) {
            item.classList.remove("hovered_unit")
        }
    }

    static unturn(id: character_id) {
        for (const item of this.get_line(id)) {
            item.classList.remove("current_turn")
        }
    }

    static set selected(id: character_id) {
        for (const item of this.get_line(id)) {
            item.classList.add("selected_unit")
        }
    }

    static set hovered(id: character_id) {
        for (const item of this.get_line(id)) {
            item.classList.add("hovered_unit")
        }
    }

    static set current_turn(id: character_id) {
        for (const item of this.get_line(id)) {
            item.classList.add("current_turn")
        }
    }

    static remove_unit(id: character_id) {
        this.enemies_list.data = this.enemies_list.data.filter((item) => (item.id != id))
    }
}