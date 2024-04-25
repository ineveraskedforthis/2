import { socket } from "../Socket/socket.js";
import { List } from "../../widgets/List/list.js";
import { elementById, select, selectHTMLs } from "../HTMLwrappers/common.js";
import { globals } from "../globals.js";
import { image_url } from "../BackgroundImage/background_image.js";
const columns_mini = [
    {
        header_text: "Id:",
        type: "number",
        value: item => item.id,
        custom_style: ["flex-0-0-80px"]
    },
    {
        header_text: "Enter",
        type: "string",
        value(item) {
            return "Enter";
        },
        onclick: (item) => enter_location(item.id),
        viable: (item) => true,
        custom_style: ["flex-1-0-5"]
    },
    {
        header_text: "Pop.",
        type: "number",
        value: (item) => item.guests,
        custom_style: ["flex-0-0-50px"]
    },
    {
        header_text: "",
        type: "string",
        value: (item) => {
            if (globals.character_data?.location_id.value == item.id)
                return "X";
            return "";
        },
        custom_style: ["flex-0-0-30px"]
    }
];
const columns = [
    {
        header_text: "id",
        type: "number",
        value: item => item.id,
        custom_style: ["flex-1-0-5"]
    },
    {
        header_text: "Your location",
        type: "string",
        value: (item) => {
            if (globals.character_data?.location_id.value == item.id)
                return "X";
            return "";
        },
        custom_style: ["flex-1-0-5"]
    },
    {
        header_text: "Pop.",
        type: "number",
        value: (item) => item.guests,
        custom_style: ["flex-0-0-50px"]
    },
    {
        header_text: "Enter",
        type: "string",
        value(item) {
            return "Enter";
        },
        onclick: (item) => enter_location(item.id),
        viable: (item) => true,
        custom_style: ["flex-1-0-5"]
    },
    {
        header_text: "Select",
        type: "string",
        value(item) {
            return "Select";
        },
        onclick: (item) => display_location_data(item),
        viable: (item) => true,
        custom_style: ["flex-1-0-5"]
    },
    {
        header_text: "Rest price",
        type: "number",
        value: (item) => item.room_cost,
        custom_style: ["flex-1-0-5"]
    },
    {
        header_text: "Owner",
        type: "string",
        value: (item) => item.owner_name,
        custom_style: ["flex-3"]
    },
];
const lists = [];
export function init_locations() {
    const locations_list = new List(elementById("location-list"));
    locations_list.columns = columns;
    locations_list.sorted_column = 0;
    locations_list.per_line_class_by_item = (item) => {
        let result = ['list-item-location-' + item.id];
        return result;
    };
    elementById('claim-location-button').onclick = create_plot;
    for (const container of selectHTMLs('.locations-display-mini')) {
        lists.push(new_mini_location_list(container));
    }
    socket.on('locations-info', (data) => {
        locations_list.data = data;
        for (const item of lists) {
            item.data = data;
        }
    });
    return [locations_list, ...lists];
}
export function new_mini_location_list(container) {
    const locations_list = new List(container);
    locations_list.columns = columns_mini;
    locations_list.sorted_column = 0;
    return locations_list;
}
function create_plot() {
    socket.emit('create-plot');
}
// function close_locations() {
//     let big_div = elementById('local_locations');
//     big_div.classList.add('hidden');
//     elementById('backdrop').classList.add('hidden');
// }
function enter_location(id) {
    return function () {
        socket.emit('enter-location', id);
    };
}
function build_house(id) {
    return function () {
        socket.emit('build', id);
    };
}
function repair_location(id) {
    return function () {
        socket.emit('repair-location', { id: id });
    };
}
function select_location(id) {
    if (globals.selected_location != undefined) {
        let character_div = select('.list-item-location-' + globals.selected_location);
        for (const item of character_div) {
            item.classList.remove('selected');
        }
    }
    globals.selected_location = id;
    let character_div = select('.list-item-location-' + id);
    for (const item of character_div) {
        item.classList.add('selected');
    }
}
function display_location_data(b) {
    return () => {
        select_location(b.id);
        let image_container = elementById("selected-location-image");
        image_container.style.backgroundImage = image_url(b.terrain, b.forest, b.house_level, b.urbanisation);
        elementById("enter-location-button").onclick = enter_location(b.id);
        elementById("build-house-button").onclick = build_house(b.id);
        const owner_div = elementById('location-owner');
        owner_div.innerHTML = 'Owner: ' + b.owner_name + `(${b.owner_id})`;
        elementById('location-guests').innerHTML = 'Local population: ' + b.guests;
        elementById('rent-location-price').innerHTML = 'Rent price (for you): ' + b.room_cost.toString();
        elementById('repair-location').onclick = repair_location(b.id);
        elementById('location-durability').innerHTML = 'Durability: ' + b.durability;
        // elementById('change-price-room').onclick = change_price(b.id);
    };
}
