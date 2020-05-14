'use strict'

var TACTIC_TAGS_TARGET = [];
var TACTIC_TAGS_VALUE_TAG = [];
var TACTIC_SIGN_SIGN_TAG = [];
var TACTIC_ACTION_TAG = [];

var images = {}

function load_image(s, callback) {
    var tmp = new Image();
    tmp.src = s;
    tmp.onload = callback
    return tmp
}

var loaded = Array.apply(null, Array(15)).map(() => 0)

function check_loading() {
    let f = 1;
    for (let i = 0; i < loaded.length; i++){
        f *= loaded[i];
    }
    return f
}

images['apu_eyes_0'] = load_image('static/img/apu_base_eyes.png', () => loaded[0] = 1);
images['apu_blood_eyes_0'] = load_image('static/img/apu_eyes_blood.png', () => loaded[1] = 1);
images['apu_pupils_0'] = load_image('static/img/apu_pupils_0.png', () => loaded[2] = 1);
images['apu_head_base_0'] = load_image('static/img/apu_head_base.png', () => loaded[3] = 1);
images['apu_mouth_0'] = load_image('static/img/apu_mouth_0.png', () => loaded[4] = 1);
images['apu_mouth_1'] = load_image('static/img/apu_mouth_1.png', () => loaded[5] = 1);
images['apu_wrinkles_0'] = load_image('static/img/apu_wrinkles.png', () => loaded[6] = 1);
images['apu_blood_0'] = load_image('static/img/apu_blood_0.png', () => loaded[7] = 1);
images['apu_blood_1'] = load_image('static/img/apu_blood_1.png', () => loaded[8] = 1);
images['apu_blood_2'] = load_image('static/img/apu_blood_2.png', () => loaded[9] = 1);
images['apu_blood_3'] = load_image('static/img/apu_blood_3.png', () => loaded[10] = 1);
images['apu_blood_4'] = load_image('static/img/apu_blood_4.png', () => loaded[11] = 1);
images['apu_pupils_1'] = load_image('static/img/apu_pupils_1.png', () => loaded[12] = 1)
images['base_background'] = load_image('static/img/base_background.png', () => loaded[13] = 1)
images['test_0'] = load_image('static/img/test_0.png', () => loaded[14] = 1)
images['tost_0'] = load_image('static/img/tost_0.png', () => loaded[15] = 1)


function draw_image(context, image, x, y, w, h) {
    context.drawImage(image, x, y, w, h)
}



function change_image_data(image_data, f) {
    for (var i = 0; i < image_data.data.length; i += 4) {
        let r = image_data.data[i + 0];
        let g = image_data.data[i + 1];
        let b = image_data.data[i + 2];
        let a = image_data.data[i + 3];
        var result = f([r, g, b, a]);
        for (var j = 0; i < 4; i++) {
            image_data.data[i + j] = result[j]
        }
    }
    return image_data
}

function change_alpha(l, a) {
    l[3] = Math.max(Math.min(Math.floor(l[3] * a), 255), 0)
    return l
}

class CharacterImage {
    constructor(canvas, tmp_canvas) {
        this.canvas = canvas.get(0);
        this.tmp_canvas = tmp_canvas.get(0);
        this.draw_order = ['eyes', 'blood_eyes', 'pupils', 'head', 'mouth', 'wrinkles'];
        this.images = {
            head: 'apu_head_base_0', 
            eyes: 'apu_eyes_0', 
            blood_eyes: 'apu_blood_eyes_0', 
            pupils: 'apu_pupils_0',
            magic_pupils: 'apu_pupils_1',
            mouth_1: 'apu_mouth_1',
            mouth_0: 'apu_mouth_0',
            wrinkles: 'apu_wrinkles_0',
            blood_0: 'apu_blood_0',
            blood_1: 'apu_blood_1',
            blood_2: 'apu_blood_2',
            blood_3: 'apu_blood_3',
            blood_4: 'apu_blood_4'
        };
        this.stats = {rage: 0, blood: 0, power: 0};
        this.w = 400;
        this.h = 274;
        this.pupils_phi = -Math.PI / 2
        this.pupils_rad = 14
    }

