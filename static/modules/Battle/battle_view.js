import { AnimatedImage } from "./animation.js";
import { BattleImage, battle_canvas_context, player_unit_id } from "./battle_image.js";
import { position_c, } from "./battle_image_helper.js";
import { BATTLE_SCALE } from "./constants.js";
export class BattleUnitView {
    constructor(unit) {
        this.name = unit.name;
        this.unit = unit;
        this.killed = unit.killed;
        this.position = unit.position;
        this.ap = unit.ap;
        this.ap_change = 0;
        this.max_ap = 0;
        this.hp = unit.hp;
        this.max_hp = unit.max_hp;
        this.hp_change = 0;
        this.animation_timer = 0;
        this.animation_something = 0;
        this.a_image = new AnimatedImage(unit.tag);
    }
    update(hp_change, ap_change) {
        if (player_unit_id == this.unit.id) {
            BattleImage.update_player_actions_availability();
        }
        this.hp_change = hp_change;
        this.ap_change = ap_change;
        this.hp = this.unit.hp;
        this.ap = this.unit.ap;
        this.killed = this.unit.killed;
        let div = BattleImage.unit_div(this.unit.id);
        if (div != undefined)
            div.innerHTML = this.unit.name
                + '<br> hp: ' + this.unit.hp
                + '<br> ap: ' + Math.floor(this.unit.ap * 10) / 10;
    }
    draw(dt, selected, hovered, player_id) {
        if (this.killed) {
            return;
        }
        let unit = this.unit;
        let pos = position_c.battle_to_canvas(this.position);
        let ctx = battle_canvas_context;
        //draw character attack radius circle and color it depending on it's status in ui
        ctx.strokeStyle = "rgba(0, 0, 0, 1)";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, BATTLE_SCALE * unit.range, 0, 2 * Math.PI);
        if (selected == unit.id) {
            ctx.fillStyle = "rgba(10, 10, 200, 0.7)"; // blue if selecter
        }
        else if (hovered == unit.id) {
            ctx.fillStyle = "rgba(0, 230, 0, 0.7)"; // green if hovered and not selecter
        }
        else {
            ctx.fillStyle = "rgba(200, 200, 0, 0.5)"; // yellow otherwise
        }
        ctx.fill();
        // draw movement radius
        ctx.strokeStyle = "rgba(0, 0, 0, 1)";
        const MOVE_COST = 3;
        ctx.beginPath();
        ctx.setLineDash([20, 20]);
        ctx.arc(pos.x, pos.y, BATTLE_SCALE * (this.ap - this.ap_change) / MOVE_COST, 0, 2 * Math.PI);
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
        if (selected == unit.id) {
            ctx.fillStyle = "rgba(255, 255, 255, 1)";
            ctx.strokeStyle = "rgba(0, 0, 0, 1)";
        }
        else if (hovered == unit.id) {
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
            if (unit.id == player_id) {
                string = string + '(YOU)';
            }
            ctx.fillText(string + ' || ' + this.hp + ' hp', pos.x - 45, pos.y - 105);
            // draw ap string
            ctx.fillText('ap:  ' + Math.floor(this.ap * 10) / 10, pos.x - 45, pos.y - 85);
        }
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
            const width_change = this.ap_change * width_ap_1;
            const height_ap = 4;
            const ap_bar_margin_down = 73;
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
}
