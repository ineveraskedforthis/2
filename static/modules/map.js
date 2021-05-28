/* eslint-disable no-redeclare */
/*global images, battle_image*/

import {get_pos_in_canvas} from './common.js';
import {location_descriptions, section_descriptions} from './localisation.js';

function st(a) {
    return a[0] + ' ' + a[1]
}

const directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1]]

const territories = {
        'colony':     ['0_3', '0_4',
                       '1_2', '1_3', '1_4', '1_5', '1_6', 
                       '2_2', '2_3', '2_4', '2_5', '2_6', '2_7', 
                       '3_2', '3_3', '3_4', '3_5', '3_6', '3_7', '3_8'],

        'sea':        ['0_0', '0_1', '0_2', 
                       '1_0', '1_1', '2_0', '2_1', 
                       '3_0', '3_1'],

        'rat_plains': ['4_2', '4_3', '4_4', '4_5', '4_6', '4_7', '4_8',
                       '5_3', '5_4', '5_5', '5_6', '5_7', '5_8', '5_9',
                       '6_3', '6_4', '6_5', '6_6', '6_7', '6_8', '6_9', '6_10',
                       '7_3', '7_4', '7_5', '7_6', '7_7', '7_8', '7_9', '7_10']
    }

const terr_id = {
    0: 'sea',
    1: 'colony',
    2: 'rat_plains'
}

function get_territory_tag(x, y) {
    let tmp = x + '_' + y;
    for (let i in territories) {
        if (territories[i].indexOf(tmp) > -1) {
            return i
        }
    } 
    return 'unknown'
}

const LOCAL_IMAGES = {
    'colony':     'colony.png',
    'sea':        'starting_tiles_image_downsized.png',
    'rat_plains': 'starting_tiles_image_downsized.png',
    'unknown':    'starting_tiles_image_downsized.png',
}


const DESCRIPTIONS = location_descriptions;

const BACKGROUNDS = {
    'colony': 'colony',
    'rat_plains': 'red_steppe',
    'graci_plains': 'red_steppe',
    'sea': 'red_steppe',
    'forest_boundary': 'forest',
    'unknown': 'red_steppe'
}

export function init_map_control(map, globals) {
    console.log('map control')
    map.canvas.onmousedown = event => {
        event.preventDefault();
        globals.pressed = true;
        globals.prev_mouse_x = null;
        globals.prev_mouse_y = null;

        map.last_time_down = Date.now() 

        // let mouse_pos = get_pos_in_canvas(map.canvas, event);    
        // let selected_hex = map.get_hex(mouse_pos.x, mouse_pos.y);
        // map.select_hex(selected_hex[0], selected_hex[1]);
        
    }

    map.canvas.onmousemove = event => {
        if (globals.pressed)
        {
            if (globals.prev_mouse_x != null) {
                var dx = event.pageX - globals.prev_mouse_x;
                var dy = event.pageY - globals.prev_mouse_y;
                map.move(dx, dy);
            }
            globals.prev_mouse_x = event.pageX;
            globals.prev_mouse_y = event.pageY;
        }

        var mouse_pos = get_pos_in_canvas(map.canvas, event);
        var hovered_hex = map.get_hex(mouse_pos.x, mouse_pos.y);
        map.hover_hex(hovered_hex[0], hovered_hex[1]);
    };

    map.canvas.onmouseup = event => {
        event.preventDefault()
        let mouse_pos = get_pos_in_canvas(map.canvas, event);
        let selected_hex = map.get_hex(mouse_pos.x, mouse_pos.y);
        if (event.button == 2) {
            let tmp = Date.now()
            if ((map.last_time_down == undefined) || (tmp - map.last_time_down < 150)) {
                map.select_hex(selected_hex[0], selected_hex[1]);
                map.send_cell_action('move')
            }  
        } else {
            let tmp = Date.now()
            if ((map.last_time_down == undefined) || (tmp - map.last_time_down < 150)) {
                map.select_hex(selected_hex[0], selected_hex[1]);
                let context = document.getElementById('map_context');

                context.style.top = mouse_pos.y + 5 + 'px';
                context.style.left = mouse_pos.x + 5 + 'px';
                context.classList.remove('hidden')
                globals.map_context_dissapear_time = 1;
            }            
        }
        globals.pressed = false;
    }

    map.canvas.onmouseout = event => {
        globals.pressed = false;
    };

    let context = document.getElementById('map_context');

    context.onmouseenter = (() => {globals.mouse_over_map_context = true; globals.map_context_dissapear_time = 1})
    context.onmouseleave = (() => globals.mouse_over_map_context = false)
}



