"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cell = void 0;
const systems_communication_js_1 = require("../systems_communication.js");
class Cell {
    // orders_bulk: Set<order_bulk_id>
    // orders_item: Set<order_item_id>
    constructor(id, x, y, name, development, res, terrain) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.name = name;
        this.visited_recently = false;
        this.last_visit = 0;
        this.changed_characters = true;
        // this.orders_bulk = new Set()
        // this.orders_item = new Set()
        this.characters_set = new Set();
        this.saved_characters_list = [];
        if (development == undefined) {
            this.development = { rural: 0, urban: 0, wild: 0, ruins: 0, wastelands: 0 };
        }
        else {
            this.development = development;
        }
        if (res == undefined) {
            this.resources = { water: false, prey: false, forest: false, fish: false };
        }
        else {
            this.resources = res;
        }
        if (terrain == undefined) {
            this.terrain = 'void';
        }
        else {
            this.terrain = terrain;
        }
    }
    enter(id) {
        this.characters_set.add(id);
        this.changed_characters = true;
        this.visited_recently = true;
        this.last_visit = 0;
    }
    exit(id) {
        this.characters_set.delete(id);
        this.changed_characters = true;
    }
    get_characters_list() {
        if (this.changed_characters) {
            this.changed_characters = false;
            let result = [];
            for (let item of this.characters_set.values()) {
                let character = systems_communication_js_1.Convert.id_to_character(item);
                if (!character.dead()) {
                    let return_item = { id: item, name: character.name };
                    result.push(return_item);
                }
            }
            this.saved_characters_list = result;
            return result;
        }
        return this.saved_characters_list;
    }
    get_characters_id_set() {
        return this.characters_set;
    }
    get_actions() {
        let actions = {
            hunt: false,
            rest: false,
            clean: false
        };
        actions.hunt = this.can_hunt();
        actions.clean = this.can_clean();
        actions.rest = this.can_rest();
        return actions;
    }
    can_clean() {
        return (this.resources.water);
    }
    can_hunt() {
        return ((this.development.wild > 0) || (this.resources.prey));
    }
    can_fish() {
        return (this.resources.fish);
    }
    can_rest() {
        return (this.development.urban > 0);
    }
    can_gather_wood() {
        return (this.development.wild > 0);
    }
    can_gather_cotton() {
        return (this.development.rural > 0);
    }
    get_item_market() {
        return undefined;
    }
    get_market() {
        return undefined;
    }
    update(dt) {
        if (this.visited_recently) {
            this.last_visit += dt;
            if (this.last_visit > 10) {
                this.visited_recently = false;
                this.last_visit = 0;
            }
        }
    }
}
exports.Cell = Cell;
