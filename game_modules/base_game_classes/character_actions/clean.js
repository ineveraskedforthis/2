module.exports = function clean() {
    if (!this.in_battle()) {
        let cell = this.get_cell();
        if (cell.can_clean()) {
            this.change_blood(-20)
        } else {
            let tmp = this.stash.get('water');
            if (tmp > 0) {
                this.change_blood(-20);
                this.stash.inc('water', -1);
            }
        }        
    }
}