    update(rage, blood, power) {
        this.stats.rage = rage;
        this.stats.blood = blood;
        this.stats.power = power;
    }

    draw() {
        var ctx = this.canvas.getContext('2d');
        var tmp = this.tmp_canvas.getContext('2d');
        ctx.clearRect(0, 0, 400, 400);
        draw_image(ctx, images[this.images['eyes']], 0, 0, this.w, this.h);
        tmp.clearRect(0, 0, 400, 400);
        draw_image(tmp, images[this.images['blood_eyes']], 0, 0, this.w, this.h);
        var image_data = tmp.getImageData(0, 0, this.tmp_canvas.width, this.tmp_canvas.height);
        var rage = this.stats.rage;
        for (var i = 3; i < image_data.data.length; i+=4) {
            image_data.data[i] = Math.floor(image_data.data[i] * rage / 100)
        }
        tmp.putImageData(image_data, 0, 0);
        ctx.drawImage(this.tmp_canvas, 0, 0);

        var pow = this.stats.power;
        tmp.clearRect(0, 0, 400, 400);
        draw_image(tmp, images[this.images['magic_pupils']], 0, 0, this.w, this.h);
        var image_data = tmp.getImageData(0, 0, this.tmp_canvas.width, this.tmp_canvas.height);
        for (var i = 3; i < image_data.data.length; i+=4) {
            image_data.data[i] = Math.floor(image_data.data[i] * pow / 100)
        }
        tmp.putImageData(image_data, 0, 0);

        if (rage > 50) {
            let x = Math.cos(this.pupils_phi) * this.pupils_rad * 1.5 - 10;
            let y = Math.sin(this.pupils_phi) * this.pupils_rad * 0.5 - 10;
            draw_image(ctx, images[this.images['pupils']], x, y, this.w, this.h);
            ctx.drawImage(this.tmp_canvas, x, y);
            this.pupils_phi += Math.PI / 16;
        }
        else {
            draw_image(ctx, images[this.images['pupils']], 0, 0, this.w, this.h);
            ctx.drawImage(this.tmp_canvas, 0, 0);
        }

        draw_image(ctx, images[this.images['head']], 0, 0, this.w, this.h);
        
        let tmp_blood = this.stats.blood;
        let c = 0;
        while (tmp_blood > 0 && c <= 4) {
            tmp.clearRect(0, 0, 400, 400);
            draw_image(tmp, images[this.images['blood_' + c]], 0, 0, this.w, this.h)
            if (tmp_blood < 20) {
                var image_data = tmp.getImageData(0, 0, this.tmp_canvas.width, this.tmp_canvas.height);
                for (var i = 3; i < image_data.data.length; i+=4) {
                    image_data.data[i] = Math.floor(image_data.data[i] * tmp_blood / 20)
                }
                tmp.putImageData(image_data, 0, 0);
            }
            ctx.drawImage(this.tmp_canvas, 0, 0);
            tmp_blood -= 20;
            c += 1;
        }

        tmp.clearRect(0, 0, 400, 400);
        draw_image(tmp, images[this.images['wrinkles']], 0, 0, this.w, this.h);
        var image_data = tmp.getImageData(0, 0, this.tmp_canvas.width, this.tmp_canvas.height);
        var rage = this.stats.rage;
        for (var i = 3; i < image_data.data.length; i+=4) {
            image_data.data[i] = Math.floor(image_data.data[i] * rage / 100)
        }
        tmp.putImageData(image_data, 0, 0);
        ctx.drawImage(this.tmp_canvas, 0, 0);

        if (rage > 80) {
            draw_image(ctx, images[this.images['mouth_1']], 0, 0, this.w, this.h);
        }
        else {
            draw_image(ctx, images[this.images['mouth_0']], 0, 0, this.w, this.h);
        }
    }
}

class AnimatedImage {
    constructor(image_name, count, w, h) {
        this.tag = image_name;
        this.count = count;
        this.w = w;
        this.h = h;
        this.current = 0
    }
    
    update() {
        this.current += 1;
        if (this.current >= this.count) {
            this.current = 0
        }
    }
    
