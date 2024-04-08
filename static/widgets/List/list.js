function is_string_column(column) {
    return column.type == "string";
}
function is_icon_column(column) {
    return (column.type == "string") && ("image_path" in column);
}
function is_active_column(column) {
    return (column.type == "string") && ("onclick" in column);
}
export class List {
    constructor(container) {
        this.container = container;
        this.wrapper = document.createElement("div");
        this.wrapper.classList.add("wrapper");
        this.wrapper.classList.add("table-25px-rows-flex");
        container.appendChild(this.wrapper);
        this._sorting_sequence = [];
        this._data = [];
        this._columns = [];
        this._filter = undefined;
    }
    update_display() {
        this._update_table();
    }
    _update_table() {
        this.wrapper.innerHTML = "";
        // sorting data first
        for (const sorting_setting of this._sorting_sequence) {
            let order = sorting_setting.order;
            const column = this._columns[sorting_setting.column];
            this.data.sort((a, b) => {
                if (is_string_column(column)) {
                    const A = column.value(a);
                    const B = column.value(b);
                    return A.localeCompare(B) * order;
                }
                else {
                    const A = column.value(a);
                    const B = column.value(b);
                    return (A - B) * order;
                }
            });
        }
        //generating header:
        const header = document.createElement("div");
        header.classList.add("table-row");
        header.classList.add("table-header-row");
        this.wrapper.appendChild(header);
        let index = 0;
        for (let col of this.columns) {
            let div = document.createElement("div");
            if (col.width_style) {
                div.style.width = col.width_style;
            }
            div.classList.add("column_" + index);
            div.classList.add("generic-button");
            if (col.custom_style != undefined)
                div.classList.add(...col.custom_style);
            if (col.header_background) {
                div.style.backgroundImage = col.header_background;
            }
            if (col.header_text) {
                div.innerText = col.header_text;
            }
            ((table, sorting_index) => (div.onclick = () => {
                if (table.sorted_column == sorting_index) {
                    table.sorting_order = -table.sorting_order;
                }
                else {
                    table.sorted_column = sorting_index;
                }
            }))(this, index);
            header.appendChild(div);
            index++;
        }
        //generating the rest of the table:
        let item_index = 0;
        for (let item of this._data) {
            if ((this._filter != undefined) && (this._filter(item) == false))
                continue;
            const line = document.createElement("div");
            line.classList.add("table-row");
            line.classList.add("line_" + item_index);
            ((table, item_index) => {
                line.onmouseenter = () => { table.hovered_item_index = item_index; };
                line.onmouseleave = () => { table.hovered_item_index = undefined; };
                line.onclick = () => { table.selected_item_index = item_index; };
            })(this, item_index);
            let index = 0;
            for (let col of this.columns) {
                let div = document.createElement("div");
                if (col.width_style)
                    div.style.width = col.width_style;
                div.classList.add("column_" + index);
                if (col.custom_style != undefined)
                    div.classList.add(...col.custom_style);
                if (!is_string_column(col)) {
                    div.classList.add('align-right');
                }
                if (is_icon_column(col)) {
                    div.style.backgroundImage = col.image_path(item);
                }
                else {
                    div.innerText = col.value(item).toString();
                }
                if (is_active_column(col)) {
                    div.classList.add("generic-button");
                    div.onclick = col.onclick(item);
                }
                line.appendChild(div);
                index++;
            }
            this.wrapper.appendChild(line);
            item_index++;
        }
    }
    set sorted_column(data) {
        console.log("sort column " + data);
        if (data == undefined) {
            return;
        }
        this._sorting_sequence = this._sorting_sequence.filter((value) => value.column != data);
        this._sorting_sequence.push({
            column: data,
            order: 1
        });
        this._update_table();
    }
    get sorted_column() {
        const len = this._sorting_sequence.length;
        if (len == 0) {
            return undefined;
        }
        return this._sorting_sequence[len - 1].column;
    }
    set sorting_order(data) {
        const len = this._sorting_sequence.length;
        if (len == 0) {
            return;
        }
        this._sorting_sequence[len - 1].order = data;
        this._update_table();
    }
    get sorting_order() {
        const len = this._sorting_sequence.length;
        if (len == 0) {
            return 1;
        }
        return this._sorting_sequence[len - 1].order;
    }
    set data(data) {
        this._data = data;
        this._update_table();
    }
    get data() {
        return this._data;
    }
    set columns(columns) {
        this._columns = columns;
        this._sorting_sequence = [];
        for (let i = 0; i < columns.length; i++) {
            this._sorting_sequence.push({
                order: 1,
                column: i
            });
        }
        this._update_table();
    }
    get columns() {
        return this._columns;
    }
    get hovered_item_index() {
        return this._hovered_item_index;
    }
    get selected_item_index() {
        return this._selected_item_index;
    }
    set hovered_item_index(x) {
        this._hovered_item_index = x;
    }
    set selected_item_index(x) {
        this._selected_item_index = x;
    }
    set filter(f) {
        this._filter = f;
        this._update_table();
    }
}
