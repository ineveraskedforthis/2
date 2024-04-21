/* eslint-disable no-redeclare */
/*global images, battle_image*/
import { get_pos_in_canvas } from '../common.js';
import { globals, is_action_repeatable, local_actions } from '../globals.js';
import { socket } from "../Socket/socket.js";
import { select } from '../HTMLwrappers/common.js';
import { ImageStorage } from './ImageStorage/image_storage.js';
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
        map.last_time_down = globals.now;
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
            let tmp = globals.now;
            if ((map.last_time_down == undefined) || (tmp - map.last_time_down < 150)) {
                map.select_hex(selected_hex);
                map.move_flag = true;
                send_move_action(map, 'move');
            }
        }
        else {
            let tmp = globals.now;
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
function load_image(tag) {
    return [tag, ImageStorage.load_image(`static/img/tiles/${tag}.png`)];
}
let tag_to_tile = Object.fromEntries(tile_tags.map(load_image));
function tile(tag) {
    return tag_to_tile[tag];
}
export class Map {
    constructor(canvas, container) {
        this.last_time_down = 0;
        this.canvas = canvas;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        this.context = this.canvas.getContext('2d');
        this.buffer = new OffscreenCanvas(canvas.width, canvas.height);
        this.buffer_context = this.buffer.getContext('2d');
        this.container = container;
        this.hex_side = 23;
        this.camera = [50, 600];
        this.hex_shift = [-100, -680];
        this.selected = [0, 0];
        this.curr_pos = [0, 0];
        this.move_flag = false; // does player follow some path currently?
        this.movement_progress = 0;
        this.hex_h = this.hex_side * Math.sqrt(3) / 2;
        this.hex_w = this.hex_side / 2;
        this.terrain = [];
        this.forest = [];
        this.urban = [];
        this.rat_lairs = [];
        this.path = {};
        this.real_path = [];
        this.path_progress = 0;
    }
    update_canvas_size() {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
        this.buffer.width = this.container.clientWidth;
        this.buffer.height = this.container.clientHeight;
    }
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
    draw() {
        const ctx = this.buffer_context;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (var i = -2; i < 30; i++) {
            for (var j = 0; j < 30; j++) {
                this.draw_hex(ctx, [i, j]);
                this.draw_hex_features(ctx, [i, j]);
            }
        }
        this.draw_fill(ctx, this.curr_pos, '(0, 0, 255, 0.6)');
        if (this.selected) {
            this.draw_fill(ctx, this.selected, '(255, 255, 0, 0.6)');
        }
        if (this.hovered) {
            this.draw_fill(ctx, this.hovered, '(0, 255, 0, 0.6)');
        }
        this.draw_player_circle(ctx);
        this.draw_selected_circle(ctx);
        ctx.fillStyle = "#000000";
        ctx.font = 'bold 20px sans-serif';
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
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.drawImage(this.buffer, 0, 0);
    }
    get_hex_centre([i, j]) {
        var h = this.hex_side * Math.sqrt(3) / 2;
        var w = this.hex_side / 2;
        var tx = (this.hex_side + w) * i - this.camera[0] - this.hex_shift[0];
        var ty = 2 * h * j - h * i - this.camera[1] - this.hex_shift[1];
        return [tx, ty];
    }
    draw_player_circle(ctx) {
        let c = this.get_hex_centre(this.curr_pos);
        if (this.move_flag) {
            if (this.move_target != undefined) {
                let b = this.get_hex_centre(this.move_target);
                ctx.strokeStyle = 'rgba' + '(200, 200, 0, 1)';
                this.draw_pentagon(ctx, c[0] * (1 - this.movement_progress) + b[0] * this.movement_progress, c[1] * (1 - this.movement_progress) + b[1] * this.movement_progress, '(200, 200, 0, 1)', 10);
            }
        }
        else {
            this.draw_pentagon(ctx, c[0], c[1], '(200, 200, 0, 1)', 10);
        }
    }
    draw_selected_circle(ctx) {
        let c = this.get_hex_centre(this.selected);
        this.draw_pentagon(ctx, c[0], c[1], '(0, 100, 100, 1)', 20);
    }
    draw_pentagon(ctx, x, y, color, r) {
        ctx.strokeStyle = 'rgba' + color;
        let epsilon = 6 * Math.PI / 5;
        let start = globals.now / 1000;
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
    draw_stroke(ctx, [i, j], color) {
        var h = this.hex_h;
        var w = this.hex_w;
        var [center_x, center_y] = this.hex_center_camera_adjusted([i, j]);
        ctx.fillStyle = 'rgba' + color;
        ctx.beginPath();
        ctx.moveTo(center_x + this.hex_side, center_y);
        ctx.lineTo(center_x + w, center_y - h);
        ctx.lineTo(center_x - w, center_y - h);
        ctx.lineTo(center_x - this.hex_side, center_y);
        ctx.lineTo(center_x - w, center_y + h);
        ctx.lineTo(center_x + w, center_y + h);
        ctx.lineTo(center_x + this.hex_side, center_y);
        ctx.stroke();
    }
    draw_fill(ctx, [i, j], color) {
        var h = this.hex_h;
        var w = this.hex_w;
        var [center_x, center_y] = this.hex_center_camera_adjusted([i, j]);
        ctx.fillStyle = 'rgba' + color;
        ctx.beginPath();
        ctx.moveTo(center_x + this.hex_side, center_y);
        ctx.lineTo(center_x + w, center_y - h);
        ctx.lineTo(center_x - w, center_y - h);
        ctx.lineTo(center_x - this.hex_side, center_y);
        ctx.lineTo(center_x - w, center_y + h);
        ctx.lineTo(center_x + w, center_y + h);
        ctx.fill();
    }
    draw_hex(ctx, [i, j]) {
        var [center_x, center_y] = this.hex_center_camera_adjusted([i, j]);
        if (this.terrain[i] == undefined || this.terrain[i][j] == undefined) {
            return;
        }
        const target_x = center_x - this.hex_side;
        const target_y = center_y - this.hex_h;
        if (this.terrain[i][j] == 'sea') {
            ImageStorage.draw_image(ctx, tile('sea'), target_x, target_y);
        }
        else if (this.terrain[i][j] == 'city') {
            ImageStorage.draw_image(ctx, tile('city_colour'), target_x, target_y);
        }
        else if (this.terrain[i][j] == 'steppe') {
            ImageStorage.draw_image(ctx, tile('red_steppe'), target_x, target_y);
        }
        else if (this.terrain[i][j] == 'coast') {
            ImageStorage.draw_image(ctx, tile('coast'), target_x, target_y);
        }
        else if (this.terrain[i][j] == 'rupture') {
            ImageStorage.draw_image(ctx, tile('rupture'), target_x, target_y);
        }
        else {
            return;
        }
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
        const target_x = center_x - this.hex_side;
        const target_y = center_y - h;
        if (rats) {
            ImageStorage.draw_image(ctx, tile('rats'), target_x, target_y);
        }
        // ctx.fillText(forestation, center_x - this.hex_side, center_y - h);
        for (let iteration = 0; iteration < forestation / 100; iteration++) {
            const noise_x = Math.cos(iteration + i + j) * 10;
            const noise_y = Math.cos(iteration * 10 + i * 5 + j * 3) * 10;
            ImageStorage.draw_image(ctx, tile('forest_1'), target_x + noise_x, target_y + noise_y);
        }
        if ((urbanisation >= 8)) {
            ImageStorage.draw_image(ctx, tile('new_urban_3'), target_x, target_y);
        }
        else if ((urbanisation >= 4)) {
            ImageStorage.draw_image(ctx, tile('new_urban_2'), target_x, target_y);
        }
        else if ((urbanisation >= 1)) {
            ImageStorage.draw_image(ctx, tile('new_urban_1'), target_x, target_y);
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
        let local_description = document.getElementById('local_description');
        local_description.innerHTML = '<img src="static/img/starting_tiles_image_downsized.png" width="300">';
        this.path = this.create_path();
        this.real_path = [];
        this.path_progress = 0;
        let cur = this.selected;
        while ((cur != undefined)) {
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
        if ((tmp0 == i) && (tmp1 == j)) {
            return;
        }
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
}
function send_local_cell_action(action) {
    console.log(action);
    if (action == undefined)
        return;
    socket.emit(action);
    globals.last_action = action;
}
function set_local_actions(actions) {
    const containers = select('.actions-display');
    for (const container of containers) {
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
                ((button, action_tag, global_blob) => button.onclick = () => {
                    console.log(global_blob);
                    if (global_blob.keep_doing == action_tag) {
                        global_blob.keep_doing = undefined;
                        button.classList.remove("highlighted");
                    }
                    else {
                        for (const other_button of select(".repeat_button")) {
                            other_button.classList.remove("highlighted");
                        }
                        button.classList.add("highlighted");
                        global_blob.keep_doing = action_tag;
                    }
                })(repeat_button, action_tag, globals);
                desktop_button.appendChild(repeat_button);
            }
            ((button, action_tag) => button.onclick = () => send_local_cell_action(action_tag))(desktop_button, action_tag);
            container.appendChild(desktop_button);
        }
    }
}
export function draw_map_related_stuff(maps, delta) {
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
                for (const map of maps)
                    send_local_cell_action(globals.keep_doing);
            }
            //do the movement again if you are not at destination already
            for (const map of maps)
                if (map.move_flag) {
                    send_move_action(map, 'continue_move');
                }
            // map.move_flag = false
        }
        else {
            let bar = div.querySelector('span');
            bar.style.width = Math.min(Math.floor(globals.action_time / globals.action_total_time * 10000) / 100, 100) + '%';
            for (const map of maps) {
                if (map.move_flag) {
                    map.movement_progress = globals.action_ratio;
                }
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
    for (const map of maps) {
        if (map.container.offsetParent !== null) {
            map.draw();
        }
    }
}
function restart_action_bar(maps, time, is_move) {
    // console.log('???')
    globals.action_total_time = time;
    globals.action_in_progress = true;
    globals.action_time = 0;
    let div = document.getElementById('action_progress_bar');
    div.classList.remove('hidden');
    let bar = div.querySelector('span');
    bar.style.width = '0%';
    if (is_move) {
        for (const map of maps) {
            map.move_flag = true;
            map.movement_progress = 0;
        }
        globals.action_total_time += 0.1;
        globals.action_total_time *= 1.1;
    }
}
export function init_map() {
    const maps = [];
    console.log('loading canvases');
    for (const map_canvas of select(".map-canvas")) {
        console.log("canvas found");
        const map = new Map(map_canvas, map_canvas.parentElement);
        maps.push(map);
        init_map_control(map);
    }
    set_local_actions(local_actions);
    socket.on('map-pos', msg => {
        console.log('map-pos');
        for (const map of maps) {
            map.set_curr_pos([msg.x, msg.y], msg.teleport_flag);
        }
    });
    socket.on('map-data-display', data => {
        for (const map of maps) {
            map.load_terrain(data);
        }
    });
    socket.on('map-data-reset', data => {
        for (const map of maps) {
            map.reset();
        }
    });
    socket.on('action-ping', data => restart_action_bar(maps, data.time, data.is_move));
    return maps;
}
