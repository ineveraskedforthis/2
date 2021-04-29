module.exports = function enchant(index) {
    let res = 'ok';
    if ((!this.data.in_battle) & ('enchanting' in this.data.skills)) {
        let item = this.equip.data.backpack[index]
        if (item == undefined) {
            res = 'no_selected_item'
            return res
        }
        let tmp = this.stash.get('zaz');
        if (tmp > 0) {
            this.stash.inc('zaz', -1);
            this.world.roll_affixes(this.equip.data.backpack[index], 5);
            let stress_gained = this.calculate_gained_failed_craft_stress('enchanting');
            this.change_stress(stress_gained);
        } else {
            res = 'not_enough_zaz'
        }
        this.changed = true;
    } else if (this.data.in_battle) {
        res = 'in_battle'
    } else if (!('enchanting' in this.data.skills)) {
        res = 'skill_enchanting_is_not_learnt'
    }
    return res
}