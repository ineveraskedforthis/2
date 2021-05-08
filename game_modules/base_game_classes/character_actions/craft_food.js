module.exports = function craft_food() {
    let res = 'ok';
    if ((!this.in_battle()) & ('cook' in this.data.skills)) {
        let tmp = this.stash.get('meat');
        if (tmp > 0) {
            this.stash.inc('meat', -1);
            let chance = this.get_craft_food_chance();
            let dice = Math.random()
            let stress_gained = this.calculate_gained_failed_craft_stress('food');
            if (dice < chance) {
                this.stash.inc('food', +1);
                this.change_stress(Math.floor(stress_gained / 2));
                res = 'ok'
            } else {
                this.change_stress(stress_gained);
                res = 'failed'
            }     
            this.changed = true;       
        } 
        else {
            res = 'not_enough_meat'
        }
    } else if (this.in_battle()) {
        res = 'in_battle'
    } else if (!('cook' in this.data.skills)) {
        res = 'skill_cook_is_not_learnt'
    }
    return res
}