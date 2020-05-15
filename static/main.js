'use strict'

var TACTIC_TAGS_TARGET = [];
var TACTIC_TAGS_VALUE_TAG = [];
var TACTIC_SIGN_SIGN_TAG = [];
var TACTIC_ACTION_TAG = [];










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
    var skill_tree = new SkillTree($('#skill-tree'), socket);
    var tactic_screen = new TacticScreen($('#tactic'), socket);    
    
    market_table.update();
    var prev_mouse_x = null;
    var prev_mouse_y = null;
    var is_dragging = false;
    socket.emit('get-market-data', null);

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
