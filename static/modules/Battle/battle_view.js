import { AnimatedImage } from "./animation.js";
import { BattleImage, battle_canvas_context, player_unit_id } from "./battle_image.js";
import { position_c, } from "./battle_image_helper.js";
import { BATTLE_SCALE } from "./constants.js";
export class BattleUnitView {
    constructor(unit) {
        this.id = unit.id;
        this.name = unit.name;
        this.range = unit.range;
        // this.unit = unit
        this.killed = (unit.hp == 0);
        this.position = unit.position;
        this.ap = unit.ap;
        this.ap_change = 0;
        this.max_ap = 0;
        this.hp = unit.hp;
        this.max_hp = unit.max_hp;
        this.hp_change = 0;
        this.animation_timer = 0;
        this.animation_something = 0;
        this.move_cost = unit.move_cost;
        this.next_turn = unit.next_turn;
        this.a_image = new AnimatedImage(unit.tag);
        this.timer = 0;
    }
    update(hp_change, ap_change) {
        if (player_unit_id == this.id) {
            BattleImage.update_player_actions_availability();
        }
        this.hp_change = hp_change;
        this.ap_change = ap_change;
        // this.hp = this.unit.hp
        // this.ap = this.unit.ap 
        // this.killed = this.unit.killed
        // let div = BattleImage.unit_div(this.unit.id)
        // if (div != undefined) div.innerHTML = this.unit.name 
        //                                       + '<br> hp: ' + this.unit.hp
        //                                       + '<br> ap: ' + Math.floor(this.unit.ap * 10) / 10
    }
    draw_circles(dt, ctx, pos, selected, hovered, player_id, current_turn) {
        //draw character attack radius circle and color it depending on it's status in ui
        ctx.strokeStyle = "rgba(0, 0, 0, 1)";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, BATTLE_SCALE * this.range, 0, 2 * Math.PI);
        if (selected == this.id) {
            ctx.fillStyle = "rgba(10, 10, 200, 0.7)"; // blue if selecter
        }
        else if (hovered == this.id) {
            ctx.fillStyle = "rgba(0, 230, 0, 0.7)"; // green if hovered and not selecter
        }
        else {
            ctx.fillStyle = "rgba(200, 200, 0, 0.5)"; // yellow otherwise
        }
        ctx.fill();
        // draw movement radius
        ctx.strokeStyle = "rgba(0, 0, 0, 1)";
        ctx.beginPath();
        ctx.setLineDash([20, 20]);
        ctx.arc(pos.x, pos.y, BATTLE_SCALE * (this.ap - this.ap_change) / this.move_cost, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
        //draw a border of circle above
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, BATTLE_SCALE * this.range, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();
        //draw small circle at unit's base
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, BATTLE_SCALE / 10, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();
        // draw waves from inner circle to outer for current turn
        if (this.id == current_turn) {
            let wave = Math.sin(this.timer);
            let radius_end = Math.max(BATTLE_SCALE * (this.ap - this.ap_change) / this.move_cost / 2, BATTLE_SCALE * this.range / 2, 5);
            let radius_start = BATTLE_SCALE / 10;
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            //draw small circle at unit's base
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius_end * Math.abs(wave) + radius_start * (1 - Math.abs(wave)), 0, 2 * Math.PI);
            ctx.closePath();
            ctx.stroke();
        }
        //mark player with something cool
        if (this.id == player_id) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.beginPath();
            const pi = Math.PI;
            let angle = this.timer * (this.ap / 5);
            let dx = Math.cos(angle) * BATTLE_SCALE * this.range;
            let dy = Math.sin(angle) * BATTLE_SCALE * this.range;
            ctx.moveTo(pos.x + dx, pos.y + dy);
            for (let i = 0; i < 20; i++) {
                angle = this.timer * (this.ap / 5) + 5 * pi * i / 6;
                let dx = Math.cos(angle) * BATTLE_SCALE * this.range;
                let dy = Math.sin(angle) * BATTLE_SCALE * this.range;
                ctx.lineTo(pos.x + dx, pos.y + dy);
            }
            // angle = this.timer + pi / 6
            // dx = Math.cos(angle) * BATTLE_SCALE * this.range
            // dy = Math.sin(angle) * BATTLE_SCALE * this.range
            // ctx.moveTo(pos.x + dx, pos.y + dy)
            // for (let i = 0; i < 4; i++) {
            //     let angle = this.timer + 2*pi * i / 3 + pi / 6
            //     let dx = Math.cos(angle) * BATTLE_SCALE * this.range
            //     let dy = Math.sin(angle) * BATTLE_SCALE * this.range
            //     ctx.lineTo(pos.x + dx, pos.y + dy)
            // }
            ctx.stroke();
        }
    }
    draw(dt, selected, hovered, player_id, current_turn) {
        if (this.killed) {
            return;
        }
        this.timer += dt;
        // let unit = this.unit
        let pos = position_c.battle_to_canvas(this.position);
        let ctx = battle_canvas_context;
        this.draw_circles(dt, ctx, pos, selected, hovered, player_id, current_turn);
        //draw nameplates
        // choose font
        ctx.font = '15px serif';
        // select style depending on hover/selection status
        if (selected == this.id) {
            ctx.fillStyle = "rgba(0, 0, 0, 1)";
            ctx.strokeStyle = "rgba(0, 0, 0, 1)";
        }
        else if (hovered == this.id) {
            ctx.fillStyle = "rgba(0, 0, 0, 1)";
            ctx.strokeStyle = "rgba(0, 0, 0, 1)";
        }
        else {
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        }
        // draw an actual nameplate
        this.draw_nameplate(pos, ctx, player_id);
        // draw character's image
        let image_pos = position_c.image_to_canvas(pos, this.a_image.get_w(), this.a_image.get_h());
        this.a_image.draw(battle_canvas_context, image_pos);
        this.a_image.update(dt);
        // draw hp bar:
        {
            ctx.fillStyle = "green";
            ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
            const width_hp_1 = 0.5;
            const width_max_hp = this.max_hp * width_hp_1;
            const width_hp = this.hp * width_hp_1;
            const width_damage = -this.hp_change * width_hp_1;
            const height_hp = 10;
            const hp_bar_margin_down = -40;
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
            const width_change = this.ap_change * width_ap_1;
            const height_ap = 4;
            const ap_bar_margin_down = -30;
            const ap_left = pos.x - width_max_ap / 2;
            const ap_top = pos.y - height_ap - ap_bar_margin_down;
            ctx.fillStyle = "rgb(0, 0, 255)";
            ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
            ctx.strokeRect(ap_left, ap_top, width_max_ap, height_ap);
            ctx.fillRect(ap_left, ap_top, width_ap, height_ap);
            if (width_change < 0) { //ap is increasing
                ctx.fillStyle = "yellow";
                ctx.fillRect(ap_left + width_ap, ap_top, -width_change, height_ap);
            }
            else { // ap is decreasing --- new ap is already here
                ctx.fillStyle = "yellow";
                ctx.fillRect(ap_left + width_ap - width_change, ap_top, width_change, height_ap);
            }
        }
    }
    draw_nameplate(pos, ctx, player_id) {
        {
            const nameplate_left = pos.x - 50;
            const nameplate_top = pos.y + 50;
            const nameplate_width = 100;
            const nameplate_height = 20;
            // name rect
            ctx.strokeRect(nameplate_left, nameplate_top, nameplate_width, nameplate_height);
            // ap rect
            ctx.strokeRect(nameplate_left, nameplate_top + 20, nameplate_width, nameplate_height);
            //prepare and draw name string
            let string = this.name;
            if (this.id == player_id) {
                string = string + '(YOU)';
            }
            ctx.fillText(string + ' || ' + this.hp + ' hp', nameplate_left + 5, nameplate_top + 15);
            // draw ap string
            ctx.fillText('ap:  ' + Math.floor(this.ap * 10) / 10, nameplate_left + 5, nameplate_top + 20 + 15);
        }
    }
}
