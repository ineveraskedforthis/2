/* eslint-disable no-redeclare */
/*global images, battle_image*/
import { get_pos_in_canvas } from './common.js';
import { globals, is_action_repeatable, local_actions } from './globals.js';
import { socket } from "./Socket/socket.js";
function st(a) {
    return a[0] + ' ' + a[1];
}
function coord_to_x_y(a) {
    return { x: a[0], y: a[1] };
}
const directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1]];
function check_move([a, b]) {
    for (let i of directions) {
        if ((i[0] == a) && (i[1] == b)) {
            return true;
        }
    }
    return false;
}
function position_diff(a, b) {
    return [a[0] - b[0], a[1] - b[1]];
}
const BACKGROUNDS = {
    'colony': 'colony',
    'rat_plains': 'red_steppe',
    'graci_plains': 'red_steppe',
    'sea': 'red_steppe',
    'forest': 'forest',
    'unknown': 'red_steppe'
};
export function init_map_control(map) {
    console.log('map control');
    map.canvas.onmousedown = event => {
        event.preventDefault();
        globals.pressed = true;
        globals.prev_mouse_x = null;
        globals.prev_mouse_y = null;
        globals.map_zoom = 1;
        map.last_time_down = Date.now();
    };
    map.canvas.onmousemove = event => {
        if (globals.pressed) {
            if ((globals.prev_mouse_x != null) && (globals.prev_mouse_y != null)) {
                var dx = event.pageX - globals.prev_mouse_x;
                var dy = event.pageY - globals.prev_mouse_y;
                map.move([dx, dy]);
            }
            globals.prev_mouse_x = event.pageX;
            globals.prev_mouse_y = event.pageY;
        }
        var mouse_pos = get_pos_in_canvas(map.canvas, event);
        var hovered_hex = map.get_hex([mouse_pos.x, mouse_pos.y]);
        if (hovered_hex != undefined) {
            map.hover_hex(hovered_hex);
        }
    };
    map.canvas.onmouseup = event => {
        event.preventDefault();
        // let mouse_pos = {x: event.screenX, y: event.screenY}
        let mouse_pos = get_pos_in_canvas(map.canvas, event);
        let selected_hex = map.get_hex([mouse_pos.x, mouse_pos.y]);
        if (selected_hex == undefined)
            return;
        if (event.button == 2) {
            let tmp = Date.now();
            if ((map.last_time_down == undefined) || (tmp - map.last_time_down < 150)) {
                map.select_hex(selected_hex);
                map.move_flag = true;
                send_move_action(map, 'move');
            }
        }
        else {
            let tmp = Date.now();
            if ((map.last_time_down == undefined) || (tmp - map.last_time_down < 150)) {
                map.select_hex(selected_hex);
                let context = document.getElementById('map_context');
                context.style.top = event.clientY + 5 + 'px';
                context.style.left = event.clientX + 5 + 'px';
                context.classList.remove('hidden');
                globals.map_context_dissapear_time = 1;
            }
        }
        globals.pressed = false;
    };
    map.canvas.onmouseout = event => {
        globals.pressed = false;
    };
    let context = document.getElementById('map_context');
    context.onmouseenter = (() => { globals.mouse_over_map_context = true; globals.map_context_dissapear_time = 1; });
    context.onmouseleave = (() => globals.mouse_over_map_context = false);
}
const tile_tags = [
    'red_steppe',
    'house',
    'urban_1',
    'urban_3',
    'city',
    'sea',
    'coast',
    'forest_1',
    'forest_2',
    'forest_3',
    'rupture',
    'rural',
    'rats',
    'elodinos',
    'new_urban_1',
    'new_urban_2',
    'new_urban_3',
    'city_colour'
];
let tiles = [];
function load_image(tag) {
    const image = new Image;
    image.src = `static/img/tiles/${tag}.png`;
    const index = tiles.push(image) - 1;
    return [tag, index];
}
let tag_to_index = Object.fromEntries(tile_tags.map(load_image));
function tile(tag) {
    return tiles[tag_to_index[tag]];
}
export class Map {
    constructor(canvas, container) {
        this.time = 0;
        this.last_time_down = 0;
        this.canvas = canvas;
        canvas.width = container.clientWidth - 2;
        canvas.height = container.clientHeight - 2;
        this.container = container;
        this.hex_side = 23;
        this.camera = [50, 600];
        this.hex_shift = [-100, -680];
        // this.hovered = null;
        this.selected = [0, 0];
        this.curr_pos = [0, 0];
        // this.curr_territory = undefined;
        // this.curr_section = undefined;
        // this.sections = undefined;
        this.move_flag = false; // does player follow some path currently?
        this.movement_progress = 0;
        this.hex_h = this.hex_side * Math.sqrt(3) / 2;
        this.hex_w = this.hex_side / 2;
        this.terrain = [];
        this.forest = [];
        this.urban = [];
        this.rat_lairs = [];
        // this.visit_spotted = []
        // this.description = document.createElement('div');
        // this.container.appendChild(this.description);
        this.path = {};
        this.real_path = [];
        this.path_progress = 0;
    }
    // update_probability(data) {
    //     let text= Math.floor(data.value * 100) + '%'
    //     // let chance_label_map = document.getElementById(data.tag + '_chance')
    //     // chance_label_map.innerHTML = text
    //     let chance_label_desktop = document.getElementById(data.tag + '_chance_desktop')
    //     chance_label_desktop.innerHTML = text
    // }
    // mark_visited(data) {
    //     this.visit_spotted = data
    //     // console.log(this.visit_spotted)
    // }
    load_terrain(data) {
        if (this.terrain[data.x] == undefined) {
            this.terrain[data.x] = [];
            this.forest[data.x] = [];
            this.urban[data.x] = [];
            this.rat_lairs[data.x] = [];
        }
        this.terrain[data.x][data.y] = data.ter.terrain;
        this.forest[data.x][data.y] = data.ter.forestation;
        this.urban[data.x][data.y] = data.ter.urbanisation;
        this.rat_lairs[data.x][data.y] = data.ter.rat_lair;
    }
    reset() {
        this.terrain = [];
    }
    // toogle_territory(tag) {
    //     this.fog_of_war[tag] = !this.fog_of_war[tag];
    // }
    // explore(data) {
    //     // console.log('explore')
    //     // console.log(data)
    //     for (let i in data) {
    //         if (terr_id[i] in this.fog_of_war) {
    //             // console.log(terr_id[i])
    //             this.fog_of_war[terr_id[i]] = !data[i]
    //         }
    //     }
    // }
    draw(dt) {
        this.time += dt;
        var ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, 2000, 2000);
        // ctx.drawImage(images['map'], 0 - this.camera[0], 0 - this.camera[1], 2000, 2000)
        // for (i in this.fog_of_war) {
        //     if (this.fog_of_war[i]) {
        //         ctx.drawImage(images['fog_' + i], 0 - this.camera[0], 0 - this.camera[1], 2000, 2000)
        //     }
        // }
        for (var i = -2; i < 30; i++) {
            for (var j = 0; j < 30; j++) {
                const position = [i, j];
                if (this.hovered != null && this.hovered[0] == i && this.hovered[1] == j) {
                    this.draw_hex(ctx, position, 'fill', '(0, 255, 0, 0.6)', 0);
                }
                else if (this.curr_pos[0] == i && this.curr_pos[1] == j) {
                    this.draw_hex(ctx, position, 'fill', '(0, 0, 255, 0.6)', 0);
                    // this.draw_hex(i, j, 'circle', '(0, 255, 0, 1)');
                }
                else if (this.selected != null && this.selected[0] == i && this.selected[1] == j) {
                    this.draw_hex(ctx, position, 'fill', '(255, 255, 0, 0.6)', 0);
                }
                else {
                    // if ((get_territory_tag(i, j) == this.curr_territory) & (this.curr_territory != undefined) & (this.sections != undefined)) {
                    //     let color = this.get_section_color(this.get_section(i, j))
                    //     if (color != undefined) {
                    //         this.draw_hex(i, j, 'fill', color);
                    //     }
                    // }
                    this.draw_hex(ctx, position, 'fill', '(0, 0, 0, 0)', 0);
                }
            }
        }
        for (var i = -2; i < 30; i++) {
            for (var j = 0; j < 30; j++) {
                this.draw_hex_features(ctx, [i, j]);
            }
        }
        this.draw_player_circle(ctx);
        this.draw_selected_circle(ctx);
        ctx.fillStyle = "#000000";
        ctx.font = 'bold 20px sans-serif';
        // for (let i in this.visit_spotted) {
        //     let centre = this.get_hex_centre(this.visit_spotted[i].x, this.visit_spotted[i].y)
        //     ctx.fillText(`??`, centre[0] - 10, centre[1]);
        // }
        if (this.selected != undefined) {
            ctx.strokeStyle = 'rgb(0, 255, 0)';
            let cur = this.selected;
            while (cur != undefined) {
                let tmp = st(cur);
                const previous = this.path[tmp];
                if ((tmp in this.path) && (previous != undefined)) {
                    let t = this.get_hex_centre(cur);
                    ctx.beginPath();
                    ctx.moveTo(t[0], t[1]);
                    let tmp_cen = this.get_hex_centre(previous);
                    ctx.lineTo(tmp_cen[0], tmp_cen[1]);
                    ctx.stroke();
                }
                cur = this.path[tmp];
            }
        }
    }
    // get_section(x, y) {
    //     let tmp = x + '_' + y;
    //     for (let i in this.sections.hexes) {
    //         if (this.sections.hexes[i].indexOf(tmp) > -1) {
    //             return i
    //         }
    //     }
    //     return 'unknown'
    // }
    // get_section_color(tag) {
    //     if (tag in this.sections.colors) {
    //         let color = this.sections.colors[tag];
    //         return '(' + color[0] + ', ' + color[1] + ', ' + color[2] + `, 0.3)`
    //     }
    //     return undefined;
    // }
    get_hex_centre([i, j]) {
        var h = this.hex_side * Math.sqrt(3) / 2;
        var w = this.hex_side / 2;
        var tx = (this.hex_side + w) * i - this.camera[0] - this.hex_shift[0];
        var ty = 2 * h * j - h * i - this.camera[1] - this.hex_shift[1];
        return [tx, ty];
    }
    draw_player_circle(ctx) {
        if (this.move_flag) {
            let c = this.get_hex_centre(this.curr_pos);
            if (this.move_target != undefined) {
                let b = this.get_hex_centre(this.move_target);
                ctx.strokeStyle = 'rgba' + '(200, 200, 0, 1)';
                this.draw_pentagon(ctx, c[0] * (1 - this.movement_progress) + b[0] * this.movement_progress, c[1] * (1 - this.movement_progress) + b[1] * this.movement_progress, 10);
            }
        }
        else {
            this.draw_hex(ctx, this.curr_pos, 'pentagon', '(200, 200, 0, 1)', 10);
        }
    }
    draw_selected_circle(ctx) {
        this.draw_hex(ctx, this.selected, 'pentagon', '(0, 100, 100, 1)', 20);
    }
    draw_pentagon(ctx, x, y, r) {
        let epsilon = 6 * Math.PI / 5;
        // let xi = 2 * Math.PI / 5
        let start = this.time;
        // let shift = globals.action_ratio
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(start) * r, y + Math.sin(start) * r);
        for (let i = 0; i < 6; i++) {
            let dx = Math.cos(start) * r;
            let dy = Math.sin(start) * r;
            ctx.lineTo(x + dx, y + dy);
            start = start + epsilon;
            // if (shift != undefined) {
            //     start = start + xi * shift
            // }
        }
        ctx.stroke();
    }
    draw_hex(ctx, [i, j], mode, color, r) {
        var h = this.hex_h;
        var w = this.hex_w;
        var [center_x, center_y] = this.hex_center_camera_adjusted([i, j]);
        if (mode == 'pentagon') {
            ctx.strokeStyle = 'rgba' + color;
            this.draw_pentagon(ctx, center_x, center_y, r);
            return;
        }
        if (mode == 'circle') {
            ctx.strokeStyle = 'rgba' + color;
            ctx.beginPath();
            ctx.arc(center_x, center_y, 5, 0, Math.PI * 2, true);
            ctx.stroke();
            return;
        }
        if (this.terrain[i] == undefined || this.terrain[i][j] == undefined) {
            return;
        }
        // draw terrain
        if (this.terrain[i][j] == 'sea') {
            ctx.drawImage(tile('sea'), center_x - this.hex_side, center_y - h);
        }
        else if (this.terrain[i][j] == 'city') {
            ctx.drawImage(tile('city_colour'), center_x - this.hex_side, center_y - h);
        }
        else if (this.terrain[i][j] == 'steppe') {
            ctx.drawImage(tile('red_steppe'), center_x - this.hex_side, center_y - h);
        }
        else if (this.terrain[i][j] == 'coast') {
            ctx.drawImage(tile('coast'), center_x - this.hex_side, center_y - h);
        }
        else if (this.terrain[i][j] == 'rupture') {
            ctx.drawImage(tile('rupture'), center_x - this.hex_side, center_y - h);
        }
        else {
            // no terrain, abort immediately
            return;
        }
        ctx.fillStyle = 'rgba' + color;
        ctx.beginPath();
        ctx.moveTo(center_x + this.hex_side, center_y);
        ctx.lineTo(center_x + w, center_y - h);
        ctx.lineTo(center_x - w, center_y - h);
        ctx.lineTo(center_x - this.hex_side, center_y);
        ctx.lineTo(center_x - w, center_y + h);
        ctx.lineTo(center_x + w, center_y + h);
        if (mode == 'fill') {
            ctx.fill();
        }
        else if (mode == 'stroke') {
            ctx.lineTo(center_x + this.hex_side, center_y);
            ctx.stroke();
        }
        // ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        // ctx.font = '10px Times New Roman';
        // ctx.fillText(`${i} ${j}`, center_x - w, center_y + h / 2);
    }
    hex_center([i, j]) {
        var h = this.hex_h;
        var w = this.hex_w;
        var center_x = (this.hex_side + w) * i;
        var center_y = 2 * h * j - h * i;
        return [center_x, center_y];
    }
    hex_center_camera_adjusted([i, j]) {
        // console.log(i, j)
        var [center_x, center_y] = this.hex_center([i, j]);
        return [center_x - this.camera[0] - this.hex_shift[0], center_y - this.camera[1] - this.hex_shift[1]];
    }
    draw_hex_features(ctx, [i, j]) {
        var h = this.hex_h;
        var w = this.hex_w;
        var [center_x, center_y] = this.hex_center_camera_adjusted([i, j]);
        // (this.hex_side + w) * i - this.camera[0] - this.hex_shift[0];
        // var center_y = 2 * h * j - h * i - this.camera[1] - this.hex_shift[1];
        // draw features
        if (this.urban[i] == undefined)
            return;
        if (this.urban[i][j] == undefined)
            return;
        if (this.terrain[i][j] == 'rupture')
            return;
        let forestation = this.forest[i][j];
        let urbanisation = this.urban[i][j];
        let rats = this.rat_lairs[i][j];
        ctx.strokeStyle = 'black';
        if (rats) {
            ctx.drawImage(tile('rats'), center_x - this.hex_side, center_y - h);
        }
        // ctx.fillText(forestation, center_x - this.hex_side, center_y - h);
        for (let iteration = 0; iteration < forestation / 100; iteration++) {
            const noise_x = Math.cos(iteration + i + j) * 10;
            const noise_y = Math.cos(iteration * 10 + i * 5 + j * 3) * 10;
            ctx.drawImage(tile('forest_1'), center_x - this.hex_side + noise_x, center_y - h + noise_y);
        }
        if ((urbanisation >= 8)) {
            ctx.drawImage(tile('city_colour'), center_x - this.hex_side, center_y - h);
            ctx.drawImage(tile('city_colour'), center_x - this.hex_side, center_y - h);
            ctx.drawImage(tile('city_colour'), center_x - this.hex_side, center_y - h);
            ctx.drawImage(tile('new_urban_3'), center_x - this.hex_side, center_y - h);
        }
        else if ((urbanisation >= 4)) {
            ctx.drawImage(tile('city_colour'), center_x - this.hex_side, center_y - h);
            ctx.drawImage(tile('city_colour'), center_x - this.hex_side, center_y - h);
            ctx.drawImage(tile('new_urban_2'), center_x - this.hex_side, center_y - h);
        }
        else if ((urbanisation >= 1)) {
            ctx.drawImage(tile('city_colour'), center_x - this.hex_side, center_y - h);
            ctx.drawImage(tile('new_urban_1'), center_x - this.hex_side, center_y - h);
        }
    }
    move([dx, dy]) {
        this.camera[0] -= dx;
        this.camera[1] -= dy;
    }
    get_hex([x, y]) {
        x = x + this.camera[0] + this.hex_shift[0];
        y = y + this.camera[1] + this.hex_shift[1];
        var h = this.hex_side * Math.sqrt(3) / 2;
        var a_vector = [Math.sqrt(3) / 2, -1 / 2];
        var c_vector = [Math.sqrt(3) / 2, 1 / 2];
        var a = Math.floor((x * a_vector[0] + y * a_vector[1]) / h);
        var b = Math.floor(y / h);
        var c = Math.floor((x * c_vector[0] + y * c_vector[1]) / h);
        var alpha = [[0, 0, 0], [0, -1, 0], [0, -1, -1], [-1, -1, -1], [-1, 0, -1], [-1, 0, 0]];
        for (var i = 0; i < 6; i++) {
            var y_mult_3 = b + c - alpha[i][1] - alpha[i][2];
            if (y_mult_3 % 3 == 0) {
                var y = Math.floor(y_mult_3 / 3);
                var x = c - y - alpha[i][2];
                if (a == 2 * x - y + alpha[i][0]) {
                    return [x, y];
                }
            }
        }
    }
    hover_hex([i, j]) {
        this.hovered = [i, j];
    }
    select_hex([i, j]) {
        this.selected = [i, j];
        // let tag = get_territory_tag([i, j]);
        // if (this.fog_of_war[tag] == true) {
        //     tag = 'unknown'
        // }
        // let section_tag = this.get_section(i, j)
        // this.description.innerHTML = i + ' ' + j + ' ' + DESCRIPTIONS[tag] + '<br>' + section_descriptions[section_tag];
        let local_description = document.getElementById('local_description');
        local_description.innerHTML = '<img src="static/img/starting_tiles_image_downsized.png" width="300">';
        this.path = this.create_path();
        this.real_path = [];
        this.path_progress = 0;
        let cur = this.selected;
        // console.log(this.path)
        // console.log(cur)
        while ((cur != undefined)) {
            // console.log(cur)
            let tmp = st(cur);
            this.real_path.push(cur);
            cur = this.path[tmp];
        }
        this.real_path = this.real_path.reverse();
    }
    get_terrain([i, j]) {
        if (this.terrain[i] == undefined)
            return undefined;
        return this.terrain[i][j];
    }
    create_path() {
        let queue = [this.curr_pos];
        let prev = {};
        prev[st(this.curr_pos)] = undefined;
        let used = {};
        let right = 1;
        let next = 0;
        while ((next != -1) && (right < 400)) {
            let curr = queue[next];
            used[st(curr)] = true;
            for (let d of directions) {
                let tmp = [curr[0] + d[0], curr[1] + d[1]];
                let terrain = this.get_terrain(tmp);
                if (terrain != 'sea' && terrain != undefined && terrain != 'rupture') {
                    let tmp_string = st(tmp);
                    if (!used[tmp_string]) {
                        queue[right] = tmp;
                        prev[tmp_string] = curr;
                        right++;
                        if ((tmp[0] == this.selected[0]) && (tmp[1] == this.selected[1])) {
                            return prev;
                        }
                    }
                }
            }
            let heur_score = 9999;
            next = -1;
            for (let i = 0; i < right; i++) {
                let tmp = this.dist(queue[i], this.selected);
                if ((tmp < heur_score) && (!used[st(queue[i])])) {
                    next = i;
                    heur_score = tmp;
                }
            }
        }
        return prev;
    }
    dist(a, b) {
        let v1 = this.get_hex_centre(a);
        let v2 = this.get_hex_centre(b);
        return ((v1[0] - v2[0]) * (v1[0] - v2[0]) + (v1[1] - v2[1]) * (v1[1] - v2[1])) / 10000;
    }
    get_bg_tag([i, j]) {
        if ((this.terrain[i] != undefined) && (this.terrain[i][j] == 'coast')) {
            if ((this.urban[i] != undefined) && (this.urban[i][j] >= 1)) {
                return 'coast_rural';
            }
            return 'coast';
        }
        if (this.forest[i] != undefined) {
            if (this.urban[i][j] >= 4) {
                return 'colony';
            }
            if (this.urban[i][j] >= 1) {
                return 'urban_1';
            }
            if (this.forest[i][j] >= 200) {
                return 'forest';
            }
        }
        return 'red_steppe';
    }
    set_curr_pos([i, j], teleport_flag) {
        console.log('new position');
        console.log(i, j);
        let tmp0 = this.curr_pos[0];
        let tmp1 = this.curr_pos[1];
        this.curr_pos = [i, j];
        // this.curr_territory = get_territory_tag(i, j);
        console.log('move flag');
        console.log(this.real_path[this.real_path.length - 1]);
        console.log(this.curr_pos);
        console.log(this.move_flag);
        if (this.move_flag) {
            if ((this.real_path[this.real_path.length - 1][0] == this.curr_pos[0]) && (this.real_path[this.real_path.length - 1][1] == this.curr_pos[1])) {
                this.move_flag = false;
            }
        }
        else {
            let temp = this.hex_center([i, j]);
            this.camera[0] = temp[0] - 200;
            this.camera[1] = temp[1] + 400;
        }
        console.log(this.move_flag);
        socket.emit('request-local-locations');
        return this.get_bg_tag([i, j]);
    }
}
const map = new Map(document.getElementById('map_canvas'), document.getElementById('map_column'));
init_map_control(map);
socket.on('map-pos', msg => {
    console.log('map-pos');
    let location = map.set_curr_pos([msg.x, msg.y], msg.teleport_flag);
    console.log(location);
    change_bg(location);
});
socket.on('enter-room', msg => {
    console.log('enter-room');
    change_bg('house_inside');
});
socket.on('leave-room', msg => {
    console.log('leave-room');
    update_background();
});
function change_bg(tag) {
    let div = document.getElementById('actual_game_scene');
    div.style.backgroundImage = "url(/static/img/bg_" + tag + ".png)";
}
function update_background() {
    let location = map.get_bg_tag(map.curr_pos);
    change_bg(location);
}
// socket.on('explore', msg => {map.explore(msg)});
socket.on('map-data-display', data => { map.load_terrain(data); update_background(); });
socket.on('map-data-reset', data => { map.reset(); update_background(); });
socket.on('action-ping', data => restart_action_bar(data.time, data.is_move));
// socket.on('cell-visited', data => map.mark_visited(data))
// socket.on('map-action-status', data => update_action_status(data))
// socket.on('cell-action-chance', msg => map.update_probability(msg))
// function update_action_status(data) {
//     console.log(data)
//     let button1 = document.getElementById(data.tag + '_button')
//     let button2 = document.getElementById(data.tag + '_button_desktop')
//     if (!data.value) {
//         // button1.classList.add('unavailable')
//         button2.classList.add('unavailable')
//     } else {
//         // button1.classList.remove('unavailable')
//         button2.classList.remove('unavailable')
//     }
// }
function send_move_action(map, action) {
    console.log(action);
    let selected = map.selected;
    let curr_pos = map.curr_pos;
    if (action == 'move') {
        if (selected == undefined)
            return;
        let adj_flag = check_move(position_diff(selected, curr_pos));
        if (adj_flag) {
            map.move_target = selected;
            map.move_flag = true;
            socket.emit('move', coord_to_x_y(selected));
        }
        else {
            map.move_flag = true;
            const next_cell = map.real_path[map.path_progress + 1];
            map.move_target = next_cell;
            socket.emit('move', coord_to_x_y(next_cell));
        }
    }
    else if (action == 'continue_move') {
        map.path_progress += 1;
        const next_cell = map.real_path[map.path_progress + 1];
        map.move_target = next_cell;
        if (next_cell == undefined)
            return;
        socket.emit('move', coord_to_x_y(next_cell));
    }
    // else if ((map.real_path.length > 1) && ((map.move_flag == true) || (map.movement_progress > 0.99))) {
    //     map.move_flag = true
    //     map.path_progress = 1
    //     map.path = map.create_path()
    //     const next_cell = map.real_path[map.path_progress + 1]
    //     map.move_target = next_cell
    //     socket.emit('move', coord_to_x_y(next_cell))
    // }
}
function send_local_cell_action(map, action) {
    console.log(action);
    if (action == undefined)
        return;
    socket.emit(action, { x: map.curr_pos[0], y: map.curr_pos[1] });
    globals.last_action = action;
}
function send_last_action() {
    send_local_cell_action(map, globals.last_action);
}
function set_local_actions(actions, map) {
    let desktop_container = document.getElementById('desktop_actions');
    for (let action_tag of actions) {
        // let map_button = document.getElementById(action_tag + '_button');
        // ((button, map_manager, action_tag) =>
        //         button.onclick = () => map_manager.send_cell_action(action_tag)
        // )(map_button, this, action_tag);
        let desktop_button = document.createElement('div');
        desktop_button.id = action_tag + '_button_desktop';
        desktop_button.classList.add('desktop_action_button');
        {
            let label = document.createElement('div');
            label.innerHTML = action_tag;
            label.classList.add('label_button');
            desktop_button.appendChild(label);
        }
        {
            let chance_label = document.createElement('div');
            chance_label.innerHTML = '100%';
            chance_label.id = action_tag + '_chance_desktop';
            chance_label.classList.add('probability');
            desktop_button.appendChild(chance_label);
        }
        if (is_action_repeatable(action_tag)) {
            let repeat_button = document.createElement('div');
            repeat_button.innerHTML = '&#8635;';
            repeat_button.classList.add('repeat_button');
            ((button, map_manager, action_tag, global_blob) => button.onclick = () => {
                console.log(global_blob);
                if (global_blob.keep_doing == action_tag) {
                    global_blob.keep_doing = undefined;
                }
                else {
                    global_blob.keep_doing = action_tag;
                    send_local_cell_action(map_manager, action_tag);
                }
            })(repeat_button, map, action_tag, globals);
            desktop_button.appendChild(repeat_button);
        }
        ((button, map_manager, action_tag) => button.onclick = () => send_local_cell_action(map_manager, action_tag))(desktop_button, map, action_tag);
        desktop_container.appendChild(desktop_button);
    }
}
set_local_actions(local_actions, map);
export function draw_map_related_stuff(delta) {
    if (globals.action_in_progress) {
        globals.action_time += delta;
        globals.action_ratio = globals.action_time / globals.action_total_time;
        let div = document.getElementById('action_progress_bar');
        if (globals.action_total_time * 1.2 <= globals.action_time) {
            // if current action_time >= total_time * 1.2
            // so if action had ended with a little overshoot
            // then stop action
            globals.action_in_progress = false;
            div.classList.add('hidden');
            //check repeat action flags
            console.log('keep doing?');
            console.log(globals.keep_doing);
            if (globals.keep_doing != undefined) {
                send_local_cell_action(map, globals.keep_doing);
            }
            //do the movement again if you are not at destination already
            if (map.move_flag) {
                send_move_action(map, 'continue_move');
            }
            // map.move_flag = false
        }
        else {
            let bar = div.querySelector('span');
            bar.style.width = Math.min(Math.floor(globals.action_time / globals.action_total_time * 10000) / 100, 100) + '%';
            if (map.move_flag) {
                map.movement_progress = globals.action_ratio;
            }
        }
    }
    if (globals.map_context_dissapear_time != undefined) {
        if ((globals.map_context_dissapear_time > 0) && (!globals.mouse_over_map_context)) {
            globals.map_context_dissapear_time = Math.max(0, globals.map_context_dissapear_time - delta);
            if (globals.map_context_dissapear_time == 0) {
                document.getElementById('map_context').classList.add('hidden');
            }
        }
    }
    if (document.getElementById('actual_game_scene').style.visibility == 'visible') {
        if (!document.getElementById('map_tab').classList.contains('hidden')) {
            map.draw(delta);
        }
    }
}
function restart_action_bar(time, is_move) {
    // console.log('???')
    globals.action_total_time = time;
    globals.action_in_progress = true;
    globals.action_time = 0;
    let div = document.getElementById('action_progress_bar');
    div.classList.remove('hidden');
    let bar = div.querySelector('span');
    bar.style.width = '0%';
    if (is_move) {
        map.move_flag = true;
        map.movement_progress = 0;
        globals.action_total_time += 0.1;
        globals.action_total_time *= 1.1;
    }
}
