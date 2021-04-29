module.exports = function disenchant(index) {
    let res = 'ok';
    if ((!this.data.in_battle) & ('disenchanting' in this.data.skills)) {
        let item = this.equip.data.backpack[index]
        if (item == undefined) {
            res = 'no_selected_item'
            return res
        }
        this.equip.data.backpack[index] = undefined;
        let dice = Math.random();
        if (dice > 0.9) {
            this.stash.inc('zaz', +1);
        }
        let stress_gained = this.calculate_gained_failed_craft_stress('disenchanting');
        this.change_stress(stress_gained);
        this.changed = true;   
    } else if (this.data.in_battle) {
        res = 'in_battle'
    } else if (!('disenchanting' in this.data.skills)) {
        res = 'skill_disenchanting_is_not_learnt'
    }
    return res
}