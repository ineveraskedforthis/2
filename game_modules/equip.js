module.exports = class Equip {
    constructor() {
        this.data = {
            right_hand: null
        }
    }

    get_weapon_range() {
        return 1;
    }

    get_weapon_damage(m) {
        var tmp = undefined
        if (this.data.right_hand == null) {
            tmp = {blunt: 3, pierce: 1, slice: 1};
        } else {
            tmp = {blunt: 10, pierce: 1, slice: 1};
        }
        for (var i in tmp) {
            tmp[i] = Math.floor(tmp[i] * m / 10);
        }
        return tmp
    }

    get_resists() {
        return {blunt: 0, pierce: 0, slice: 0};
    }

    get_json() {
        return this.data;
    }

    load_from_json(json) {
        this.data = json;
    }
}