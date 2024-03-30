export function new_list(container) {
    return {
        container: container,
        sorted_field: undefined,
        sorted_order: 'asc',
    };
}
export function sort_number(list) {
    console.log(list.sorted_field);
    if (list.sorted_field == undefined)
        return;
    const unsorted = [...list.container.children];
    const undefined_value = list.sorted_order == 'asc' ? '9999999999999' : '-1';
    const sorted = unsorted.sort((a, b) => {
        if (a.classList.contains('hidden'))
            return 1;
        if (b.classList.contains('hidden'))
            return -1;
        let value_a = a.querySelector(`.${list.sorted_field}`).innerHTML;
        let value_b = b.querySelector(`.${list.sorted_field}`).innerHTML;
        if (value_a == '')
            value_a = undefined_value;
        if (value_b == '')
            value_b = undefined_value;
        return (parseInt(value_a) - parseInt(value_b)) * (list.sorted_order == 'asc' ? 1 : -1);
    });
    list.container.replaceChildren(...sorted);
}
export function sort_string(list) {
    if (list.sorted_field == undefined)
        return;
    const unsorted = [...list.container.children];
    const sorted = unsorted.sort((a, b) => {
        if (a.classList.contains('hidden'))
            return 1;
        if (b.classList.contains('hidden'))
            return -1;
        const value_a = a.querySelector(`.${list.sorted_field}`).innerHTML;
        const value_b = b.querySelector(`.${list.sorted_field}`).innerHTML;
        return value_a.localeCompare(value_b) * (list.sorted_order == 'asc' ? 1 : -1);
    });
    list.container.replaceChildren(...sorted);
}
export function sort_callback_number_reverse_order(list, field) {
    return () => {
        list.sorted_field = field;
        list.sorted_order = list.sorted_order == 'asc' ? 'desc' : 'asc';
        sort_number(list);
    };
}
export function sort_callback_number_keep_order(list, field) {
    return () => {
        list.sorted_field = field;
        sort_number(list);
    };
}
export function sort_callback_string_reverse_order(list, field) {
    return () => {
        console.log("sort " + field);
        list.sorted_field = field;
        list.sorted_order = list.sorted_order == 'asc' ? 'desc' : 'asc';
        sort_string(list);
    };
}
export function sort_callback_string_keep_order(list, field) {
    return () => {
        list.sorted_field = field;
        sort_string(list);
    };
}
