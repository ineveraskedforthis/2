import { socket } from "../Socket/socket.js";
import { List } from "../../widgets/List/list.js";
import { elementById } from "../HTMLwrappers/common.js";
import { globals } from "../globals.js";
import { image_url } from "../BackgroundImage/background_image.js";
const columns = [
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
        header_text: "Enter price",
        type: "number",
        value: (item) => item.room_cost,
        custom_style: ["flex-1-0-5"]
    },
    {
        header_text: "Owner",
        type: "string",
        value: (item) => item.owner_name,
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
    }
];
export function init_locations() {
    const locations_list = new List(elementById("location-list"));
    locations_list.columns = columns;
    elementById('claim-location-button').onclick = create_plot;
    socket.on('locations-info', (data) => {
        locations_list.data = data;
    });
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
function repair_location(id) {
    return function () {
        socket.emit('repair-location', { id: id });
    };
}
function display_location_data(b) {
    return () => {
        let image_container = elementById("selected-location-image");
        image_container.style.backgroundImage = image_url(b.terrain, b.forest, b.house_level, b.urbanisation);
        elementById("enter-location-button").onclick = enter_location(b.id);
        const owner_div = elementById('location-owner');
        owner_div.innerHTML = 'Owner: ' + b.owner_name + `(${b.owner_id})`;
        elementById('location-guests').innerHTML = 'Local population: ' + b.guests;
        elementById('rent-location-price').innerHTML = 'Rent price (for you): ' + b.room_cost.toString();
        elementById('repair-location').onclick = repair_location(b.id);
        elementById('location-durability').innerHTML = 'Durability: ' + b.durability;
        // elementById('change-price-room').onclick = change_price(b.id);
    };
}
