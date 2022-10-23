module.exports =  function attack_local_monster(pool, enemies) {
    let battle =  this.world.attack_local_monster(pool, this, enemies);
    return battle
}