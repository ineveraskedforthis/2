import { lerp, smoothstep } from "../../common.js";
import { UnitsListWidget } from "../Widgets/units_list.js";
import { AnimatedImage } from "../Entities/animation.js";
export class BattleStorage {
    static get units() {
        return this._units.slice();
    }
    static register_unit(unit) {
        if (this.units_data[unit.id] != undefined) {
            this.update_unit_data(unit);
            return;
        }
        this._units.push(unit.id);
        this.units_data[unit.id] = unit;
        this.units_data_past[unit.id] = unit;
        this.units_images[unit.id] = new AnimatedImage(unit.tag);
        this.associated_table.data.push(fatten_battle_character(unit.id));
    }
    static clear() {
        this._units = [];
        this.units_data = [];
        this.units_data_past = [];
        this.units_images = [];
        this.associated_table.data = [];
        this.event_timer = 0;
        this.fat_ids = [];
    }
    static update_unit_data(unit) {
        if (this.units_data[unit.id] == undefined) {
            console.log("attempt to update unit which doesn't exist in storage but who cares");
            return;
        }
        this.units_data[unit.id] = unit;
        this.update_display();
    }
    static update_old_keyframe() {
        for (const unit of this._units) {
            this.units_data_past[unit] = this.units_data[unit];
        }
    }
    static from_id(id) {
        return this.units_data[id];
    }
    static image_from_id(id) {
        return this.units_images[id];
    }
    static past_from_id(id) {
        return this.units_data_past[id];
    }
    static remove_unit(unit) {
        let index = 0;
        for (let character of BattleStorage.units) {
            if (character == unit)
                break;
            index++;
        }
        const character = BattleStorage.units[index];
        this._units.splice(index, 1);
        delete this.units_data[character];
    }
    static foreach(callback) {
        for (const item of this._units) {
            callback(item, this.units_data[item]);
        }
    }
    static update_display() {
        this.associated_table.update_display();
    }
}
BattleStorage._units = [];
//Real unit data
BattleStorage.units_data = [];
//Previous unit data
BattleStorage.units_data_past = [];
//Animation data
BattleStorage.units_images = [];
BattleStorage.associated_table = UnitsListWidget.enemies_list;
BattleStorage.event_timer = 0;
BattleStorage.event_timer_max = 0.5;
BattleStorage.fat_ids = [];
class CurrentUnit {
    constructor(id) {
        this.id = id;
        this.orientation = "right";
    }
    get past() {
        return BattleStorage.past_from_id(this.id);
    }
    get future() {
        return BattleStorage.from_id(this.id);
    }
    get name() {
        return BattleStorage.from_id(this.id).name;
    }
    get hp() {
        return smoothstep(this.past.hp, this.future.hp, BattleStorage.event_timer / BattleStorage.event_timer_max);
    }
    get hp_target() {
        return this.future.hp;
    }
    get max_hp() {
        return this.past.max_hp;
    }
    get ap() {
        return smoothstep(this.past.ap, this.future.ap, BattleStorage.event_timer / BattleStorage.event_timer_max);
    }
    get ap_target() {
        return this.future.ap;
    }
    get max_ap() {
        return this.past.max_ap;
    }
    get move_cost() {
        return smoothstep(this.past.move_cost, this.future.move_cost, BattleStorage.event_timer / BattleStorage.event_timer_max);
    }
    get next_turn() {
        return smoothstep(this.past.next_turn, this.future.next_turn, BattleStorage.event_timer / BattleStorage.event_timer_max);
    }
    get position() {
        const t = BattleStorage.event_timer / BattleStorage.event_timer_max;
        if (this.future.position.x > this.past.position.x) {
            this.orientation = "right";
        }
        if (this.future.position.x > this.past.position.x) {
            this.orientation = "left";
        }
        return {
            x: lerp(this.past.position.x, this.future.position.x, t),
            y: lerp(this.past.position.y, this.future.position.y, t)
        };
    }
    get range() {
        return smoothstep(this.past.range, this.future.range, BattleStorage.event_timer / BattleStorage.event_timer_max);
    }
}
export function fatten_battle_character(id) {
    if (BattleStorage.fat_ids[id] == undefined) {
        const unit = new CurrentUnit(id);
        BattleStorage.fat_ids[id] = unit;
    }
    return BattleStorage.fat_ids[id];
}