    draw(ctx, x, y, w, h) {
        // console.log(this.tag + '_' + this.current, x, y, w, h)
        draw_image(ctx, images[this.tag + '_' + this.current], Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h))
    }
}

class Vector {
    constructor(x, y, z) {
        this.data = [x, y, z]
    }
}

class Line {
    constructor(p, v) {
        this.vector = v;
        this.point = p;
    }
}

class Plane {
    constructor(n, p) {
        this.normal_vector = n;
        this.point = p;
    }
}

function mult(s, v) {
    return new Vector(s * v.data[0], s * v.data[1], s * v.data[2])
}

function sum(a, b) {
    var c = new Vector(a.data[0] + b.data[0], a.data[1] + b.data[1], a.data[2] + b.data[2])
    return c
}

function minus(a, b) {
    var c = new Vector(a.data[0] - b.data[0], a.data[1] - b.data[1], a.data[2] - b.data[2])
    return c
}

function dot(a, b) {
    return a.data[0] * b.data[1] + a.data[1] * b.data[1] + a.data[2] * b.data[2];
}

function two_points_to_line(a, b) {
    return new Line(a, minus(b, a))
}

function intersect(line, plane) {
    var n = mult(Math.sqrt(dot(plane.normal_vector, plane.normal_vector)), plane.normal_vector)
    var d = dot(plane.point, n)
    var a = dot(line.point, n)
    var b = dot(line.vector, n)
    var t = (d - a) / b
    return sum(mult(t, line.vector), line.point)
}

class BattleImage {
    constructor(canvas, tmp_canvas) {
        this.canvas = canvas.get(0);
        this.tmp_canvas = tmp_canvas.get(0);
        this.background = "base_background";
        this.init()
        this.w = 800;
        this.h = 500;
    }

    init() {
        this.positions = {}
        this.ids = {}
        this.images = {}
        this.battle_ids = new Set()
    }

    clear() {
        console.log('clear battle')
        this.init()
    }

    load(data) {
        console.log('load battle')
        console.log(data)
        for (var i in data) {
            this.add_fighter(data[i].id, data[i].tag, data[i].position)
        } 
    }

    update(data) {
        console.log('update battle')
        for (var i in data) {
            this.update_pos(data[i].id, data[i].position)
        }
    }

    dist(a, b, positions) {
        return - positions[a] + positions[b]
    }
    
    draw() {
        var ctx = this.canvas.getContext('2d')
        ctx.clearRect(0, 0, this.w, this.h);
        draw_image(ctx, images[this.background], 0, 0, this.w, this.h)
        var draw_order = Array.from(this.battle_ids)
        draw_order.sort((a, b) => this.dist(a, b, this.positions))
        for (var i of draw_order) {
            var pos = this.calculate_canvas_pos(this.positions[i], this.images[i])
            // console.log(pos)
            this.images[i].draw(ctx, pos[0], pos[1], pos[2], pos[3])
        }
    }
    
    add_fighter(battle_id, tag, position) {
        console.log(battle_id, tag, position)
        this.battle_ids.add(battle_id)
        this.positions[battle_id] = position;
        this.images[battle_id] = new AnimatedImage(tag, 1, 200, 200)
    }
    
    update_pos(battle_id, position) {
        this.positions[battle_id] = position
    }
    
    calculate_canvas_pos(x, image) {
        var base_vector = new Vector(0, 0, 1)
        var point_of_battle_line = new Vector(500, -250, 0)
        var height_vector = new Vector(0, image.h, 0)
        var width_vector = new Vector(image.w, 0, 0)
        var picture_plane = new Plane(base_vector, new Vector(0, 0, 0))
        var viewer_point = new Vector(0, 0, -30)
        var bottom_right_position = sum(sum(mult(x, base_vector), point_of_battle_line), mult(0.5, width_vector))
        var top_left_position = minus(sum(sum(mult(x, base_vector), point_of_battle_line), height_vector), mult(0.5, width_vector))
        var bottom_ray = two_points_to_line(bottom_right_position, viewer_point)
        var top_ray = two_points_to_line(top_left_position, viewer_point)
        var bottom_intersection = intersect(bottom_ray, picture_plane)
        var top_intersection = intersect(top_ray, picture_plane)
        // console.log(top_intersection.data)
        // console.log(bottom_intersection.data)
        var d = minus(bottom_intersection, top_intersection)
        var centre = sum(top_intersection, mult(0.5, d))
        centre = sum(centre, new Vector(this.w / 5, + this.h / 2, 0))
        var canvas_top_left = minus(centre, mult(0.5, d))
        // console.log(canvas_top_left.data[0], this.h - canvas_top_left.data[1], d.data[0], -d.data[1])
        return [canvas_top_left.data[0], this.h - canvas_top_left.data[1], d.data[0], -d.data[1]]
    }
}

