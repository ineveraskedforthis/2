module.exports = {
    'kinetic_bolt': (result) => {
        let damage = {};
        damage.blunt = 6;
        damage.slice = 0;
        damage.pierce = 0;
        damage.fire = 0;
        result.damage = damage;
        return result;
    }
}