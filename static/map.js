/* eslint-disable no-redeclare */
/*global images, battle_image*/

const graci_plains = 'Plains where gracis are living their beautiful life. Be aware, they are very fast, traveller.'
const forest_boundary = 'The forest starts here. Weird creatures inhabit this place, not a lot is known about them.'

const LOCAL_IMAGES = {
    '0_0': 'starting_tiles_image_downsized.png',
    '1_0': 'starting_tiles_image_downsized.png',
    '1_1': 'starting_tiles_image_downsized.png',
    '1_2': 'starting_tiles_image_downsized.png',
    '2_0': 'forest_background.png',
    '2_1': 'forest_background.png',
    '2_2': 'forest_background.png',
    '2_3': 'forest_background.png',
    '3_1': 'forest_background.png',
    '3_2': 'forest_background.png',
}

const DESCRIPTIONS = {
    '0_0': 'Settlement of colonists - greedy but brave men. Here you can sell your raw meet and exchange it for food and water',
    '1_0': graci_plains,
    '1_1': graci_plains,
    '1_2': graci_plains,
    '2_0': forest_boundary,
    '2_1': forest_boundary,
    '2_2': forest_boundary,
    '2_3': forest_boundary,
    '3_1': forest_boundary,
    '3_2': forest_boundary,
}

const BACKGROUNDS = {
    '0_0': 'background',
    '1_0': 'background',
    '1_1': 'background',
    '1_2': 'background',
    '2_0': 'forest_background',
    '2_1': 'forest_background',
    '2_2': 'forest_background',
    '2_3': 'forest_background',
    '3_1': 'forest_background',
    '3_2': 'forest_background',
}


// eslint-disable-next-line no-unused-vars
class Map {
    constructor(canvas, container, socket) {
        this.canvas = canvas;
        this.socket = socket
        this.hex_side = 20;
        this.camera = [50, 600];
        this.hex_shift = [-100, -680];
        this.hovered = null;
        this.selected = [0, 0];
        this.curr_pos = [0, 0];
        this.x = 10;
        this.y = 10;

        this.fog_of_war = {
            'colony': true,
            'rat_plains': true,
            'rest_of_the_world': true,
        }

        this.button = document.createElement('button');
        (() => 
                this.button.onclick = () => this.send_move_request(socket)
        )(this.socket);
        this.button.innerHTML = 'move';
        this.container = container;
        this.container.appendChild(this.button);

        this.description = document.createElement('div');
        this.container.appendChild(this.description);

        this.local_description = document.getElementById('local_description')
    }

    send_move_request() {
        this.socket.emit('move', {x: this.selected[0], y: this.selected[1]})
    }

    toogle_territory(tag) {
        this.fog_of_war[tag] = !this.fog_of_war[tag];
    }

    draw() {
        var ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, 500, 500);
        ctx.drawImage(images['map'], 0 - this.camera[0], 0 - this.camera[1], 2000, 2000)
        for (i in this.fog_of_war) {
            if (this.fog_of_war[i]) {
                ctx.drawImage(images['fog_' + i], 0 - this.camera[0], 0 - this.camera[1], 2000, 2000)
            }
        }
        for (var i = 0; i < 100; i++) {
            for (var j = 0; j < 100; j++) {
                if (this.hovered != null && this.hovered[0] == i && this.hovered[1] == j) {
                    this.draw_hex(i, j, 'fill', '(0, 255, 0, 0.3)');
                } else if (this.curr_pos[0] == i && this.curr_pos[1] == j) {
                    this.draw_hex(i, j, 'fill', '(0, 0, 255, 0.3)');
                } else if (this.selected != null && this.selected[0] == i && this.selected[1] == j) {
                    this.draw_hex(i, j, 'fill', '(255, 255, 0, 0.3)');
                }
                //  else {
                //     this.draw_hex(i, j, 'stroke', '(0, 0, 0, 1)');
                // }
            }
        }
    }

    draw_hex(i, j, mode, color) {
        var ctx = this.canvas.getContext('2d');
        var h = this.hex_side * Math.sqrt(3) / 2;
        var w = this.hex_side / 2;
        var center_x = (this.hex_side + w) * i - this.camera[0] - this.hex_shift[0];
        var center_y = 2 * h * j - h * i - this.camera[1] - this.hex_shift[1];
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
        this.description.innerHTML = i + ' ' + j + ' ' + DESCRIPTIONS[i + '_' + j];
    }

    set_curr_pos(i, j) {
        this.curr_pos = [i, j];
        this.local_description.innerHTML = 'Your surroundings: \n <img src="static/img/' + LOCAL_IMAGES[i + '_' + j] +  '" width="300">'
        battle_image.change_bg(BACKGROUNDS[i + '_' + j])
    }
}