export interface raw_header_tab {
    element: string,
    connected_element: string,
}

export interface header_tab {
    element: HTMLElement,
    connected_element: HTMLElement
}

function raw_header_to_header(input: raw_header_tab) : header_tab {
    return {
        element: document.getElementById(input.element) as HTMLElement,
        connected_element: document.getElementById(input.connected_element) as HTMLElement
    }
}

function hide_function(item: header_tab) {
    return () => {
        item.element.classList.remove('selected')
        item.connected_element.classList.add('hidden')
    }
}

function show_function(item: header_tab) {
    return () => {
        item.element.classList.add('selected')
        item.connected_element.classList.remove('hidden')
    }
}

function select_function(item: header_tab, group: header_tab[]) {
    return () => {
        for (let h of group) {
            hide_function(h)()
        }

        show_function(item)()
    }
}

export function set_up_header_tab_choice(data: header_tab[]) {
    for (let item of data) {
        item.element.onclick = select_function(item, data)
    }

    select_function(data[0], data)()
}

export function set_up_header_with_strings(data: raw_header_tab[]) {
    set_up_header_tab_choice(data.map(raw_header_to_header))
}