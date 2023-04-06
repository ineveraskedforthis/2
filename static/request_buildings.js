import { socket } from "./modules/globals.js";
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
function quality_to_name(n) {
    if (n < 30)
        return 'shack';
    if (n < 60)
        return 'okay building';
    if (n < 90)
        return 'nice building';
    return 'luxury building';
}
function building_div(b) {
    let div = document.createElement('div');
    let quality_label = document.createElement('div');
    quality_label.innerHTML = quality_to_name(b.durability);
    div.appendChild(quality_label);
    if (b.is_inn) {
        let rest_button = document.createElement('button');
        rest_button.onclick = rent_room(b.id);
        rest_button.innerHTML = 'rest cost: ' + b.room_cost.toString();
        div.appendChild(rest_button);
    }
    div.classList.add('border-white');
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
