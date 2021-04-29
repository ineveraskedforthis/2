module.exports = function craft_clothes() {
    let res = 'ok';
    if ((!this.data.in_battle) & ('sewing' in this.data.skills)) {
        let tmp = this.stash.get('leather');
        if (tmp > 0) {
            this.stash.inc('leather', -1);
            this.stash.inc('clothes', +1);
            let stress_gained = this.calculate_gained_failed_craft_stress('clothes');
            this.change_stress(stress_gained);
            this.changed = true;
        } else {
            res = 'not_enough_leather'
        }
    } else if (this.data.in_battle) {
        res = 'in_battle'
    } else if (!('sewing' in this.data.skills)) {
        res = 'skill_sewing_is_not_learnt'
    }
    return res
}