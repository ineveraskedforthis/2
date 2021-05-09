module.exports = function clean() {
    if (!this.in_battle()) {
        let cell = this.get_cell();
        let tmp = this.stash.get('water');
        if (cell.can_clean()) {
            this.change_blood(-20)
            return 'ok'
        } else if (tmp > 0) {
            this.change_blood(-20);
            this.stash.inc('water', -1);
            return 'ok'
        } else {
            return 'no available water'
        }
    }
}