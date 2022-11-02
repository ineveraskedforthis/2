import { AnimatedImage, position_c, BATTLE_MOVEMENT_SPEED, BATTLE_ATTACK_DURATION, BATTLE_SCALE } from "./battle_image_helper.js";
export class BattleUnitView {
    constructor(unit) {
        this.unit = unit;
        this.killed = unit.killed;
        this.position = unit.position;
        this.ap = unit.ap;
        this.ap_change = 0;
        this.hp = unit.hp;
        this.max_hp = unit.max_hp;
        this.hp_damaged = 0;
        this.animation_sequence = [];
        this.animation_timer = 0;
        this.animation_something = 0;
        this.a_image = new AnimatedImage(unit.tag);
    }
    update(battle) {
        if (battle.player_id == this.unit.id) {
            battle.update_player_actions_availability();
        }
        this.hp_damaged = this.hp_damaged + this.hp - this.unit.hp;
        this.ap_change = this.ap_change + this.ap - this.unit.ap;
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
        if (this.hp_damaged > 0) {
            this.hp_damaged = Math.max(this.hp_damaged - dt * 20, 0);
        }
        if (this.ap_change > 0) {
            this.ap_change = Math.max(this.ap_change - dt * 20, 0);
        }
        if (this.ap_change < 0) {
            this.ap_change = Math.min(this.ap_change + dt * 20, 0);
        }
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
        // draw movement radius
        const MOVE_COST = 3;
        ctx.beginPath();
        ctx.setLineDash([20, 20]);
        ctx.arc(pos.x, pos.y, BATTLE_SCALE * (this.ap + this.ap_change) / MOVE_COST, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
        //draw a border of circle above
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, BATTLE_SCALE * unit.range, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();
        //draw small circle at unit's base
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, BATTLE_SCALE / 10, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();
        //draw nameplates
        ctx.font = '15px serif';
        // select style depending on hover/selection status
        if (battle.selected == unit.id) {
            ctx.fillStyle = "rgba(255, 255, 255, 1)";
            ctx.strokeStyle = "rgba(0, 0, 0, 1)";
        }
        else if (battle.hovered == unit.id) {
            ctx.fillStyle = "rgba(255, 255, 255, 1)";
            ctx.strokeStyle = "rgba(0, 0, 0, 1)";
        }
        else {
            ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
            ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
        }
        // draw an actual nameplate
        {
            const nameplate_left = pos.x - 50;
            const nameplate_top = pos.y - 120;
            const nameplate_width = 100;
            const nameplate_height = 20;
            // name rect
            ctx.strokeRect(nameplate_left, pos.y - 120, nameplate_width, 20);
            // ap rect
            ctx.strokeRect(nameplate_left, pos.y - 100, nameplate_width, 20);
            //prepare and draw name string
            let string = unit.name;
            if (unit.id == battle.player_id) {
                string = string + '(YOU)';
            }
            ctx.fillText(string + ' || ' + this.hp + ' hp', pos.x - 45, pos.y - 105);
            // draw ap string
            ctx.fillText('ap:  ' + Math.floor(this.ap * 10) / 10, pos.x - 45, pos.y - 85);
        }
        // draw character's image
        let image_pos = position_c.image_to_canvas(pos, this.a_image, images);
        this.a_image.draw(battle.canvas_context, image_pos, images);
        this.a_image.update(dt, images);
        // draw hp bar:
        {
            ctx.fillStyle = "green";
            ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
            const width_hp_1 = 0.5;
            const width_max_hp = this.max_hp * width_hp_1;
            const width_hp = this.hp * width_hp_1;
            const width_damage = this.hp_damaged * width_hp_1;
            const height_hp = 10;
            const hp_bar_margin_down = 60;
            const hp_left = pos.x - width_max_hp / 2;
            const hp_top = pos.y - height_hp - hp_bar_margin_down;
            ctx.strokeRect(hp_left, hp_top, width_max_hp, height_hp);
            ctx.fillRect(hp_left, hp_top, width_hp, height_hp);
            ctx.fillStyle = "yellow";
            ctx.fillRect(hp_left + width_hp, hp_top, width_damage, height_hp);
        }
        // draw ap bar:
        {
            ctx.fillStyle = "rgb(0,0,255)";
            ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
            const width_ap_1 = 10;
            const width_max_ap = 10 * width_ap_1;
            const width_ap = this.ap * width_ap_1;
            const width_damage = this.ap_change * width_ap_1;
            const height_ap = 4;
            const ap_bar_margin_down = 73;
            const ap_left = pos.x - width_max_ap / 2;
            const ap_top = pos.y - height_ap - ap_bar_margin_down;
            ctx.fillStyle = "rgb(0,0,255)";
            ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
            ctx.strokeRect(ap_left, ap_top, width_max_ap, height_ap);
            ctx.fillRect(ap_left, ap_top, width_ap + width_damage, height_ap);
            if (width_damage < 0) { //ap is increasing
                ctx.fillStyle = "rgb(165,200,230)";
                ctx.fillRect(ap_left + width_ap + width_damage, ap_top, -width_damage, height_ap);
            }
            else { // ap is decreasing --- new ap is already here
                ctx.fillStyle = "yellow";
                ctx.fillRect(ap_left + width_ap, ap_top, width_damage, height_ap);
            }
        }
        this.handle_events(dt, battle, images);
    }
}
