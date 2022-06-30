module.exports = async function attack_local_outpost(pool) {
    let battle = await this.world.attack_local_outpost(pool, this);
    return battle
}