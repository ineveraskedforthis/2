function is_string_column(column) {
    return column.type == "string";
}
function is_number_column(column) {
    return column.type == "number";
}
function is_html_column(column) {
    return column.type == "html";
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
                const validate_a = column.value(a);
                const validate_b = column.value(b);
                if (validate_a == undefined) {
                    //alert("INVALID TABLE ENTRY")
                    console.error("INVALID ENTRY:");
                    console.log(a);
                    console.log(column.header_text);
                }
                if (validate_b == undefined) {
                    //alert("INVALID TABLE ENTRY")
                    console.error("INVALID ENTRY:");
                    console.log(b);
                    console.log(column.header_text);
                }
                if (is_string_column(column)) {
                    const A = column.value(a);
                    const B = column.value(b);
                    return A.localeCompare(B) * order;
                }
                else if (is_number_column(column)) {
                    const A = column.value(a);
                    const B = column.value(b);
                    return (A - B) * order;
                }
                else if (is_html_column(column)) {
                    const A = column.value(a);
                    const B = column.value(b);
                    return (A.innerHTML).localeCompare(B.innerHTML) * order;
                }
                return 0;
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
            ((table, item_index, line) => {
                line.onmouseenter = () => { table.hovered_item_index = item_index; };
                line.onmouseleave = () => { table.hovered_item_index = undefined; };
            })(this, item_index, line);
            let index = 0;
            for (let col of this.columns) {
                let div = document.createElement("div");
                if (col.width_style)
                    div.style.width = col.width_style;
                div.classList.add("column_" + index);
                if (col.custom_style != undefined)
                    div.classList.add(...col.custom_style);
                if (is_number_column(col)) {
                    div.classList.add('right-centered-box');
                }
                if (is_string_column(col)) {
                    div.classList.add('centered-box');
                }
                if (is_icon_column(col)) {
                    div.style.backgroundImage = col.image_path(item);
                }
                else if (is_html_column(col)) {
                    div.appendChild(col.value(item));
                }
                else {
                    div.innerText = col.value(item).toString();
                }
                if (is_active_column(col)) {
                    div.classList.add("generic-button");
                    if (col.viable(item)) {
                        div.onclick = col.onclick(item);
                    }
                    else {
                        div.classList.add("disabled");
                    }
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
        console.log("update table with data:");
        console.log(data);
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
                order: -1,
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
    get selected_item() {
        const selected_index = this.selected_item_index;
        if (selected_index == undefined) {
            return undefined;
        }
        return this._data[selected_index];
    }
    set filter(f) {
        this._filter = f;
        this._update_table();
    }
}