class GameField {
    constructor(canvas) {
        this.canvas = canvas.get(0);
        this.hex_side = 20;
        this.camera = [-50, -200];
        this.hovered = null;
        this.selected = null;
        this.x = 10;
        this.y = 10;
    }

    draw() {
        var ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, 400, 400);
        for (var i = 0; i < this.x; i++) {
            for (var j = 0; j < this.y; j++) {
                if (this.hovered != null && this.hovered[0] == i && this.hovered[1] == j) {
                    this.draw_hex(i, j, 'fill', '(0, 255, 0, 0.5)');
                } else {
                    this.draw_hex(i, j, 'stroke', '(0, 0, 0, 1)');
                }
            }
        }
    }

    draw_hex(i, j, mode, color) {
        var ctx = this.canvas.getContext('2d');
        var h = this.hex_side * Math.sqrt(3) / 2;
        var w = this.hex_side / 2;
        var center_x = (this.hex_side + w) * i - this.camera[0];
        var center_y = 2 * h * j - h * i - this.camera[1];
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
        var ctx = this.canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.font = '10px Times New Roman';
        ctx.fillText(`${i} ${j}`, center_x - w, center_y + h / 2);
    }

    move(dx, dy) {
        this.camera[0] -= dx;
        this.camera[1] -= dy;
    }

    get_hex(x, y) {
        x = x + this.camera[0];
        y = y + this.camera[1];
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
}

class MarketTable {
    constructor(container) {
        this.data = [];
        this.container = container;
        this.table = $('<table>');
    }

    draw() {
        this.container.empty();
        this.container.append(this.table);
    }

    update(data = []) {
        this.data = data;
        this.table = $('<table>');
        var header = this.populate_row($('<tr>'), ['type', 'tag', 'amount', 'price', 'name']);
        this.table.append(header);
        for (var i of this.data) {
            var row = this.populate_row($('<tr>'), [i.typ, i.tag, i.amount, i.price, i.owner_name]);
            this.table.append(row);
        }
        this.draw();
    }

    populate_row(row, l) {
        for (var i of l) {
            row.append($('<td>').text(i));
        }
        return row;
    }

}

class SkillTree {
    constructor(container, socket) {
        this.data = {};
        this.container = container;
        this.table = $('<table>');
        this.socket = socket;
        this.levels = null;
    }

    draw() {
        this.container.empty();
        this.container.append(this.table);
    }

    update(data = {}, levels = {}) {
        this.data = data;
        this.levels = levels;
        this.table = $('<table>');
        var header = this.populate_row($('<tr>'), ['skill', 'desc', 'button', 'skill_level']);
        this.table.append(header);
        for (var i in this.data) {
            var row = $('<tr>');
            var skill = this.data[i];
            row.append($('<td>').text(skill.tag));
            row.append($('<td>').text('required level ' + skill.req_level));
            var tmp = $('<td>');
            var tag = skill.tag;
            ((tag) => tmp.append($('<button/>')
                .text('+')
                .click(() => send_skill_up_message(this.socket, tag))
            ))(tag)
            row.append(tmp);
            tmp = 0;
            if (skill.tag in levels) {
                tmp = levels[skill.tag];
            }
            row.append($('<td>').text(tmp));
            this.table.append(row);
        }
        this.draw();
    }

    populate_row(row, l) {
        for (var i of l) {
            row.append($('<td>').text(i));
        }
        return row;
    }
}

