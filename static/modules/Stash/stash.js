import { MaterialConfiguration, MaterialStorage } from "../.././content.js";
import { elementById } from "../HTMLwrappers/common.js";
import { socket } from "../Socket/socket.js";
import { StashValue, value_class_name, value_indicator_class_name } from "../Values/collection.js";
import { globals } from "../globals.js";
export function material_icon_url(material_tag) {
    return `url(/static/img/stash/${material_tag}.png)`;
}
export function init_stash(stash_dependent_elements) {
    let inventory_div = elementById('goods_stash');
    let material_select = elementById('create_order_material');
    inventory_div.innerHTML = '';
    material_select.innerHTML = '';
    for (var tag of Object.values(MaterialConfiguration.MATERIAL_MATERIAL_STRING)) {
        const material = MaterialStorage.from_string(tag);
        // stash
        let div_cell = document.createElement('div');
        div_cell.classList.add(...[value_indicator_class_name(tag), 'tooltip', 'goods_type_stash']);
        ((tag) => div_cell.onclick = () => { process_stash_click(tag); })(tag);
        { // icon
            let div_image = document.createElement('div');
            div_image.classList.add(...['goods-icon', 'fill_container']);
            div_image.style.backgroundImage = material_icon_url(tag);
            div_cell.appendChild(div_image);
        }
        { // tooltip with description
            let div_text = document.createElement('span');
            div_text.innerHTML = material.name;
            div_text.classList.add('tooltiptext');
            div_cell.appendChild(div_text);
        }
        { // value
            let div = document.createElement('div');
            div.innerHTML = '?';
            div.classList.add(...[value_class_name(tag), 'goods_amount_in_inventory']);
            div_cell.appendChild(div);
        }
        inventory_div.appendChild(div_cell);
        // updating options
        let option = document.createElement('option');
        option.value = tag;
        option.innerHTML = tag;
        material_select.appendChild(option);
    }
    const character = globals.character_data;
    if (character == undefined)
        return;
    for (var tag of Object.values(MaterialConfiguration.MATERIAL_MATERIAL_STRING)) {
        const material = MaterialStorage.from_string(tag);
        character.stash.push(new StashValue(socket, tag, material.id, stash_dependent_elements));
    }
}
export function update_stash(data) {
    const character = globals.character_data;
    if (character == undefined)
        return;
    for (let i = 0; i < data.length; i++) {
        character.stash[i].value = data[i];
    }
}
export function process_stash_click(tag) {
    console.log(tag);
    const material = MaterialStorage.from_string(tag);
    if (material.category == 8 /* MATERIAL_CATEGORY.FOOD */) {
        console.log('eating');
        socket.emit('eat', tag);
    }
}

