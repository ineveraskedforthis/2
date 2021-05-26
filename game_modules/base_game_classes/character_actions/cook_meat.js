module.exports = function cook_meat() {
    let res = 'ok';
    if (!this.in_battle()) {
        let tmp = this.stash.get('meat')
        if (tmp > 0) {
            this.changed = true
            let skill = this.skills.cooking.practice
            let check = 0;
            if (this.skills.perks.meat_master) {
                check = 1
            } else if (skill > 20) {
                check = 0.7
            } else {
                check = 0.7 * skill / 20
            }
            let dice = Math.random()
            this.stash.inc('meat', -1)
            if (dice < check) {        
                this.change_stress(1)        
                this.stash.inc('food', 1)
                return 'ok'
            } else {
                if (skill < 19) {
                    this.skills.cooking.practice += 1
                    this.send_skills_update()
                }
                this.change_stress(5)
                return 'failed'
            }
        } else {
            return 'not_enough_meat'
        }
        
    } else if (this.in_battle()) {
        res = 'in_battle'
    }
    return res
}