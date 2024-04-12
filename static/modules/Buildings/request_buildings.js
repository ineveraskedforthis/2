import { socket } from "../Socket/socket.js";
import { List } from "../../widgets/List/list.js";
import { elementById } from "../HTMLwrappers/common.js";
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
    }
];
const locations_list = new List(elementById("location-list"));
locations_list.columns = columns;
export function init_locations() {
    elementById('claim-location-button').onclick = create_plot;
    socket.on('locations-info', (data) => {
        locations_list.data = data;
    });
}
function create_plot() {
    socket.emit('create-plot');
}
// function close_locations() {
//     let big_div = elementById('local_locations');
//     big_div.classList.add('hidden');
//     elementById('backdrop').classList.add('hidden');
// }
function rent_room(id) {
    return function () {
        socket.emit('rent-room', { id: id });
    };
}
// function change_price(id: number) {
//     return function() {
//         const price = parseInt((elementById('location-rent-price-input') as HTMLInputElement).value)
//         if (price == undefined) return
//         console.log('change-rent-price', {id: id, price: price})
//         socket.emit('change-rent-price', {id: id, price: price})
//     }
// }
function repair_location(id) {
    return function () {
        socket.emit('repair-location', { id: id });
    };
}
// function build_location(type: LandPlotType) {
//     return function() {
//         socket.emit('build-location', type)
//     }
// }
// function quality_to_name(n: number) {
//     if (n < 30) return 'crumbling ' + '(' + n + ')'
//     if (n < 60) return '' + '(' + n + ')'
//     if (n < 90) return 'fine' + '(' + n + ')'
//     return 'sturdy' + '(' + n + ')'
// }
function display_location_data(b) {
    return () => {
        let image_container = elementById("selected-location-image");
        if (b.house_level > 0) {
            image_container.style.backgroundImage = 'url("/static/img/locations/house.png")';
        }
        else if (b.forest > 10) {
            image_container.style.backgroundImage = 'url("/static/img/locations/forest.png")';
        }
        else {
            image_container.style.backgroundImage = 'url("/static/img/bg_red_steppe.png")';
        }
        elementById("enter-location-button").onclick = rent_room(b.id);
        const owner_div = elementById('location-owner');
        owner_div.innerHTML = 'Owner: ' + b.owner_name + `(${b.owner_id})`;
        elementById('location-guests').innerHTML = 'Local population: ' + b.guests;
        elementById('rent-location-room').onclick = rent_room(b.id);
        elementById('rent-location-price').innerHTML = 'Rent price (for you): ' + b.room_cost.toString();
        elementById('repair-location').onclick = repair_location(b.id);
        elementById('location-durability').innerHTML = 'Durability: ' + b.durability;
        // elementById('change-price-room').onclick = change_price(b.id);
    };
}
function location_div(b) {
    //location_slot.onclick = display_location_data(b)
    // location_slot.classList.add('width-50')
    // location_slot.classList.add('height-50')
    // div.appendChild(location_slot)
    // let rooms_label = document.createElement('div')
    // rooms_label.innerHTML = b.rooms_occupied + '/' + b.rooms
    // rooms_label.classList.add('width-50')
    // rooms_label.classList.add('align-center')
    // div.appendChild(rooms_label)
    // div.appendChild(location_button(rent_room, b.id, 'rest cost: ' + b.room_cost.toString()))
    // div.appendChild(location_button(repair_location, b.id, 'repair'))
    // if (b.type == LandPlotType.LandPlot) {
    //     div.appendChild(location_button(build_house, b.id, 'build house'))
    //     div.appendChild(location_button(build_inn, b.id, 'build inn'))
    //     div.appendChild(location_button(build_shack, b.id, 'build shack'))
    // }
    //location_slot.classList.add('border-white')
    //return location_slot
}
function location_button(callback, id, inner_html) {
    let button = document.createElement('button');
    button.onclick = callback(id);
    button.innerHTML = inner_html;
    button.classList.add('width-50');
    return button;
}
