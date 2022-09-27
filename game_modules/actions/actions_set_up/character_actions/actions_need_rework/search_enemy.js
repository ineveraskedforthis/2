module.exports = async function attack_local_monster(pool, enemies) {
    let battle = await this.world.attack_local_monster(pool, this, enemies);
    return battle
}