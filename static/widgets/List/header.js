import { div } from "../Div/custom_div.js";
import { sort_callback_number_reverse_order, sort_callback_string_reverse_order } from "./list.js";
export function generate_header(list, fields) {
    const header_divs = fields.map(field => {
        let classes = [field.field];
        if (field.sortable) {
            classes.push('active');
        }
        let onclick = () => {
        };
        if (field.type == 'text') {
            onclick = sort_callback_string_reverse_order(list, field.field);
        }
        if (field.type == 'number') {
            onclick = sort_callback_number_reverse_order(list, field.field);
        }
        return div(undefined, field.name, classes, undefined, onclick, []);
    });
    return div(undefined, '', ['list_header'], undefined, undefined, header_divs);
}