class TacticScreen {
    constructor(container, socket) {
        this.data = {};
        this.select_trigger_target = [];
        this.select_trigger_value_tag = [];
        this.select_trigger_sign = [];
        this.input_trigger_value = [];
        this.select_action_target = [];
        this.select_action_action = [];
        this.tactic_block = [];
        this.container = container;
        this.socket = socket;
        this.list_length = 10
        var tmp_form = $('<form/>');
        ((socket) => container.append($('<button/>')
            .text('save')
            .click(() => {
                send_tactic(socket, this.get_tactic()); return false
            })))(this.socket);
        container.append($('<button/>')
            .text('reset')
            .click(() => {this.reset_tactic(); return false}));
        for (var i = 0; i < this.list_length; i++) {
            this.tactic_block.push($('<tr>'));
            
            var trigger_row = $('<tr>');
            this.select_trigger_target.push($(`<select id="${i}-trigger-target"></select>`));
            this.select_trigger_value_tag.push($(`<select id="${i}-trigger-value_tag"></select>`));
            this.select_trigger_sign.push($(`<select id="${i}-trigger-sign"></select>`));
            this.input_trigger_value.push($(`<input id="${i}-trigger-value">`));
            var trigger_row_2 = $('<td>');
            trigger_row_2.append(this.select_trigger_target[i]);
            trigger_row_2.append(this.select_trigger_value_tag[i]);
            trigger_row_2.append(this.select_trigger_sign[i]);
            trigger_row_2.append(this.input_trigger_value[i]);
            trigger_row.append($('<td>').text('trigger'))
            trigger_row.append(trigger_row_2);
            
            var action_row = $('<tr>');            
            this.select_action_target.push($(`<select id="${i}-action-target"></select>`));
            this.select_action_action.push($(`<select id="${i}-action-action"></select>`));
            var action_row_2 = $('<td>');
            action_row_2.append(this.select_action_target[i]);
            action_row_2.append(this.select_action_action[i]);
            action_row.append($('<td>').text('action'));
            action_row.append(action_row_2);
            
            this.tactic_block[i].append(`<td>${i}</td>`);

            var tmp = $('<td>');
            tmp.append(trigger_row);
            tmp.append(action_row);
            this.tactic_block[i].append(trigger_row);
            this.tactic_block[i].append(action_row);
            tmp_form.append(this.tactic_block[i]);
        }
        this.container.append(tmp_form);
    };
    
    update(data) {
        this.data = data;
    }
    
    get_tactic() {
        var tactic = {};
        for (var i = 0; i < this.list_length; i++) {
            tactic['s' + i] = {
                trigger: {
                    target: this.select_trigger_target[i].val(),
                    tag: this.select_trigger_value_tag[i].val(),
                    sign: this.select_trigger_sign[i].val(),
                    value: parseInt(this.input_trigger_value[i].val()),
                },
                action: {
                    target: this.select_action_target[i].val(),
                    action: this.select_action_action[i].val(),
                }
            }
            var trigger = tactic['s' + i].trigger;
            var action = tactic['s' + i].action;
            // if (undefined in [trigger.target, trigger.tag, trigget.sign, trigger.value, action.target, action.action]) {
                // tactic['s' + i] = undefined;
            // }
        }
        return tactic;
    }
    
    reset_tactic() {
        var counter = 0;
        console.log(this.data);
        for (var i in this.data) {
            var slot = this.data[i]
            if (slot != null) {
                $(`#${counter}-trigger-target`).val(slot.trigger.target).change();
                $(`#${counter}-trigger-value_tag`).val(slot.trigger.tag).change();
                $(`#${counter}-trigger-sign`).val(slot.trigger.sign).change();
                $(`#${counter}-trigger-value`).val(slot.trigger.value).change();
                $(`#${counter}-action-target`).val(slot.action.target).change();
                $(`#${counter}-action-action`).val(slot.action.action).change();
                this.tactic_block[counter].show()
            }
            else {
                this.tactic_block[counter].hide()
            }
            counter += 1;
        }
        for (counter; counter < this.list_length; counter++) {
            this.tactic_block[counter].hide()
        }
    }
    