export class Map {
    constructor(canvas, container, socket) {
        this.canvas = canvas;
        this.socket = socket
        this.hex_side = 20;
        this.camera = [50, 600];
        this.hex_shift = [-100, -680];
        this.hovered = null;
        this.selected = [0, 0];
        this.curr_pos = [0, 0];
        this.curr_territory = undefined;
        this.curr_section = undefined;
        this.sections = undefined;
        this.x = 10;
        this.y = 10;

        this.fog_of_war = {
            'colony': true,
            'rat_plains': true,
            'rest_of_the_world': true,
        }

        {
            let button = document.getElementById('move_button');
            (() => 
                    button.onclick = () => this.send_cell_action('move')
            )(this.socket);
        }

        {
            let button = document.getElementById('attack_button');
            (() => 
                    button.onclick = () => this.send_cell_action('attack')
            )(this.socket);
        }

        {
            let button = document.getElementById('hunt_button');
            (() => 
                    button.onclick = () => this.send_cell_action('hunt')
            )(this.socket);
        }

        {
            let button = document.getElementById('clean_button');
            (() => 
                    button.onclick = () => this.send_cell_action('clean')
            )(this.socket);
        }

        {
            let button = document.getElementById('rest_button');
            (() => 
                    button.onclick = () => this.send_cell_action('rest')
            )(this.socket);
        }
        
        this.container = container;
        this.description = document.createElement('div');
        this.container.appendChild(this.description);

        this.local_description = document.getElementById('local_description')

        this.path = {}
        this.real_path = []
        this.path_progress = 0
    }

    send_cell_action(action) {
        if ((action == 'move') && (this.check_move(this.selected[0] - this.curr_pos[0], this.selected[1] - this.curr_pos[1]))) {
            this.socket.emit('move', {x: this.selected[0], y: this.selected[1]})
        } else if ((this.selected[0] == this.curr_pos[0]) && (this.selected[1] == this.curr_pos[1])) {
            this.socket.emit(action, {x: this.selected[0], y: this.selected[1]})
        } else if (this.real_path.length > 1) {
            this.path_progress += 1
            this.socket.emit('move', {x: this.real_path[this.path_progress + 1][0], y: this.real_path[this.path_progress + 1][1]})            
        }        
    }

    check_move(a, b) {
        for (let i of directions) {
            if ((i[0] == a) && (i[1] == b)) {
                return true
            }
        }
        return false
    }

    toogle_territory(tag) {
        this.fog_of_war[tag] = !this.fog_of_war[tag];
    }

    explore(data) {
        console.log('explore')
        console.log(data)
        for (let i in data) {
            if (terr_id[i] in this.fog_of_war) {
                console.log(terr_id[i])
                this.fog_of_war[terr_id[i]] = !data[i]
            }
        }
    }

    draw(images) {
        var ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, 2000, 2000);
        ctx.drawImage(images['map'], 0 - this.camera[0], 0 - this.camera[1], 2000, 2000)
        for (i in this.fog_of_war) {
            if (this.fog_of_war[i]) {
                ctx.drawImage(images['fog_' + i], 0 - this.camera[0], 0 - this.camera[1], 2000, 2000)
            }
        }
        for (var i = 0; i < 100; i++) {
            for (var j = 0; j < 100; j++) {
                if (this.hovered != null && this.hovered[0] == i && this.hovered[1] == j) {
                    this.draw_hex(i, j, 'fill', '(0, 255, 0, 0.6)');
                } else if (this.curr_pos[0] == i && this.curr_pos[1] == j) {
                    this.draw_hex(i, j, 'fill', '(0, 0, 255, 0.6)');
                    this.draw_hex(i, j, 'circle', '(0, 255, 0, 1)');
                } else if (this.selected != null && this.selected[0] == i && this.selected[1] == j) {
                    this.draw_hex(i, j, 'fill', '(255, 255, 0, 0.6)');                    
                } else {
                    if ((get_territory_tag(i, j) == this.curr_territory) & (this.curr_territory != undefined) & (this.sections != undefined)) {
                        let color = this.get_section_color(this.get_section(i, j))
                        if (color != undefined) {
                            this.draw_hex(i, j, 'fill', color);
                        }
                    }
                    
                }
            }
        }

