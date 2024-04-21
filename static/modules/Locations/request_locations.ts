import { socket } from "../Socket/socket.js";
import { Column, List } from "../../widgets/List/list.js";
import { elementById, selectHTMLs } from "../HTMLwrappers/common.js";
import { LocationView } from "@custom_types/responses.js";
import { globals } from "../globals.js";
import { image_url } from "../BackgroundImage/background_image.js";

const columns_mini : Column<LocationView>[] = [
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
            return "Enter"
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
            if (globals.character_data?.location_id.value == item.id) return "X"
            return ""
        },
        custom_style: ["flex-0-0-30px"]
    }
]

const columns : Column<LocationView>[] = [
    {
        header_text: "id",
        type: "number",
        value: item => item.id,
        custom_style: ["flex-1-0-5"]
    },
    {
        header_text: "Select",
        type: "string",
        value(item) {
            return "Select"
        },

        onclick: (item) => display_location_data(item)
        ,
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
        custom_style: ["flex-1-0-5"]
    },

    {
        header_text: "Pop.",
        type: "number",
        value: (item) => item.guests,
        custom_style: ["flex-0-0-50px"]
    },

    {
        header_text: "Your location",
        type: "string",
        value: (item) => {
            if (globals.character_data?.location_id.value == item.id) return "X"
            return ""
        },
        custom_style: ["flex-1-0-5"]
    }
]

const lists : List<LocationView>[] = []

export function init_locations() {
    const locations_list = new List<LocationView>(elementById("location-list"));
    locations_list.columns = columns;
    elementById('claim-location-button').onclick = create_plot;

    for (const container of selectHTMLs('.locations-display-mini')) {
        lists.push(new_mini_location_list(container))
    }

    socket.on('locations-info', (data: LocationView[]) => {
        locations_list.data = data

        for (const item of lists) {
            item.data = data
        }
    })

    return locations_list
}

export function new_mini_location_list(container : HTMLElement) {
    const locations_list = new List<LocationView>(container);
    locations_list.columns = columns_mini;
    return locations_list
}


function create_plot() {
    socket.emit('create-plot');
}

// function close_locations() {
//     let big_div = elementById('local_locations');
//     big_div.classList.add('hidden');
//     elementById('backdrop').classList.add('hidden');
// }

function enter_location(id: number) {
    return function() {
        socket.emit('enter-location', id)
    }
}

function repair_location(id: number) {
    return function() {
        socket.emit('repair-location', {id: id})
    }
}

function display_location_data(b: LocationView) {
    return () => {
        let image_container = elementById("selected-location-image")

        image_container.style.backgroundImage = image_url(b.terrain, b.forest, b.house_level, b.urbanisation)

        elementById("enter-location-button").onclick = enter_location(b.id)


        const owner_div = elementById('location-owner');
        owner_div.innerHTML = 'Owner: ' + b.owner_name + `(${b.owner_id})`;

        elementById('location-guests').innerHTML = 'Local population: ' + b.guests;
        elementById('rent-location-price').innerHTML = 'Rent price (for you): ' + b.room_cost.toString();
        elementById('repair-location').onclick = repair_location(b.id);
        elementById('location-durability').innerHTML = 'Durability: ' + b.durability;
        // elementById('change-price-room').onclick = change_price(b.id);
    }
}