    update_tags(tags) {
        // console.log(tags);
        for (var target_tag of tags.target) {
            for (var i = 0; i < this.list_length; i++) {
                this.select_trigger_target[i].append($('<option>').val(target_tag).text(target_tag));
                this.select_action_target[i].append($('<option>').val(target_tag).text(target_tag));
            }
        };
        for (var value_tag of tags.value_tags) {
            for (var i = 0; i < this.list_length; i++) {
                this.select_trigger_value_tag[i].append($('<option>').val(value_tag).text(value_tag))
            }
        };
        for (var sign of tags.signs) {
            for (var i = 0; i < this.list_length; i++) {
                this.select_trigger_sign[i].append($('<option>').val(sign).text(sign))
            }
        };
        for (var action of tags.actions) {
            for (var i = 0; i < this.list_length; i++){
                this.select_action_action[i].append($('<option>').val(action).text(action))
            }
        }
    }
};

function get_pos_in_canvas(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
}

function send_skill_up_message(socket, tag) {
    console.log(tag)
    socket.emit('up-skill', tag);
}

function send_tactic(socket, tactic) {
    console.log(tactic);
    socket.emit('set-tactic', tactic);
}

$(function() {
    var SKILLS = {};
    var socket = io();
    var selected = null;
    var game_field = new GameField($('#game-field'));
    game_field.draw()
    var market_table = new MarketTable($('#market'));
    var char_image = new CharacterImage($('#char-image'), $('#tmp-canvas'));
    var skill_tree = new SkillTree($('#skill-tree'), socket);
    var tactic_screen = new TacticScreen($('#tactic'), socket);
    var battle_image = new BattleImage($('#battle-canvas'), $('#battle-canvas-tmp'))
    $('#battle-canvas-tmp').hide();
    for (var i = 200; i > 0; i -= 5) {
        battle_image.add_fighter(i, 'test', i)
    }
    
    function draw(tmp) {
        if (check_loading()) {
            char_image.draw()
            battle_image.draw()
        } 
        game_field.draw();
        window.requestAnimationFrame(draw);
    }

    window.requestAnimationFrame(draw);
    market_table.update();
    var prev_mouse_x = null;
    var prev_mouse_y = null;
    var is_dragging = false;
    socket.emit('get-market-data', null);

    $('#game-field').hide();
    $('#market').hide();
    $('#sell-form-con').hide();
    $('#skill-tree').hide();
    $('#tactic').hide()

    $('#game-field').mousedown(() => {
        is_dragging = true;
        prev_mouse_x = null;
        prev_mouse_y = null;
    });

    $(window).mouseup(() => {
        is_dragging = false;
    });

    $('#game-field').mousemove(event => {
        if (is_dragging) {
            if (prev_mouse_x != null) {
                var dx = event.pageX - prev_mouse_x;
                var dy = event.pageY - prev_mouse_y;
                game_field.move(dx, dy);
            }
            prev_mouse_x = event.pageX;
            prev_mouse_y = event.pageY;
        }
        var mouse_pos = get_pos_in_canvas(game_field.canvas, event);
        var hovered_hex = game_field.get_hex(mouse_pos.x, mouse_pos.y);
        game_field.hover_hex(hovered_hex[0], hovered_hex[1]);
    });

    $('#login-frame').submit(e => {
        e.preventDefault();
        socket.emit('login', {login: $('#login-l').val(), password: $('#password-l').val()});
    });

    $('#reg-frame').submit(e => {
        e.preventDefault();
        socket.emit('reg', {login: $('#login-r').val(), password: $('#password-r').val()});
    });

    $('#send-message-frame').submit(e => {
        e.preventDefault();
        socket.emit('new-message', $('#message').val())
    })

    $('#buy-form-con').submit(e => {
        e.preventDefault();
        socket.emit('buy', {tag: $('#buy-tag-select').val(),
                            amount: $('#buy-amount').val(),
                            money: $('#buy-money').val(),
                            max_price: $('#buy-max-price').val()});
    });

    $('#sell-form-con').submit(e => {
        e.preventDefault();
        socket.emit('sell', {tag: $('#sell-tag-select').val(),
                             amount: $('#sell-amount').val(),
                             price: $('#sell-price').val()});
    });

    $('#users-list').on('click', 'li', function() {
        if (selected == this){
            $(selected).removeClass('selected');
            selected = null;
        } else if (selected != null) {
            $(selected).removeClass('selected');
            $(this).addClass('selected');
            selected = this;
        } else {
            $(this).addClass('selected');
            selected = this;
        }
    });

    $('#attack-button').click(() => {
        socket.emit('attack', null);
    });

    $('#show-log').click(() => {
        $('#game-field').hide();
        $('#game-log').show();
        $('#market').hide();
        $('#skill-tree').hide();
        $('#tactic').hide();
    });

    $('#show-map').click(() => {
        game_field.draw();
        $('#game-field').show();
        $('#game-log').hide();
        $('#market').hide();
        $('#skill-tree').hide();
        $('#tactic').hide();
    });

    $('#show-market').click(() => {
        $('#game-field').hide();
        $('#game-log').hide();
        $('#market').show();
        $('#skill-tree').hide();
        $('#tactic').hide();
    });

    $('#show-skill-tree').click(() => {
        $('#game-field').hide();
        $('#game-log').hide();
        $('#market').hide();
        $('#skill-tree').show();
        $('#tactic').hide();
    })

    $('#show-tactic').click(() => {
        $('#game-field').hide();
        $('#game-log').hide();
        $('#market').hide();
        $('#skill-tree').hide();
        $('#tactic').show();
    })

    $('#show-buy-form').click(() => {
        $('#buy-form-con').show();
        $('#sell-form-con').hide();
    });

    $('#show-sell-form').click(() => {
        $('#buy-form-con').hide();
        $('#sell-form-con').show();
    });

    socket.on('tags', msg => {
        for (var tag of msg) {
            $('#buy-tag-select').append($('<option>').val(tag).text(tag));
            $('#sell-tag-select').append($('<option>').val(tag).text(tag));
        }
    });
    
    socket.on('tags-tactic', msg => {
        tactic_screen.update_tags(msg);
    })

    

    // socket.on('new-user-online', msg => {
    //     $('#users-list').append($('<li>').text(msg));
    // });

    socket.on('users-online', msg => {
        $('#users-list').empty();
        msg.forEach(item => {
            $('#users-list').append($('<li>').text(msg));
        })
    });

    socket.on('log-message', msg => {
        $('#game-log').append($('<p>').text('[LOG] ' + msg));
    });

    socket.on('new-message', msg => {
        if (msg != 'message-too-long')
            $('#game-log').append($('<p>').text(msg.user + ' : ' + msg.msg));
    })

    socket.on('char-info', msg => {
        $('#char-info').empty();
        $('#char-info').append($('<p>').text(`name: ${msg.name}`));
        $('#char-info').append($('<p>').text(`hp:${msg.hp}/${msg.max_hp}`));
        $('#char-info').append($('<p>').text(`exp: ${msg.data.exp}`));
        $('#char-info').append($('<p>').text(`level: ${msg.data.level}`));
        $('#char-info').append($('<p>').text(`skill points: ${msg.data.skill_points}`));
        $('#char-info').append($('<p>').text(`savings: ${msg.savings.data['standard_money']}`));
        for (let i in msg.data.stats) {
            $('#char-info').append($('<p>').text(`${i}: ${msg.data.stats[i]}`));
        };
        $('#char_info').append($('<p>').text(`${msg.data.other}`));
        for (let i in msg.data.other) {
            $('#char-info').append($('<p>').text(`${i}: ${msg.data.other[i]}`));
        }
        char_image.update(msg.data.other.rage, msg.data.other.blood_covering, msg.data.stats.pow)
        skill_tree.update(SKILLS, msg.data.skills);
        tactic_screen.update(msg.data.tactic)
        for (let i in msg.stash) {
            $('#char-info').append($('<p>').text(`${i}: ${msg.stash[i]}`));
        };
    });

    socket.on('battle-has-started', data => {
        battle_image.clear()
        battle_image.load(data)
    })

    socket.on('battle-update', data => {
        battle_image.update(data)
    })

    socket.on('battle-has-ended', data => {
        battle_image.clear()
    })

    socket.on('skill-tree', data => {
        SKILLS = data;
    })

    socket.on('market-data', data => {
        market_table.update(data);
    })

    socket.on('alert', msg => {
        alert(msg);
    });
});
