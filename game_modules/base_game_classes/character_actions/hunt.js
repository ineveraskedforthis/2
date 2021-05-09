module.exports = function hunt() {
    if (!this.in_battle()) {
        let cell = this.get_cell();
        if (cell.can_hunt()) {
            this.change_stress(5)
            this.stash.inc('meat', 1)
            this.change_blood(5)
            return 'ok'
        } else {
            return 'no one to hunt on'
        }
    }
}