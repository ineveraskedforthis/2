import { socket } from "../Socket/socket.js";
import { LandPlotType, LandPlotSocket } from "../../../shared/buildings.js"
import { Column, List } from "../../widgets/List/list.js";
import { elementById } from "../HTMLwrappers/common.js";

const columns : Column<LandPlotSocket>[] = [
    {
        header_text: "Type",
        type: "string",
        value(item) {
            return item.type
        },
        custom_style: ["flex-1-0-5"]
    },
    {
        header_text: "Select",
        type: "string",
        value(item) {
            return "Select"
        },

        onclick: (item) => display_building_data(item)
        ,
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
]

const locations_list = new List<LandPlotSocket>(elementById("location-list"));
locations_list.columns = columns;

export function init_buildings() {
    elementById('claim-location-button').onclick = create_plot;

    socket.on('buildings-info', (data: LandPlotSocket[]) => {
        locations_list.data = data
    })
}


function create_plot() {
    socket.emit('create-plot');
}

function close_buildings() {
    let big_div = elementById('local_buildings');
    big_div.classList.add('hidden');
    elementById('backdrop').classList.add('hidden');
}

function rent_room(id: number) {
    return function() {
        socket.emit('rent-room', {id: id})
    }
}

function change_price(id: number) {
    return function() {
        const price = parseInt((elementById('building-rent-price-input') as HTMLInputElement).value)
        if (price == undefined) return
        console.log('change-rent-price', {id: id, price: price})
        socket.emit('change-rent-price', {id: id, price: price})
    }
}

function repair_building(id: number) {
    return function() {
        socket.emit('repair-building', {id: id})
    }
}

function build_house(id: number) {
    return function() {
        socket.emit('build-building', {id: id, type: LandPlotType.HumanHouse})
    }
}
function build_inn(id: number) {
    return function() {
        socket.emit('build-building', {id: id, type: LandPlotType.Inn})
    }
}
function build_shack(id: number) {
    return function() {
        socket.emit('build-building', {id: id, type: LandPlotType.Shack})
    }
}

// function build_building(type: LandPlotType) {
//     return function() {
//         socket.emit('build-building', type)
//     }
// }

function quality_to_name(n: number) {
    if (n < 30) return 'crumbling ' + '(' + n + ')'
    if (n < 60) return '' + '(' + n + ')'
    if (n < 90) return 'fine' + '(' + n + ')'
    return 'sturdy' + '(' + n + ')'
}

function type_to_name(x: LandPlotType) {
    // if (n == 1) return 'shack'
    // if (n == 2) return 'house'
    // if (n == 3) return 'mansion'
    // if (n == 4) return 'palace'
    return x
}

function display_building_data(b: LandPlotSocket) {
    return () => {


        let image_container = elementById("selected-location-image")

        if (b.type == LandPlotType.HumanHouse) {
            image_container.style.backgroundImage = 'url("/static/img/buildings/house.png")'
        } else if (b.type == LandPlotType.Inn) {
            image_container.style.backgroundImage = 'url("/static/img/buildings/house.png")'
        } else if (b.type == LandPlotType.ForestPlot) {
            image_container.style.backgroundImage = 'url("/static/img/buildings/forest.png")'
        } else {
            image_container.innerHTML = type_to_name(b.type)
        }

        elementById("enter-location-button").onclick = rent_room(b.id)


        const owner_div = elementById('building-owner');
        owner_div.innerHTML = 'Owner: ' + b.owner_name + `(${b.owner_id})`;

        elementById('building-guests').innerHTML = 'Guests: ' + b.guests.join(', ');

        elementById('rent-building-room').onclick = rent_room(b.id);
        elementById('rent-building-price').innerHTML = 'Rent price (for you): ' + b.room_cost.toString();
        elementById('rent-building-price-true').innerHTML = 'Rent price: ' + b.room_cost_true.toString();
        elementById('repair-building').onclick = repair_building(b.id);
        elementById('building-description').innerHTML = b.type;
        elementById('building-rooms').innerHTML = 'Rooms: ' + b.rooms_occupied + '/' + b.rooms;
        elementById('building-durability').innerHTML = 'Durability: ' + b.durability;
        elementById('change-price-room').onclick = change_price(b.id);

        if (b.type == LandPlotType.LandPlot) {
            elementById('build-shack').classList.remove('hidden')
            elementById('build-house').classList.remove('hidden')
            elementById('build-inn').classList.remove('hidden')

            elementById('build-shack').onclick = build_shack(b.id);
            elementById('build-house').onclick = build_house(b.id);
            elementById('build-inn').onclick = build_inn(b.id);
        } else {
            elementById('build-shack').classList.add('hidden')
            elementById('build-house').classList.add('hidden')
            elementById('build-inn').classList.add('hidden')
        }
    }
}

function building_div(b: LandPlotSocket) {

    //building_slot.onclick = display_building_data(b)

    // building_slot.classList.add('width-50')
    // building_slot.classList.add('height-50')
    // div.appendChild(building_slot)


    // let rooms_label = document.createElement('div')
    // rooms_label.innerHTML = b.rooms_occupied + '/' + b.rooms
    // rooms_label.classList.add('width-50')
    // rooms_label.classList.add('align-center')
    // div.appendChild(rooms_label)

    // div.appendChild(building_button(rent_room, b.id, 'rest cost: ' + b.room_cost.toString()))
    // div.appendChild(building_button(repair_building, b.id, 'repair'))
    // if (b.type == LandPlotType.LandPlot) {
    //     div.appendChild(building_button(build_house, b.id, 'build house'))
    //     div.appendChild(building_button(build_inn, b.id, 'build inn'))
    //     div.appendChild(building_button(build_shack, b.id, 'build shack'))
    // }

    //building_slot.classList.add('border-white')
    //return building_slot
}


function building_button(callback: (id: number) => (() => void), id: number, inner_html: string) {
    let button = document.createElement('button')
    button.onclick = callback(id)
    button.innerHTML = inner_html
    button.classList.add('width-50')
    return button
}