        if (this.selected != undefined){
            ctx.strokeStyle = 'rgb(0, 255, 0)'
            let tmp = st(this.selected)
            let cur = this.selected
            while ((tmp != -1) && (tmp != undefined)) {
                if ((tmp in this.path) && (this.path[tmp] != -1)) {
                    let t = this.get_hex_centre(cur[0], cur[1])
                    ctx.beginPath()
                    ctx.moveTo(t[0], t[1]);

                    let tmp_cen = this.get_hex_centre(this.path[tmp][0], this.path[tmp][1])
                    ctx.lineTo(tmp_cen[0], tmp_cen[1])
                    ctx.stroke()
                }
                if (this.path[tmp] != undefined) {
                    cur = this.path[tmp]
                    tmp = st(this.path[tmp])                    
                } else {
                    tmp = undefined
                    cur = undefined
                }
                
            }
        }        
    }

    get_section(x, y) {
        let tmp = x + '_' + y;
        for (let i in this.sections.hexes) {
            if (this.sections.hexes[i].indexOf(tmp) > -1) {
                return i
            }
        } 
        return 'unknown'
    }

    get_section_color(tag) {
        if (tag in this.sections.colors) {
            let color = this.sections.colors[tag];
            return '(' + color[0] + ', ' + color[1] + ', ' + color[2] + `, 0.3)`
        }
        return undefined;
    }

    get_hex_centre(i, j) {
        var h = this.hex_side * Math.sqrt(3) / 2;
        var w = this.hex_side / 2;
        var tx = (this.hex_side + w) * i - this.camera[0] - this.hex_shift[0];
        var ty = 2 * h * j - h * i - this.camera[1] - this.hex_shift[1];
        return [tx, ty]
    }

    draw_hex(i, j, mode, color) {
        var ctx = this.canvas.getContext('2d');
        var h = this.hex_side * Math.sqrt(3) / 2;
        var w = this.hex_side / 2;
        var center_x = (this.hex_side + w) * i - this.camera[0] - this.hex_shift[0];
        var center_y = 2 * h * j - h * i - this.camera[1] - this.hex_shift[1];
        if (mode == 'circle') {
            ctx.strokeStyle = 'rgba' + color;
            ctx.beginPath();
            ctx.arc(center_x, center_y, 5, 0, Math.PI * 2, true);
            ctx.stroke();
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
        } else if (mode == 'stroke') {
            ctx.lineTo(center_x + this.hex_side, center_y);
            ctx.stroke()
        }

        // ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        // ctx.font = '10px Times New Roman';
        // ctx.fillText(`${i} ${j}`, center_x - w, center_y + h / 2);
    }

    move(dx, dy) {
        this.camera[0] -= dx;
        this.camera[1] -= dy;
    }

    get_hex(x, y) {
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

    hover_hex(i, j) {
        this.hovered = [i, j];
    }

    select_hex(i, j) {
        this.selected = [i, j];
        let tag = get_territory_tag(i, j);
        if (this.fog_of_war[tag] == true) {
            tag = 'unknown'
        }
        let section_tag = this.get_section(i, j)
        this.description.innerHTML = i + ' ' + j + ' ' + DESCRIPTIONS[tag] + '<br>' + section_descriptions[section_tag];
        this.local_description.innerHTML = '<img src="static/img/' + LOCAL_IMAGES[tag] +  '" width="300">'
        this.path = this.create_path()
        this.real_path = []
        this.path_progress = 0

        if (this.selected != undefined){
            let tmp = st(this.selected)
            let cur = this.selected
            while ((tmp != -1) && (tmp != undefined)) {
                this.real_path.push(cur)
                if (this.path[tmp] != undefined) {
                    cur = this.path[tmp]
                    tmp = st(this.path[tmp])                    
                } else {
                    tmp = undefined
                    cur = undefined
                }
            }
        }
        this.real_path = this.real_path.reverse()
    }

    create_path() {
        let queue = [this.curr_pos];
        let prev = {}
        prev[st(this.curr_pos)] = -1
        let used = {}
        let right = 1;
        let next = 0
        while ((next != -1) && (right < 400)) {
            let curr = queue[next]
            used[st(curr)] = true
            

            for (let d of directions) {
                let tmp = [curr[0] + d[0], curr[1] + d[1]]
                let territory = get_territory_tag(tmp[0], tmp[1])
                if ((!used[st(tmp)]) && (territory != 'unknown') && (territory != 'sea') && (!this.fog_of_war[territory])) {
                    queue[right] = tmp;
                    prev[st(tmp)] = curr
                    right++;
                    if ((tmp[0] == this.selected[0]) && (tmp[1] == this.selected[1])) {
                        return prev
                    }                    
                }                
            }
            

            let heur_score = 9999
            next = -1
            for (let i = 0; i < right; i++) {
                let tmp = this.dist(queue[i], this.selected)
                if ((tmp < heur_score) && (!used[st(queue[i])])) {
                    next = i;
                    heur_score = tmp
                }
            }
        }
        return prev
    }

    dist(a, b) {
        let v1 = this.get_hex_centre(a[0], a[1])
        let v2 = this.get_hex_centre(b[0], b[1])
        return ((v1[0] - v2[0]) * (v1[0] - v2[0]) + (v1[1] - v2[1]) * (v1[1] - v2[1])) /10000
    }

    set_curr_pos(i, j) {
        this.curr_pos = [i, j];
        this.curr_territory = get_territory_tag(i, j);
        return BACKGROUNDS[this.curr_territory];
    }

    load_sections(data) {
        console.log(data);
        this.sections = data;
    }
}
