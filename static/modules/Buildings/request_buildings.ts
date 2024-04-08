import { socket } from "../Socket/socket.js";
import { LandPlotType, LandPlotSocket } from "../../../shared/buildings.js"

export function init_buildings() {
    {
        let div = document.getElementById('local_buildings')

        // for (let i = 1; i <= 4; i++) {

        // for (let i = 1)
        // let button = document.createElement('button')
        // button.onclick = build_building(LandPlotType.Shack)
        // button.innerHTML = 'build  ' + type_to_name(LandPlotType.Shack)
        // div?.appendChild(button)

        // }

        let close_button = document.getElementById('buildings-close-button')!;
        close_button.onclick = () => close_buildings();
        // close_button.innerHTML = 'close'
        // close_button.id = 'close_buildings'

        // let new_plot = document.createElement('button')
        // new_plot.innerHTML = 'New plot'
        // new_plot.id = 'new_plot'

        // div?.appendChild(new_plot)
        // div?.appendChild(close_button)
    }

    {
        document.getElementById('request_buildings')!.onclick = request;
        document.getElementById('claim-land-plot')!.onclick = create_plot;
        // document.getElementById('change-price-room')!.onclick
        // document.getElementById('build-shack')
    }

    socket.on('buildings-info', (data: LandPlotSocket[]) => {
        console.log(data)
        build_div(data)
        document.getElementById('local_buildings')!.classList.remove('hidden');
        document.getElementById('backdrop')!.classList.remove('hidden');
    })
}

function create_plot() {
    socket.emit('create-plot');
    request()
}

function close_buildings() {
    let big_div = document.getElementById('local_buildings')!;
    big_div.classList.add('hidden');
    document.getElementById('backdrop')!.classList.add('hidden');
}

function request() {
    socket.emit('request-local-buildings')
}

function rent_room(id: number) {
    return function() {
        socket.emit('rent-room', {id: id})
        request()
    }
}

function change_price(id: number) {
    return function() {
        const price = parseInt((document.getElementById('building-rent-price-input')! as HTMLInputElement).value)
        if (price == undefined) return
        console.log('change-rent-price', {id: id, price: price})
        socket.emit('change-rent-price', {id: id, price: price})
        request()
    }
}

function repair_building(id: number) {
    return function() {
        socket.emit('repair-building', {id: id})
        request()
    }
}

function build_house(id: number) {
    return function() {
        socket.emit('build-building', {id: id, type: LandPlotType.HumanHouse})
        request()
    }
}
function build_inn(id: number) {
    return function() {
        socket.emit('build-building', {id: id, type: LandPlotType.Inn})
        request()
    }
}
function build_shack(id: number) {
    return function() {
        socket.emit('build-building', {id: id, type: LandPlotType.Shack})
        request()
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
        const owner_div = document.getElementById('building-owner')!;
        owner_div.innerHTML = 'Owner: ' + b.owner_name + `(${b.owner_id})`;

        document.getElementById('building-guests')!.innerHTML = 'Guests: ' + b.guests.join(', ');

        document.getElementById('rent-building-room')!.onclick = rent_room(b.id);
        document.getElementById('rent-building-price')!.innerHTML = 'Rent price (for you): ' + b.room_cost.toString();
        document.getElementById('rent-building-price-true')!.innerHTML = 'Rent price: ' + b.room_cost_true.toString();
        document.getElementById('repair-building')!.onclick = repair_building(b.id);
        document.getElementById('building-description')!.innerHTML = b.type;
        document.getElementById('building-rooms')!.innerHTML = 'Rooms: ' + b.rooms_occupied + '/' + b.rooms;
        document.getElementById('building-durability')!.innerHTML = 'Durability: ' + b.durability;
        document.getElementById('change-price-room')!.onclick = change_price(b.id);

        if (b.type == LandPlotType.LandPlot) {
            document.getElementById('build-shack')!.classList.remove('hidden')
            document.getElementById('build-house')!.classList.remove('hidden')
            document.getElementById('build-inn')!.classList.remove('hidden')

            document.getElementById('build-shack')!.onclick = build_shack(b.id);
            document.getElementById('build-house')!.onclick = build_house(b.id);
            document.getElementById('build-inn')!.onclick = build_inn(b.id);
        } else {
            document.getElementById('build-shack')!.classList.add('hidden')
            document.getElementById('build-house')!.classList.add('hidden')
            document.getElementById('build-inn')!.classList.add('hidden')
        }
    }
}

function building_div(b: LandPlotSocket) {
    let building_slot = document.createElement('div')
    building_slot.classList.add('active')
    if (b.type == LandPlotType.HumanHouse) {
        building_slot.style.backgroundImage = 'url("/static/img/buildings/house.png")'
    } else if (b.type == LandPlotType.Inn) {
        building_slot.style.backgroundImage = 'url("/static/img/buildings/house.png")'
    } else if (b.type == LandPlotType.ForestPlot) {
        building_slot.style.backgroundImage = 'url("/static/img/buildings/forest.png")'
    } else {
        building_slot.innerHTML = type_to_name(b.type)
    }
    building_slot.onclick = display_building_data(b)

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

    building_slot.classList.add('border-white')
    return building_slot
}


function building_button(callback: (id: number) => (() => void), id: number, inner_html: string) {
    let button = document.createElement('button')
    button.onclick = callback(id)
    button.innerHTML = inner_html
    button.classList.add('width-50')
    return button
}

function build_div(array: LandPlotSocket[]) {
    let div = document.getElementById('buildings-list')!
    div.innerHTML = ''
    array.forEach((value) => {
        div.appendChild(building_div(value))
    })
}



