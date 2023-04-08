import { socket } from "./modules/globals.js";

{
    let div = document.getElementById('local_buildings')
    for (let i = 1; i <= 4; i++) {
        let button = document.createElement('button')
        button.onclick = build_building(i)
        button.innerHTML = 'build  ' + tier_to_name(i)
        div?.appendChild(button)
    }
}

{
    let button = document.getElementById('request_buildings')!;
    button.onclick = request;
}

{
    let button = document.getElementById('close_buildings')!;
    button.onclick = () => close_buildings();
}

function close_buildings() {
    let big_div = document.getElementById('local_buildings')!;
    big_div.classList.add('hidden');
}


interface Building {
    id: number
    durability: number,
    tier: number,
    rooms: number,
    rooms_occupied: number,
    is_inn: boolean,
    room_cost: number
}

function request() {
    socket.emit('request-local-buildings')
}

function rent_room(id: number) {
    return function() {
        socket.emit('rent-room', {id: id})
    }
}

function build_building(tier: number) {
    return function() {
        socket.emit('build-building', tier)
    }
}

function quality_to_name(n: number) {
    if (n < 30) return 'crumbling'
    if (n < 60) return ''
    if (n < 90) return 'fine'
    return 'luxury'
}

function tier_to_name(n: number) {
    if (n == 1) return 'shack'
    if (n == 2) return 'house'
    if (n == 3) return 'mansion'
    if (n == 4) return 'palace'
}

function building_div(b: Building) {
    let div = document.createElement('div')
    let quality_label = document.createElement('div')
    console.log(b.durability, b.tier)
    console.log(quality_to_name(b.durability) + ' ' + tier_to_name(b.tier))
    quality_label.innerHTML = quality_to_name(b.durability) + ' ' + tier_to_name(b.tier)   
    quality_label.classList.add('width-200')
    div.appendChild(quality_label)
    

    let rooms_label = document.createElement('div')
    rooms_label.innerHTML = b.rooms_occupied + '/' + b.rooms
    rooms_label.classList.add('width-50')
    rooms_label.classList.add('align-center')
    div.appendChild(rooms_label)

    if (b.is_inn) {
        let rest_button = document.createElement('button')
        rest_button.onclick = rent_room(b.id)
        rest_button.innerHTML = 'rest cost: ' + b.room_cost.toString()
        rest_button.classList.add('width-50')
        div.appendChild(rest_button)        
    }

    div.classList.add('border-white')
    div.classList.add('container-horizontal')

    return div    
}

function build_div(array: Building[]) {
    let div = document.getElementById('buildings_list')!
    div.innerHTML = ''
    array.forEach((value) => {
        div.appendChild(building_div(value))
    })
    
}

socket.on('buildings-info', (data: Building[]) => {
    console.log(data)
    build_div(data)
    document.getElementById('local_buildings')!.classList.remove('hidden');
})


