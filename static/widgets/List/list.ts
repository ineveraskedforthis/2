interface ColumnBase<Item> {
    header_text?: string,
    header_background?: string

    width_style?: string;
    custom_style?: string[]
    custom_style_header?: string[]

    onclick?: (item:Item) => ((ev: MouseEvent) => void)
}

interface NumberColumn<Item> extends ColumnBase<Item> {
    value: (item: Item) => number

    type: "number"
}

interface HTMLElementColumn<Item> extends ColumnBase<Item> {
    value: (item: Item) => HTMLElement

    type: "html"
}

interface StringColumn<Item> extends ColumnBase<Item> {
    value: (item: Item) => string

    type: "string"
}

interface ActiveStringColumn<Item> extends StringColumn<Item> {
    onclick: (item:Item) => ((ev: MouseEvent) => void)
    viable: (item:Item) => boolean
}

interface IconColumn<Item> extends StringColumn<Item>{
    image_path: (item: Item) => string
    value: (item: Item) => string

    type: "string"
}

export type Column<Item> = IconColumn<Item>|NumberColumn<Item>|StringColumn<Item>|ActiveStringColumn<Item>|HTMLElementColumn<Item>

function is_string_column<Item>(column: Column<Item>): column is StringColumn<Item> {
    return column.type == "string"
}

function is_number_column<Item>(column: Column<Item>): column is NumberColumn<Item> {
    return column.type == "number"
}

function is_html_column<Item>(column: Column<Item>): column is HTMLElementColumn<Item> {
    return column.type == "html"
}

function is_icon_column<Item>(column: Column<Item>): column is IconColumn<Item> {
    return (column.type == "string") && ("image_path" in column)
}

function is_active_column<Item>(column: Column<Item>): column is ActiveStringColumn<Item> {
    return (column.type == "string") && ("onclick" in column)
}

interface ListInterface<Item> extends DependencyUI {
    data: Item[]
    columns: Column<Item>[]

    container: HTMLElement;

    sorted_column: number | undefined;
    sorting_order: sorting_order

    selected_item_index: number|undefined
    hovered_item_index: number|undefined

    filter: ((item: Item) => boolean)|undefined
}

type sorting_order = 1 | -1

interface sorting_setting {
    column: number
    order: sorting_order
}

export class List<Item> implements ListInterface<Item> {
    private _data: Item[]
    private _columns: Column<Item>[]

    container: HTMLElement
    private wrapper: HTMLElement

    private _sorting_sequence: sorting_setting[];

    private _selected_item_index: number|undefined
    private _hovered_item_index: number|undefined

    private _filter: ((item: Item) => boolean)|undefined

    constructor(container: HTMLElement) {
        this.container = container

        this.wrapper = document.createElement("div")
        this.wrapper.classList.add("wrapper")
        this.wrapper.classList.add("table-25px-rows-flex")

        container.appendChild(this.wrapper)

        this._sorting_sequence = []

        this._data = []
        this._columns = []

        this._filter = undefined
    }

    update_display() {
        this._update_table()
    }

