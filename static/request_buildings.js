import { socket } from "./modules/globals.js";
{
    let div = document.getElementById('local_buildings');
    // for (let i = 1; i <= 4; i++) {
    // for (let i = 1)
    let button = document.createElement('button');
    button.onclick = build_building("shack" /* BuildingType.Shack */);
    button.innerHTML = 'build  ' + type_to_name("shack" /* BuildingType.Shack */);
    div?.appendChild(button);
    // }
    let close_button = document.createElement('button');
    close_button.innerHTML = 'close';
    close_button.id = 'close_buildings';
    div?.appendChild(close_button);
}
{
    let button = document.getElementById('request_buildings');
    button.onclick = request;
}
{
    let button = document.getElementById('close_buildings');
    button.onclick = () => close_buildings();
}
function close_buildings() {
    let big_div = document.getElementById('local_buildings');
    big_div.classList.add('hidden');
}
function request() {
    socket.emit('request-local-buildings');
}
function rent_room(id) {
    return function () {
        socket.emit('rent-room', { id: id });
    };
}
function repair_building(id) {
    return function () {
        socket.emit('repair-building', { id: id });
    };
}
function build_building(type) {
    return function () {
        socket.emit('build-building', type);
    };
}
function quality_to_name(n) {
    if (n < 30)
        return 'crumbling ' + '(' + n + ')';
    if (n < 60)
        return '' + '(' + n + ')';
    if (n < 90)
        return 'fine' + '(' + n + ')';
    return 'luxury' + '(' + n + ')';
}
function type_to_name(x) {
    // if (n == 1) return 'shack'
    // if (n == 2) return 'house'
    // if (n == 3) return 'mansion'
    // if (n == 4) return 'palace'
    return x;
}
function building_div(b) {
    let div = document.createElement('div');
    let quality_label = document.createElement('div');
    console.log(b.durability, b.type);
    console.log(quality_to_name(b.durability) + ' ' + type_to_name(b.type));
    quality_label.innerHTML = quality_to_name(b.durability) + ' ' + type_to_name(b.type);
    quality_label.classList.add('width-200');
    div.appendChild(quality_label);
    let rooms_label = document.createElement('div');
    rooms_label.innerHTML = b.rooms_occupied + '/' + b.rooms;
    rooms_label.classList.add('width-50');
    rooms_label.classList.add('align-center');
    div.appendChild(rooms_label);
    // if (b.is_inn) {
    let rest_button = document.createElement('button');
    rest_button.onclick = rent_room(b.id);
    rest_button.innerHTML = 'rest cost: ' + b.room_cost.toString();
    rest_button.classList.add('width-50');
    div.appendChild(rest_button);
    let repair_button = document.createElement('button');
    repair_button.onclick = repair_building(b.id);
    repair_button.innerHTML = 'repair';
    repair_button.classList.add('width-50');
    div.appendChild(repair_button);
    // }
    div.classList.add('border-white');
    div.classList.add('container-horizontal');
    return div;
}
function build_div(array) {
    let div = document.getElementById('buildings_list');
    div.innerHTML = '';
    array.forEach((value) => {
        div.appendChild(building_div(value));
    });
}
socket.on('buildings-info', (data) => {
    console.log(data);
    build_div(data);
    document.getElementById('local_buildings').classList.remove('hidden');
});
