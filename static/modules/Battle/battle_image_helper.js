const NAMEPLATE_SHIFT_X = 0;
const NAMEPLATE_SHIFT_Y = 0;
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
            battle.add_fighter(this.unit, this.data.tag, this.data.position, this.data.range, this.data.name, this.data.hp, this.data.max_hp, this.data.ap);
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
    constructor(unit, target) {
        this.type = 'attack';
        this.unit_id = unit;
        this.target_id = target;
    }
    effect(battle) {
        let unit_view_attacker = battle.units_views[this.unit_id];
        let unit_view_defender = battle.units_views[this.target_id];
        let direction_vec = position_c.diff(unit_view_attacker.position, unit_view_defender.position);
        direction_vec = position_c.scalar_mult(1 / position_c.norm(direction_vec), direction_vec);
        unit_view_defender.animation_sequence.push({ type: 'attacked', data: { direction: direction_vec, dodge: false } });
        unit_view_attacker.animation_sequence.push({ type: 'attack', data: direction_vec });
        // unit_view_defender.animation_sequence.push('attack')
    }
    generate_log_message(battle) {
        let unit = battle.units_data[this.unit_id];
        let target = battle.units_data[this.target_id];
        let result = unit.name + ' attacks ' + target.name + ': ';
        return result + ' HIT!';
    }
}
export class MissEvent {
    constructor(unit, target) {
        this.type = 'miss';
        this.unit_id = unit;
        this.target_id = target;
    }
    effect(battle) {
        let unit_view_attacker = battle.units_views[this.unit_id];
        let unit_view_defender = battle.units_views[this.target_id];
        let direction_vec = position_c.diff(unit_view_attacker.position, unit_view_defender.position);
        direction_vec = position_c.scalar_mult(1 / position_c.norm(direction_vec), direction_vec);
        unit_view_defender.animation_sequence.push({ type: 'attacked', data: { direction: direction_vec, dodge: true } });
    }
    generate_log_message(battle) {
        let unit = battle.units_data[this.unit_id];
        let target = battle.units_data[this.target_id];
        let result = unit.name + ' attacks ' + target.name + ': ';
        return result + ' MISS!';
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
    constructor(id, name, hp, max_hp, ap, range, position, tag) {
        this.id = id;
        this.name = name;
        this.hp = hp;
        this.max_hp = max_hp;
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
