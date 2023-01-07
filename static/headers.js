function raw_header_to_header(input) {
    return {
        element: document.getElementById(input.element),
        connected_element: document.getElementById(input.connected_element)
    };
}
function hide_function(item) {
    return () => {
        item.element.classList.remove('selected');
        item.connected_element.classList.add('hidden');
    };
}
function show_function(item) {
    return () => {
        item.element.classList.add('selected');
        item.connected_element.classList.remove('hidden');
    };
}
function select_function(item, group) {
    return () => {
        for (let h of group) {
            hide_function(h)();
        }
        show_function(item)();
    };
}
export function set_up_header_tab_choice(data) {
    for (let item of data) {
        item.element.onclick = select_function(item, data);
    }
    select_function(data[0], data)();
}
export function set_up_header_with_strings(data) {
    set_up_header_tab_choice(data.map(raw_header_to_header));
}
