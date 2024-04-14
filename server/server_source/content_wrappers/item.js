export function is_priced_item(x) {
    return "price" in x;
}
export function is_weapon(x) {
    return "prototype_weapon" in x;
}
export function is_armour(x) {
    return "prototype_armour" in x;
}
