import { AnimatedImage } from "./animation.js";
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
        this.orientation = 'right';
        this.timer = 0;
    }
    update(hp_change, ap_change) {
        this.hp_change = hp_change;
        this.ap_change = ap_change;
    }
}
