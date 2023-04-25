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
                       '7_3', '7_4', '7_5', '7_6', '7_7', '7_8', '7_9', '7_10'],

        'forest': []
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
    'forest': 'forest',
    'unknown': 'red_steppe'
}

export function init_map_control(map, globals) {
    console.log('map control')
    map.canvas.onmousedown = event => {
        event.preventDefault();
        globals.pressed = true;
        globals.prev_mouse_x = null;
        globals.prev_mouse_y = null;
        globals.map_zoom = 1

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
        // let mouse_pos = {x: event.screenX, y: event.screenY}
        let mouse_pos = get_pos_in_canvas(map.canvas, event);
        let selected_hex = map.get_hex(mouse_pos.x, mouse_pos.y);
        if (event.button == 2) {
            let tmp = Date.now()
            if ((map.last_time_down == undefined) || (tmp - map.last_time_down < 150)) {
                map.select_hex(selected_hex[0], selected_hex[1]);
                map.move_flag = true
                map.send_cell_action('move')
            }  
        } else {
            let tmp = Date.now()
            if ((map.last_time_down == undefined) || (tmp - map.last_time_down < 150)) {
                map.select_hex(selected_hex[0], selected_hex[1]);
                let context = document.getElementById('map_context');

                context.style.top = event.clientY + 5 + 'px';
                context.style.left = event.clientX + 5 + 'px';
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
    constructor(canvas, container, socket, globals) {

        this.time = 0

        this.tiles = []
        this.tiles.push(new Image)
        this.tiles[0].src = 'static/img/tiles/red_steppe.png';

        this.tiles.push(new Image)
        this.tiles[1].src = 'static/img/tiles/house.png';

        this.tiles.push(new Image)
        this.tiles[2].src = 'static/img/tiles/urban_1.png';

        this.tiles.push(new Image)
        this.tiles[3].src = 'static/img/tiles/urban_3.png';

        this.tiles.push(new Image)
        this.tiles[4].src = 'static/img/tiles/city.png';
        this.tiles.push(new Image)
        this.tiles[5].src = 'static/img/tiles/sea.png';
        this.tiles.push(new Image)
        this.tiles[6].src = 'static/img/tiles/coast.png';

        this.tiles.push(new Image)
        this.tiles[7].src = 'static/img/tiles/forest_1.png';
        this.tiles.push(new Image)
        this.tiles[8].src = 'static/img/tiles/forest_2.png';
        this.tiles.push(new Image)
        this.tiles[9].src = 'static/img/tiles/forest_3.png';

        this.tiles.push(new Image)
        this.tiles[10].src = 'static/img/tiles/rupture.png';

        this.tiles.push(new Image)
        this.tiles[11].src = 'static/img/tiles/rural.png';

        this.tiles.push(new Image)
        this.tiles[12].src = 'static/img/tiles/rats.png';

        this.tiles.push(new Image)
        this.tiles[13].src = 'static/img/tiles/elodinos.png';

        this.canvas = canvas;
        this.socket = socket
        this.hex_side = 23;
        this.camera = [50, 600];
        this.hex_shift = [-100, -680];
        this.hovered = null;
        this.selected = [0, 0];
        this.curr_pos = [0, 0];
        this.curr_territory = undefined;
        this.curr_section = undefined;
        this.sections = undefined;

        this.move_flag = false // does player follow some path currently?
        this.movement_progress = 0

        this.hex_h = this.hex_side * Math.sqrt(3) / 2
        this.hex_w = this.hex_side / 2

        this.data = {}
        this.terrain = []

        this.visit_spotted = []
        this.x = 10;
        this.y = 10;

        this.fog_of_war = {
            'colony': true,
            'rat_plains': true,
            'rest_of_the_world': true,
        }


        // {
        //     let button = document.getElementById('move_button');
        //     (() => 
        //             button.onclick = () => this.send_cell_action('move')
        //     )(this.socket);
        // }

        let rest_of_actions = ['fish', 'gather_wood', 'gather_cotton', 'hunt', 'clean', 'rest']
        this.set_local_actions(rest_of_actions, globals);
        
        this.container = container;
        this.description = document.createElement('div');
        this.container.appendChild(this.description);

        this.local_description = document.getElementById('local_description')

        this.path = {}
        this.real_path = []
        this.path_progress = 0
    }

    set_local_actions(rest_of_actions, globals) {
        let desktop_container = document.getElementById('desktop_actions');

        for (let action_tag of rest_of_actions) {
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
                desktop_button.appendChild(label);
            }

            {
                let chance_label = document.createElement('div');
                chance_label.innerHTML = '100%';
                chance_label.id = action_tag + '_chance_desktop';
                chance_label.classList.add('probability');
                desktop_button.appendChild(chance_label);
            }

            if (action_tag == 'hunt' || action_tag == 'gather_wood' || action_tag == 'gather_cotton' || action_tag == 'fish') {
                let repeat_button = document.createElement('div');
                repeat_button.innerHTML = 'repeat';
                repeat_button.classList.add('active');
                repeat_button.classList.add('bordered');
                repeat_button.classList.add('height-25');
                ((button, map_manager, action_tag, global_blob) => button.onclick = () => {
                    console.log(global_blob);
                    if (global_blob.keep_doing == action_tag) {
                        global_blob.keep_doing = undefined;
                    } else {
                        global_blob.keep_doing = action_tag;
                        map_manager.send_cell_action(action_tag);
                    }
                    console.log(global_blob);
                }
                )(repeat_button, this, action_tag, globals);
                desktop_button.appendChild(repeat_button);
            }

            ((button, map_manager, action_tag) => button.onclick = () => map_manager.send_local_cell_action(action_tag)
            )(desktop_button, this, action_tag);

            desktop_container.appendChild(desktop_button);
        }
    }

    update_probability(data) {
        let text= Math.floor(data.value * 100) + '%'

        // let chance_label_map = document.getElementById(data.tag + '_chance')
        // chance_label_map.innerHTML = text

        let chance_label_desktop = document.getElementById(data.tag + '_chance_desktop')
        chance_label_desktop.innerHTML = text
    }

    update_action_status(data) {
        console.log(data)
        let button1 = document.getElementById(data.tag + '_button')
        let button2 = document.getElementById(data.tag + '_button_desktop')

        if (!data.value) {
            // button1.classList.add('unavailable')
            button2.classList.add('unavailable')
        } else {
            // button1.classList.remove('unavailable')
            button2.classList.remove('unavailable')
        }
    }

    send_cell_action(action) {
        let adj_flag = this.check_move(this.selected[0] - this.curr_pos[0], this.selected[1] - this.curr_pos[1])
        if ((action == 'move') && (adj_flag)) {
            this.move_target = this.selected
            this.move_flag = true
            this.socket.emit('move', {x: this.selected[0], y: this.selected[1]})
        } else if ((this.selected[0] == this.curr_pos[0]) && (this.selected[1] == this.curr_pos[1])) {
            this.socket.emit(action, {x: this.selected[0], y: this.selected[1]})
        } else if (action == 'continue_move') {
            this.path_progress += 1
            this.move_target = this.real_path[this.path_progress + 1]
            if (this.real_path[this.path_progress + 1] == undefined) return
            this.socket.emit('move', {x: this.real_path[this.path_progress + 1][0], y: this.real_path[this.path_progress + 1][1]})    
        } else if ((this.real_path.length > 1) && ((this.move_flag == true) || (this.movement_progress > 0.99))) {
            this.move_flag = true
            this.path_progress = 1
            this.path = this.create_path()
            this.move_target = this.real_path[this.path_progress + 1]
            this.socket.emit('move', {x: this.real_path[this.path_progress + 1][0], y: this.real_path[this.path_progress + 1][1]})            
        }
    }

    send_local_cell_action(action) {
        this.socket.emit(action, {x: this.curr_pos[0], y: this.curr_pos[1]})
        this.last_action = action
    }

    send_last_action() {
        this.send_local_cell_action(this.last_action)
    }

    mark_visited(data) {
        this.visit_spotted = data
        // console.log(this.visit_spotted)
    }

    check_move(a, b) {
        for (let i of directions) {
            if ((i[0] == a) && (i[1] == b)) {
                return true
            }
        }
        return false
    }

    load_data(data) {
        for (let i in data) {
            this.data[i] = data[i]
        }
    } 
    
    load_terrain(data) {
        // console.log(data)
        if (this.terrain[data.x] == undefined) {
            this.terrain[data.x] = []
        }
        this.terrain[data.x][data.y] = data.ter
    } 

    reset() {
        this.terrain = []
        this.data = []
    }

    toogle_territory(tag) {
        this.fog_of_war[tag] = !this.fog_of_war[tag];
    }

    explore(data) {
        // console.log('explore')
        // console.log(data)
        for (let i in data) {
            if (terr_id[i] in this.fog_of_war) {
                // console.log(terr_id[i])
                this.fog_of_war[terr_id[i]] = !data[i]
            }
        }
    }

    draw(images, dt) {
        this.time += dt
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
                if (this.hovered != null && this.hovered[0] == i && this.hovered[1] == j) {
                    this.draw_hex(i, j, 'fill', '(0, 255, 0, 0.6)');
                } else if (this.curr_pos[0] == i && this.curr_pos[1] == j) {
                    this.draw_hex(i, j, 'fill', '(0, 0, 255, 0.6)');
                    // this.draw_hex(i, j, 'circle', '(0, 255, 0, 1)');
                } else if (this.selected != null && this.selected[0] == i && this.selected[1] == j) {
                    this.draw_hex(i, j, 'fill', '(255, 255, 0, 0.6)');                    
                } else {
                    // if ((get_territory_tag(i, j) == this.curr_territory) & (this.curr_territory != undefined) & (this.sections != undefined)) {
                    //     let color = this.get_section_color(this.get_section(i, j))
                    //     if (color != undefined) {
                    //         this.draw_hex(i, j, 'fill', color);
                    //     }
                    // }
                    this.draw_hex(i, j, 'fill', '(0, 0, 0, 0)');
                }
            }
        }

        this.draw_player_circle()
        this.draw_selected_circle()

        ctx.fillStyle = "#000000";
        ctx.font = 'bold 20px sans-serif';
        for (let i in this.visit_spotted) {
            let centre = this.get_hex_centre(this.visit_spotted[i].x, this.visit_spotted[i].y)
            ctx.fillText(`??`, centre[0] - 10, centre[1]);
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

    draw_player_circle() {
        var ctx = this.canvas.getContext('2d');
        if (this.move_flag) {
            let c = this.get_hex_centre(this.curr_pos[0], this.curr_pos[1])
            let b = this.get_hex_centre(this.move_target[0], this.move_target[1])

            ctx.strokeStyle = 'rgba' + '(200, 200, 0, 1)';
            // ctx.beginPath();
            // ctx.arc(c[0] * (1 - this.movement_progress) + b[0] * this.movement_progress, 
            //         c[1] * (1 - this.movement_progress) + b[1] * this.movement_progress, 
            //         5, 0, Math.PI * 2, true);
            // ctx.stroke();

            this.draw_pentagon(ctx, c[0] * (1 - this.movement_progress) + b[0] * this.movement_progress, c[1] * (1 - this.movement_progress) + b[1] * this.movement_progress, 10)

            // this.draw_hex(this.curr_pos[0], this.curr_pos[1], 'circle', '(0, 255, 0, 1)');
        } else {
            this.draw_hex(this.curr_pos[0], this.curr_pos[1], 'pentagon', '(200, 200, 0, 1)', 10);
        }        
    }

    draw_selected_circle() {
        var ctx = this.canvas.getContext('2d');
        this.draw_hex(this.selected[0], this.selected[1], 'pentagon', '(0, 100, 100, 1)', 20);
    }

    draw_pentagon(ctx, x, y, r) {
        let epsilon = 6 * Math.PI / 5
        // let xi = 2 * Math.PI / 5
        let start = this.time 
        // let shift = globals.action_ratio

        ctx.beginPath();
        ctx.moveTo(x + Math.cos(start) * r, y + Math.sin(start) * r);

        for (let i = 0; i < 6; i++) {
            let dx = Math.cos(start) * r
            let dy = Math.sin(start) * r
            ctx.lineTo(x + dx, y + dy);
            start = start + epsilon
            // if (shift != undefined) {
            //     start = start + xi * shift
            // }
        }

        ctx.stroke();
    }


    draw_hex(i, j, mode, color, r) {
        let tag = i + '_' + j
        // if (!((tag) in this.data)) {
        //     return
        // }

        var ctx = this.canvas.getContext('2d');
        var h = this.hex_h;
        var w = this.hex_w;
        var center_x = (this.hex_side + w) * i - this.camera[0] - this.hex_shift[0];
        var center_y = 2 * h * j - h * i - this.camera[1] - this.hex_shift[1];

        if (mode == 'pentagon') {
            ctx.strokeStyle = 'rgba' + color;
            this.draw_pentagon(ctx, center_x, center_y, r)
            return
        }

        if (mode == 'circle') {
            ctx.strokeStyle = 'rgba' + color;
            ctx.beginPath();
            ctx.arc(center_x, center_y, 5, 0, Math.PI * 2, true);
            ctx.stroke();
            return
        }

        if (this.terrain[i] == undefined || this.terrain[i][j] == undefined) {
            return
        }

        if (this.terrain[i][j] == 'sea') {
            ctx.drawImage(this.tiles[5], center_x - this.hex_side, center_y - h)
        } else if (this.terrain[i][j] == 'city') {
            ctx.drawImage(this.tiles[4], center_x - this.hex_side, center_y - h)
        } else if (this.terrain[i][j] == 'steppe') {
            ctx.drawImage(this.tiles[0], center_x - this.hex_side, center_y - h)
        } else if (this.terrain[i][j] == 'coast') {
            ctx.drawImage(this.tiles[6], center_x - this.hex_side, center_y - h)
        } else{
            return
        }
        
        if ((tag) in this.data) {
            if (this.data[tag].urban >= 2) {
                ctx.drawImage(this.tiles[3], center_x - this.hex_side, center_y - h)
            } else if (this.data[tag].urban == 1) {
                ctx.drawImage(this.tiles[2], center_x - this.hex_side, center_y - h)
            } 
            if (this.data[tag].wild == 1) {
                ctx.drawImage(this.tiles[7], center_x - this.hex_side, center_y - h)
            } else if (this.data[tag].wild == 2) {
                ctx.drawImage(this.tiles[8], center_x - this.hex_side, center_y - h)
            } else if (this.data[tag].wild == 3) {
                ctx.drawImage(this.tiles[9], center_x - this.hex_side, center_y - h)
            } 
            if (this.data[tag].rupture == 1) {
                ctx.drawImage(this.tiles[10], center_x - this.hex_side, center_y - h)
            } 
            if (this.data[tag].rural >= 1) {
                ctx.drawImage(this.tiles[11], center_x - this.hex_side, center_y - h)
            }

            if (this.data[tag].rats == 1) {
                ctx.drawImage(this.tiles[12], center_x - this.hex_side, center_y - h)
            }

            if (this.data[tag].elodinos == 1) {
                ctx.drawImage(this.tiles[13], center_x - this.hex_side, center_y - h)
            }
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
                if (this.terrain[tmp[0]] != undefined ) {
                    let ter = this.terrain[tmp[0]][tmp[1]]
                    if (ter != 'sea' && ter != undefined) {
                        if (this.data[tmp[0] + '_' + tmp[1]] == undefined || this.data[tmp[0] + '_' + tmp[1]].rupture != 1) {
                            let tmps = st(tmp)
                            if (!used[tmps]) {
                                queue[right] = tmp;
                                prev[tmps] = curr
                                right++;
                                if ((tmp[0] == this.selected[0]) && (tmp[1] == this.selected[1])) {
                                    return prev
                                }                    
                            }  
                        }                         
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

    get_bg_tag(i, j) {
        let tag = i + '_' + j

        if ((this.terrain[i] != undefined) && (this.terrain[i][j] == 'coast')) {
            if (this.data[tag] == undefined) return 'coast'
            if ((this.data[tag].urban == 1) || (this.data[tag].rural > 0)) {
                return 'coast_rural'
            }
            return 'coast'
        }
        
        if (this.data[tag] != undefined) {
            if (this.data[tag].wild >= 1) {
                return 'forest'
            }

            if (this.data[tag].urban >= 2) {
                return 'colony'
            } 

            if (this.data[tag].urban >= 1) {
                return 'urban_1'
            }
            
            if (this.data[tag].rural >= 1) {
                return 'rural_1'
            }
        }

        return undefined
    }

    set_curr_pos(i, j, teleport_flag) {
        console.log('new position')
        console.log(i, j)
        let tmp0 = this.curr_pos[0]
        let tmp1 = this.curr_pos[1]
        this.curr_pos = [i, j];
        this.curr_territory = get_territory_tag(i, j);

        console.log('move flag')
        console.log(this.real_path[this.real_path.length - 1])
        console.log(this.curr_pos)
        console.log(this.move_flag)
        if (this.move_flag) {
            if ((this.real_path[this.real_path.length - 1][0] == this.curr_pos[0]) && (this.real_path[this.real_path.length - 1][1] == this.curr_pos[1])) {
                this.move_flag = false
            }
        }
        console.log(this.move_flag)


        // if (!teleport_flag) {
        //     if ((tmp0 != 0) || (tmp1 != 0)) {
        //         this.send_cell_action('move')
        //     }
        // }

        
        let res = this.get_bg_tag(i, j)
        if (res != undefined) {
            return res
        }        
        // this.visit_spotted = []
        return BACKGROUNDS[this.curr_territory];
    }

    re_set_cur_pos() {
        let [i, j] = this.curr_pos
        this.curr_territory = get_territory_tag(i, j);

        let res = this.get_bg_tag(i, j)
        if (res != undefined) {
            return res
        }

        // this.visit_spotted = []
        return BACKGROUNDS[this.curr_territory];
    }


    load_sections(data) {
        console.log(data);
        this.sections = data;
    }
}
