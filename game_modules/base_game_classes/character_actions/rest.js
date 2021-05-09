module.exports = function rest() {
    if (!this.in_battle()) {
        let cell = this.get_cell();
        if (cell.can_rest()) {
            this.change_stress(-20)
            return 'ok'
        } else {
            return 'no available place to rest'
        }
    }
}