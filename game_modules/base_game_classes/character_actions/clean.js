module.exports = function clean() {
    if (!this.data.in_battle) {
        let tmp = this.stash.get('water');
        if (tmp > 0) {
            this.change_blood(-20);
            this.stash.inc('water', -1);
        }
    }
}