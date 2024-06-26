"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Character = exports.NotificationResponse = exports.ResponseOK = void 0;
const content_1 = require("../../../.././../game_content/src/content");
const basic_functions_1 = require("../../calculations/basic_functions");
const max_hp_1 = require("../../races/max_hp");
const types_1 = require("../../types");
const data_id_1 = require("../data_id");
const equip_1 = require("./equip");
const savings_1 = require("./savings");
const stash_1 = require("./stash");
exports.ResponseOK = {
    response: "OK"
};
var NotificationResponse;
(function (NotificationResponse) {
    NotificationResponse.InBattle = {
        response: "Notification:",
        value: "You are in battle.",
        tag: "condition_failed"
    };
    NotificationResponse.ShopOpened = {
        response: "Notification:",
        value: "Can't move with shop",
        tag: "condition_failed"
    };
})(NotificationResponse || (exports.NotificationResponse = NotificationResponse = {}));
class Character {
    constructor(id, battle_id, user_id, location_id, name, template) {
        if (id == undefined) {
            this.id = data_id_1.DataID.Character.new_id(location_id);
        }
        else {
            this.id = id;
            data_id_1.DataID.Character.register(id, location_id);
        }
        this.battle_id = battle_id;
        this.user_id = user_id;
        this.next_cell = 0;
        this.name = name;
        this.model = template.model;
        this.ai_map = template.ai_map;
        this.ai_battle = template.ai_battle;
        this.race = template.race;
        this.stats = template.stats;
        this.resists = template.resists;
        this.max_hp = template.max_hp;
        this.location_id = location_id;
        this.equip = new equip_1.Equip();
        this.stash = new stash_1.Stash();
        this.trade_stash = new stash_1.Stash();
        this.savings = new savings_1.Savings();
        this.trade_savings = new savings_1.Savings();
        this.status = new types_1.Status();
        this.status.blood = 0;
        this.status.fatigue = 0;
        this.status.rage = 0;
        this.status.hp = max_hp_1.MaxHP[template.max_hp];
        this.status.stress = 0;
        this.cleared = false;
        this.action_progress = 0;
        this.action_duration = 0;
        this.current_ai_action = "idle";
        this.ai_price_buy_expectation = content_1.MaterialConfiguration.ones_record;
        this.ai_price_sell_expectation = content_1.MaterialConfiguration.ones_record;
        this.ai_price_buy_log_precision = content_1.MaterialConfiguration.zero_record;
        this.ai_price_sell_log_precision = content_1.MaterialConfiguration.zero_record;
        this.ai_desired_stash = new stash_1.Stash();
        this.ai_gathering_target = new stash_1.Stash();
        this._skills = content_1.SkillConfiguration.zero_record;
        this._perks = content_1.PerkConfiguration.zero_record;
        this._traits = {};
        this.action_points_left = 0;
        this.action_points_max = 10;
        this.open_shop = false;
        this.next_turn_after = 1;
        this.position = {
            x: 0,
            y: 0
        };
        this.team = 0;
        this.dodge_turns = 0;
        this.explored = [];
    }
    set battle_id(x) {
        data_id_1.DataID.Connection.set_character_battle(this.id, x);
    }
    get battle_id() {
        return data_id_1.DataID.Character.battle_id(this.id);
    }
    set user_id(x) {
        data_id_1.DataID.Connection.set_character_user(this.id, x);
    }
    get user_id() {
        return data_id_1.DataID.Character.user_id(this.id);
    }
    set location_id(location) {
        data_id_1.DataID.Connection.set_character_location(this.id, location);
    }
    get location_id() {
        return data_id_1.DataID.Character.location_id(this.id);
    }
    set home_location_id(location) {
        data_id_1.DataID.Connection.set_character_home(this.id, location);
    }
    get home_location_id() {
        return data_id_1.DataID.Character.home_location_id(this.id);
    }
    get cell_id() {
        return data_id_1.DataID.Location.cell_id(this.location_id);
    }
    set_model_variation(data) {
        this.model_variation = data;
    }
    /**
     * Changes the status of a given type by a specified amount and returns a boolean indicating success.
     *
     * @param {status_type} type - the type of status to change
     * @param {number} x - the amount to change the status by
     * @return {boolean} true if the status was successfully changed, false if the new value is the same as the old value
     */
    _change(type, x) {
        let tmp = this.status[type];
        let new_status = tmp + x;
        let max = 100;
        if (type == 'hp') {
            max = max_hp_1.MaxHP[this.max_hp];
        }
        new_status = (0, basic_functions_1.trim)(new_status, 0, max);
        return this._set(type, new_status);
    }
    get_name() {
        if (!this.dead())
            return this.name;
        if (this.skinned != true) {
            return `Corpse of ${(0, types_1.model_interface_name)(this.model)}`;
        }
        if ((0, types_1.skeleton)(this.model) && (this.bones_removed != true)) {
            return `Skeleton of ${(0, types_1.model_interface_name)(this.model)}`;
        }
        return `Traces of something`;
    }
    _change_hp(x) {
        return this._change('hp', x);
    }
    _change_rage(x) {
        return this._change('rage', x);
    }
    _change_blood(x) {
        return this._change('blood', x);
    }
    /**
     * Changes the fatigue level by the given amount.
     *
     * @param {number} x - The amount to change the fatigue level by.
     * @return {boolean} - False if fatigue was not changed, true if it was.
     */
    _change_fatigue(x) {
        return this._change('fatigue', x);
    }
    /**
     * Changes the stress level by the given amount.
     *
     * @param {number} x - The amount to change the stress level by.
     * @return {boolean} - False if stress was not changed, true if it was.
     */
    _change_stress(x) {
        return this._change('stress', x);
    }
    /**
    * Sets the value of a status type to a given number.
    *
    * @param {status_type} type - The type of status to set.
    * @param {number} x - The value to set the status to.
    * @return {boolean} Returns true if the value was set successfully, false if the value had not changed.
    */
    _set(type, x) {
        if (this.status[type] == x)
            return false;
        this.status[type] = x;
        return true;
    }
    _set_fatigue(x) {
        return this._set('fatigue', x);
    }
    _set_hp(x) {
        return this._set('hp', x);
    }
    _set_rage(x) {
        return this._set('rage', x);
    }
    _set_stress(x) {
        return this._set('stress', x);
    }
    _set_blood(x) {
        return this._set('blood', x);
    }
    _set_status(dstatus) {
        this.status.blood = dstatus.blood;
        this.status.rage = dstatus.rage;
        this.status.stress = dstatus.stress;
        this.status.hp = dstatus.hp;
        this.status.fatigue = dstatus.fatigue;
    }
    _change_status(dstatus) {
        this._change_hp(dstatus.hp);
        this._change_rage(dstatus.rage);
        this._change_stress(dstatus.stress);
        this._change_blood(dstatus.blood);
        this._change_fatigue(dstatus.fatigue);
    }
    get_hp() {
        return this.status.hp;
    }
    get_max_hp() {
        return max_hp_1.MaxHP[this.max_hp];
    }
    get_blood() {
        return this.status.blood;
    }
    get_rage() {
        return this.status.rage;
    }
    get_fatigue() {
        return this.status.fatigue;
    }
    get_stress() {
        return this.status.stress;
    }
    get hp() {
        return this.status.hp;
    }
    get hp_max() {
        return max_hp_1.MaxHP[this.max_hp];
    }
    get blood() {
        return this.status.blood;
    }
    get rage() {
        return this.status.rage;
    }
    get fatigue() {
        return this.status.fatigue;
    }
    get stress() {
        return this.status.stress;
    }
    is_player() { return this.user_id != undefined; }
    dead() { return this.get_hp() == 0; }
    in_battle() { return (this.battle_id != undefined); }
    get slowness() {
        return 100;
    }
    get action_units_per_turn() {
        return 4;
    }
}
exports.Character = Character;

