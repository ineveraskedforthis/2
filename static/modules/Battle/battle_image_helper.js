export const BATTLE_SCALE = 50;
export const BATTLE_MOVEMENT_SPEED = 4;
export const BATTLE_ANIMATION_TICK = 1 / 15;
export const BATTLE_ATTACK_DURATION = 0.5;
export var position_c;
(function (position_c) {
    function diff(a, b) {
        return { x: a.x - b.x, y: a.y - b.y };
    }
    position_c.diff = diff;
    function dist(a, b) {
        return norm(diff(b, a));
    }
    position_c.dist = dist;
    function norm(a) {
        return Math.sqrt(a.x * a.x + a.y * a.y);
    }
    position_c.norm = norm;
    function sum(a, b) {
        return { x: a.x + b.x, y: a.y + b.y };
    }
    position_c.sum = sum;
    function scalar_mult(x, a) {
        return { x: x * a.x, y: x * a.y };
    }
    position_c.scalar_mult = scalar_mult;
    function battle_to_canvas(pos, canvas_h, canvas_w) {
        let centre = { x: pos.y, y: pos.x };
        centre.x = -centre.x * BATTLE_SCALE + 520;
        centre.y = centre.y * BATTLE_SCALE + canvas_h / 2;
        return raw_to_canvas(centre);
    }
    position_c.battle_to_canvas = battle_to_canvas;
    function canvas_to_battle(pos, canvas_h, canvas_w) {
        let tmp = { x: pos.x, y: pos.y };
        tmp.x = (tmp.x - 520) / (-BATTLE_SCALE);
        tmp.y = (tmp.y - canvas_h / 2) / (BATTLE_SCALE);
        return raw_to_battle({ x: tmp.y, y: tmp.x });
    }
    position_c.canvas_to_battle = canvas_to_battle;
    function raw_to_battle(pos) {
        return pos;
    }
    position_c.raw_to_battle = raw_to_battle;
    function raw_to_canvas(pos) {
        return pos;
    }
    position_c.raw_to_canvas = raw_to_canvas;
    function image_to_canvas(position, image, images) {
        let w = image.get_w(images);
        let h = image.get_h(images);
        return [position.x - w / 10, position.y - h / 5 + 10, w / 5, h / 5];
    }
    position_c.image_to_canvas = image_to_canvas;
})(position_c || (position_c = {}));
export function draw_image(context, image, x, y, w, h) {
    context.drawImage(image, x, y, w, h);
}
export function get_mouse_pos_in_canvas(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    let tmp = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
    return position_c.raw_to_canvas(tmp);
}
export class AnimatedImage {
    constructor(image_name) {
        this.tag = image_name;
        this.current = 0;
        this.action = 'idle';
        this.animation_tick = 0;
    }
    get_image_name() {
        return this.tag + '_' + this.action + '_' + ("0000" + this.current).slice(-4);
    }
    update(dt, images) {
        this.animation_tick += dt;
        while (this.animation_tick > BATTLE_ANIMATION_TICK) {
            this.current += 1;
            this.animation_tick = this.animation_tick - BATTLE_ANIMATION_TICK;
            if (!(this.get_image_name() in images)) {
                this.current = 0;
            }
        }
    }
    set_action(tag) {
        if (tag != this.action) {
            this.action = tag;
            this.current = 0;
        }
    }
    get_w(images) {
        return images[this.get_image_name()].width;
    }
    get_h(images) {
        return images[this.get_image_name()].height;
    }
    // data is [x, y, w, h]
    draw(ctx, data, images) {
        draw_image(ctx, images[this.get_image_name()], Math.floor(data[0]), Math.floor(data[1]), Math.floor(data[2]), Math.floor(data[3]));
    }
}
export class MovementBattleEvent {
    constructor(unit_id, target) {
        this.type = 'movement';
        this.target = target;
        this.unit_id = unit_id;
    }
    effect(battle) {
        let unit_view = battle.units_views[this.unit_id];
        unit_view.animation_sequence.push({ type: 'move', data: '' });
    }
    generate_log_message(battle) {
        let unit = battle.units_data[this.unit_id];
        return unit.name + ' moved (' + this.target.x + ' ' + this.target.y + ')';
    }
}
export class UpdateDataEvent {
    constructor(unit_id, data) {
        this.unit = unit_id;
        this.data = data;
        this.type = 'update';
    }
    effect(battle) {
        if (battle.units_data[this.unit] == undefined) {
            battle.add_fighter(this.unit, this.data.tag, this.data.position, this.data.range, this.data.name, this.data.hp, this.data.ap);
        }
        battle.units_data[this.unit].update(this.data.hp, this.data.ap, this.data.position, this.data.range);
        battle.units_views[this.unit].animation_sequence.push({ type: 'update', data: '' });
    }
    generate_log_message() {
        return 'ok';
    }
}
export class ClearBattleEvent {
    constructor() {
        this.type = 'clear';
    }
    effect(battle) {
        console.log('clear battle');
        battle.reset_data();
        battle.in_progress = false;
    }
    generate_log_message() {
        return "battle is finished";
    }
}
function get_attack_direction(a, d) {
    let hor = 'left';
    if (a.position.x < d.position.x) {
        hor = 'right';
    }
    let ver = 'up';
    if (a.position.y < d.position.y) {
        ver = 'down';
    }
    return hor + '_' + ver;
}
export class AttackEvent {
    constructor(unit, target, data) {
        this.type = 'attack';
        this.unit_id = unit;
        this.target_id = target;
        this.data = data;
    }
    effect(battle) {
        let unit_view_attacker = battle.units_views[this.unit_id];
        let unit_view_defender = battle.units_views[this.target_id];
        let direction_vec = position_c.diff(unit_view_attacker.position, unit_view_defender.position);
        direction_vec = position_c.scalar_mult(1 / position_c.norm(direction_vec), direction_vec);
        if (this.data.flags.evade || this.data.flags.miss) {
            unit_view_defender.animation_sequence.push({ type: 'attacked', data: { direction: direction_vec, dodge: true } });
        }
        else {
            unit_view_defender.animation_sequence.push({ type: 'attacked', data: { direction: direction_vec, dodge: false } });
        }
        unit_view_attacker.animation_sequence.push({ type: 'attack', data: direction_vec });
        // unit_view_defender.animation_sequence.push('attack')
    }
    generate_log_message(battle) {
        let unit = battle.units_data[this.unit_id];
        let target = battle.units_data[this.target_id];
        let result = unit.name + ' attacks ' + target.name + ': ';
        if (this.data.flags.miss) {
            return result + ' MISS!';
        }
        if (this.data.flags.evade) {
            return result + ' DODGE!';
        }
        if (this.data.flags.crit) {
            return result + this.data.total_damage + ' damage (CRITICAL)';
        }
        return result + this.data.total_damage + ' damage';
    }
}
export class RetreatEvent {
    constructor(unit_id) {
        this.unit_id = unit_id;
        this.type = 'retreat';
    }
    effect(battle) {
        if (this.unit_id == battle.player_id) {
            alert('You had retreated from the battle');
        }
        else {
            alert('Someone had retreated from the battle');
        }
    }
    generate_log_message(battle) {
        let unit = battle.units_data[this.unit_id];
        return unit.name + ' retreats';
    }
}
export class NewTurnEvent {
    constructor(unit) {
        this.type = 'new_turn';
        this.unit = unit;
    }
    effect(battle) {
        battle.set_current_turn(this.unit);
    }
    generate_log_message() {
        return 'new_turn';
    }
}
export class BattleUnit {
    constructor(id, name, hp, ap, range, position, tag) {
        this.id = id;
        this.name = name;
        this.hp = hp;
        this.ap = ap;
        this.range = range;
        this.position = position;
        this.killed = false;
        if (hp == 0) {
            this.killed = true;
        }
        this.tag = tag;
    }
    update(hp, ap, position, range) {
        if (hp != undefined)
            this.hp = hp;
        if (ap != undefined)
            this.ap = ap;
        if (position != undefined)
            this.position = position;
        if (range != undefined)
            this.range = range;
        if (hp == 0) {
            this.killed = true;
        }
    }
}
export class BattleUnitView {
    constructor(unit) {
        this.unit = unit;
        this.killed = unit.killed;
        this.position = unit.position;
        this.ap = unit.ap;
        this.hp = unit.hp;
        this.animation_sequence = [];
        this.animation_timer = 0;
        this.animation_something = 0;
        this.a_image = new AnimatedImage(unit.tag);
    }
    update(battle) {
        if (battle.player_id == this.unit.id) {
            battle.update_player_actions_availability();
        }
        this.hp = this.unit.hp;
        this.ap = this.unit.ap;
        this.killed = this.unit.killed;
        let div = battle.container.querySelector('.enemy_list > .fighter_' + this.unit.id);
        div.innerHTML = this.unit.name + '<br> hp: ' + this.unit.hp + '<br> ap: ' + Math.floor(this.unit.ap * 10) / 10;
    }
    handle_events(dt, battle, images) {
        let unit = this.unit;
        let direction = position_c.diff(unit.position, this.position);
        let norm = position_c.norm(direction);
        //handling animation sequence 
        let flag_animation_finished = false;
        if (this.animation_sequence.length > 0) {
            let event = this.animation_sequence[0];
            switch (event.type) {
                case "move": {
                    // update position and change animation depending on movement
                    if (norm < BATTLE_MOVEMENT_SPEED * dt) {
                        this.position = unit.position;
                        this.a_image.set_action('idle');
                        flag_animation_finished = true;
                    }
                    else {
                        this.position = position_c.sum(this.position, position_c.scalar_mult(BATTLE_MOVEMENT_SPEED / norm * dt, direction));
                        this.a_image.set_action('move');
                    }
                    break;
                }
                case "attack": {
                    this.a_image.set_action('attack');
                    this.animation_timer += dt;
                    let scale = -Math.sin(this.animation_timer / BATTLE_ATTACK_DURATION * Math.PI) / 2;
                    let shift = position_c.scalar_mult(scale, event.data);
                    this.position = position_c.sum(this.unit.position, shift);
                    if (this.animation_timer > BATTLE_ATTACK_DURATION) {
                        flag_animation_finished = true;
                        this.animation_timer = 0;
                        this.position = this.unit.position;
                        this.animation_something = 1 - this.animation_something;
                    }
                    break;
                }
                case "attacked": {
                    this.animation_timer += dt;
                    if (event.data.dodge) {
                        let scale = -Math.sin(this.animation_timer / BATTLE_ATTACK_DURATION * Math.PI) * 2;
                        let shift = position_c.scalar_mult(scale, event.data.direction);
                        this.position = position_c.sum(this.unit.position, shift);
                    }
                    else {
                        let position = position_c.battle_to_canvas(this.unit.position, battle.h, battle.w);
                        battle.canvas_context.drawImage(images['attack_' + this.animation_something], position.x - 50, position.y - 80, 100, 100);
                    }
                    if (this.animation_timer > BATTLE_ATTACK_DURATION) {
                        flag_animation_finished = true;
                        this.animation_timer = 0;
                        this.position = this.unit.position;
                        this.animation_something = 1 - this.animation_something;
                    }
                    break;
                }
                case "update": {
                    this.update(battle);
                    flag_animation_finished = true;
                    break;
                }
            }
        }
        else {
            flag_animation_finished = true;
        }
        // remove one animation from sequence, when it is finished
        if ((flag_animation_finished) && (this.animation_sequence.length > 0)) {
            // console.log('animation finished')
            // console.log(this.animation_sequence[0].type)
            this.a_image.set_action('idle');
            this.animation_sequence.splice(0, 1);
        }
    }
    draw(dt, battle, images) {
        if (this.killed) {
            return;
        }
        let unit = this.unit;
        let pos = position_c.battle_to_canvas(this.position, battle.h, battle.w);
        let ctx = battle.canvas_context;
        //draw character attack radius circle and color it depending on it's status in ui
        ctx.strokeStyle = "rgba(0, 0, 0, 1)";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, BATTLE_SCALE * unit.range, 0, 2 * Math.PI);
        if (battle.selected == unit.id) {
            ctx.fillStyle = "rgba(10, 10, 200, 0.7)"; // blue if selecter
        }
        else if (battle.hovered == unit.id) {
            ctx.fillStyle = "rgba(0, 230, 0, 0.7)"; // green if hovered and not selecter
        }
        else {
            ctx.fillStyle = "rgba(200, 200, 0, 0.5)"; // yellow otherwise
        }
        ctx.fill();
        //draw a border of circle above
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, BATTLE_SCALE * unit.range, 0, 2 * Math.PI);
        ctx.stroke();
        //draw small circle at unit's base
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, BATTLE_SCALE / 10, 0, 2 * Math.PI);
        ctx.stroke();
        //draw nameplates
        ctx.font = '15px serif';
        // select style depending on hover/selection status
        if (battle.selected == unit.id) {
            ctx.fillStyle = "rgba(1, 1, 1, 1)";
            ctx.strokeStyle = "rgba(0, 0, 0, 1)";
        }
        else if (battle.hovered == unit.id) {
            ctx.fillStyle = "rgba(1, 1, 1, 1)";
            ctx.strokeStyle = "rgba(0, 0, 0, 1)";
        }
        else {
            ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
            ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
        }
        // draw an actual nameplate
        ctx.strokeRect(pos.x - 50, pos.y - 120, 100, 20);
        ctx.strokeRect(pos.x - 50, pos.y - 100, 100, 20);
        let string = unit.name;
        if (unit.id == battle.player_id) {
            string = string + '(YOU)';
        }
        ctx.fillText(string + ' || ' + this.hp + ' hp', pos.x - 45, pos.y - 105);
        ctx.fillText('ap:  ' + Math.floor(this.ap * 10) / 10, pos.x - 45, pos.y - 85);
        // draw character's image
        let image_pos = position_c.image_to_canvas(pos, this.a_image, images);
        this.a_image.draw(battle.canvas_context, image_pos, images);
        this.a_image.update(dt, images);
        this.handle_events(dt, battle, images);
    }
}