    private _update_table() {
        this.wrapper.innerHTML = ""

        // sorting data first
        for (const sorting_setting of this._sorting_sequence) {
            let order = sorting_setting.order;
            const column = this._columns[sorting_setting.column]

            this.data.sort((a: Item, b: Item) => {
                if (is_string_column(column)) {
                    const A = column.value(a)
                    const B = column.value(b)

                    return A.localeCompare(B) * order
                } else if (is_number_column(column)) {
                    const A = column.value(a)
                    const B = column.value(b)

                    return (A - B) * order
                } else if (is_html_column(column)) {
                    const A = column.value(a)
                    const B = column.value(b)

                    return (A.innerHTML).localeCompare(B.innerHTML) * order
                }

                return 0
            })
        }

        //generating header:
        const header = document.createElement("div");
        header.classList.add("table-row")
        header.classList.add("table-header-row")
        this.wrapper.appendChild(header);

        let index = 0;
        for (let col of this.columns) {
            let div = document.createElement("div");
            if (col.width_style) {
                div.style.width = col.width_style;
            }
            div.classList.add("column_" + index)
            div.classList.add("generic-button")
            if (col.custom_style != undefined) div.classList.add(... col.custom_style);

            if (col.header_background) {
                div.style.backgroundImage = col.header_background
            }

            if (col.header_text) {
                div.innerText = col.header_text
            }

            ((table: List<Item>, sorting_index: number)=> (div.onclick = () => {
                if (table.sorted_column == sorting_index) {
                    table.sorting_order = -table.sorting_order as sorting_order
                } else {
                    table.sorted_column = sorting_index
                }
            }))(this, index)

            header.appendChild(div);
            index++;
        }

        //generating the rest of the table:

        let item_index = 0;
        for (let item of this._data) {
            if ((this._filter != undefined) && (this._filter(item) == false)) continue;

            const line = document.createElement("div");
            line.classList.add("table-row");
            line.classList.add("line_" + item_index);

            ((table: List<Item>, item_index: number, line) => {
                line.onmouseenter = () => { table.hovered_item_index = item_index }
                line.onmouseleave = () => { table.hovered_item_index = undefined }
                line.onclick = () => {

                    table.selected_item_index = item_index
                    line.classList.add("selected")
                }
            })(this, item_index, line)

            let index = 0
            for (let col of this.columns) {
                let div = document.createElement("div");
                if (col.width_style) div.style.width = col.width_style;

                div.classList.add("column_" + index)

                if (col.custom_style != undefined) div.classList.add(... col.custom_style);

                if (is_number_column(col)) {
                    div.classList.add('right-centered-box')
                }

                if (is_string_column(col)) {
                    div.classList.add('centered-box')
                }

                if (is_icon_column(col)) {
                    div.style.backgroundImage = col.image_path(item)
                } else if (is_html_column(col)) {
                    div.appendChild(col.value(item))
                } else {
                    div.innerText = col.value(item).toString()
                }

                if (is_active_column(col)) {
                    div.classList.add("generic-button")
                    if (col.viable(item)) {
                        div.onclick = col.onclick(item)
                    } else {
                        div.classList.add("disabled")
                    }
                }

                line.appendChild(div)
                index++;
            }

            this.wrapper.appendChild(line)
            item_index++
        }
    }

    set sorted_column(data: number|undefined) {
        console.log("sort column " + data)
        if (data == undefined) {
            return
        }

        this._sorting_sequence = this._sorting_sequence.filter((value: sorting_setting) => value.column != data)
        this._sorting_sequence.push({
            column: data,
            order: 1
        })

        this._update_table()
    }

    get sorted_column(): number|undefined {
        const len = this._sorting_sequence.length
        if (len == 0) {
            return undefined
        }

        return this._sorting_sequence[len - 1].column
    }

    set sorting_order(data: sorting_order) {
        const len = this._sorting_sequence.length
        if (len == 0) {
            return
        }
        this._sorting_sequence[len - 1].order = data
        this._update_table()
    }

    get sorting_order(): sorting_order {
        const len = this._sorting_sequence.length
        if (len == 0) {
            return 1
        }

        return this._sorting_sequence[len - 1].order
    }

    set data(data: Item[]) {
        this._data = data
        this._update_table()
    }

    get data(): Item[] {
        return this._data
    }

    set columns(columns: Column<Item>[]) {
        this._columns = columns
        this._sorting_sequence = []
        for (let i = 0; i < columns.length; i++) {
            this._sorting_sequence.push(
                {
                    order: -1,
                    column: i
                }
            )
        }
        this._update_table()
    }

    get columns(): Column<Item>[] {
        return this._columns
    }

    get hovered_item_index() {
        return this._hovered_item_index
    }

    get selected_item_index() {
        return this._selected_item_index
    }

    set hovered_item_index(x: number|undefined) {
        this._hovered_item_index = x
    }

    set selected_item_index(x: number|undefined) {
        this._selected_item_index = x
    }

    get selected_item(): Item|undefined {
        const selected_index = this.selected_item_index
        if (selected_index == undefined) {
            return undefined
        }
        return this._data[selected_index]
    }

    set filter(f: ((item: Item) => boolean)|undefined) {
        this._filter = f
        this._update_table()
    }
}