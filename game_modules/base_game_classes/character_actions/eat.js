module.exports = function eat() {
    if (!this.data.in_battle) {
        let tmp = this.stash.get('food');
        if (tmp > 0) {
            this.change_hp(pool, 10);
            this.stash.inc('food', -1);
        }
    }
}