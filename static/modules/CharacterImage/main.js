//CHARACTER 2D IMAGE DISPLAY
import { EquipSlotStorage } from "../.././content.js";
import { elementById, imageById, selectImage } from "../HTMLwrappers/common.js";
var race_model = "human";
const display_layers = ['behind_all', 'behind_body', 'behind_right_arm', 'on_top'];
export const EQUIPMENT_TAGS = [
    'weapon',
    'socks',
    'shirt',
    'secondary',
    'pauldron-left',
    'mail',
    'pauldron-right',
    'gauntlet-left',
    'gauntlet-right',
    'boots',
    'helmet',
    'pants',
    'belt',
    'dress',
    'amulet',
    'robe'
];
export function set_body_type(race) {
    // console.log(race)
    race_model = race;
    if (race != 'human') {
        imageById('character_creation_image_body').src = `../static/img/character_image/${race}/pose.png`;
        imageById('character_image_body').src = `../static/img/character_image/${race}/pose.png`;
        selectImage(`.only_body.character_image`).src = '';
        selectImage(`.left_arm.character_image`).src = '';
        selectImage(`.right_arm.character_image`).src = '';
    }
    else {
        imageById('character_creation_image_body').src = `../static/img/character_image/${race}/pose.png`;
        imageById('character_image_body').src = ``;
        selectImage(`.only_body.character_image`).src = '../static/img/character_image/human/body.PNG';
        selectImage(`.left_arm.character_image`).src = '../static/img/character_image/human/left_arm.PNG';
        selectImage(`.right_arm.character_image`).src = '../static/img/character_image/human/right_arm.PNG';
    }
}
var flag_init = false;
export function set_up_character_model(socket) {
    socket.on('model', (race) => {
        set_body_type(race);
    });
    const body_left_arm = document.createElement('img');
    body_left_arm.classList.add('character_image');
    body_left_arm.classList.add('left_arm');
    const body_body = document.createElement('img');
    body_body.classList.add('character_image');
    body_body.classList.add('only_body');
    const body_right_arm = document.createElement('img');
    body_right_arm.classList.add('character_image');
    body_right_arm.classList.add('right_arm');
    let character_image_collection = elementById('character_image_display');
    for (let tag of EQUIPMENT_TAGS.slice().reverse()) {
        let equip_piece = document.createElement('img');
        equip_piece.classList.add('equip');
        equip_piece.classList.add(tag);
        equip_piece.classList.add('character_image');
        equip_piece.classList.add('behind_all');
        equip_piece.alt = ``;
        character_image_collection.appendChild(equip_piece);
    }
    character_image_collection.appendChild(body_left_arm);
    for (let tag of EQUIPMENT_TAGS) {
        let equip_piece = document.createElement('img');
        equip_piece.classList.add('equip');
        equip_piece.classList.add(tag);
        equip_piece.classList.add('character_image');
        equip_piece.classList.add('behind_body');
        equip_piece.alt = ``;
        character_image_collection.appendChild(equip_piece);
    }
    character_image_collection.appendChild(body_body);
    for (let tag of EQUIPMENT_TAGS) {
        let equip_piece = document.createElement('img');
        equip_piece.classList.add('equip');
        equip_piece.classList.add(tag);
        equip_piece.classList.add('character_image');
        equip_piece.classList.add('behind_right_arm');
        equip_piece.alt = ``;
        character_image_collection.appendChild(equip_piece);
    }
    character_image_collection.appendChild(body_right_arm);
    for (let tag of EQUIPMENT_TAGS) {
        let equip_piece = document.createElement('img');
        equip_piece.classList.add('equip');
        equip_piece.classList.add(tag);
        equip_piece.classList.add('character_image');
        equip_piece.classList.add('on_top');
        equip_piece.alt = ``;
        character_image_collection.appendChild(equip_piece);
    }
    flag_init = true;
}
export function update_equip_image(data) {
    if (flag_init == false)
        return;
    for (let layer of display_layers) {
        if ((layer != 'on_top') && (race_model != 'human')) {
            continue;
        }
        for (let tag of EQUIPMENT_TAGS) {
            let div = selectImage('.character_image.equip.' + tag + '.' + layer);
            console.log(tag, data[EquipSlotStorage.from_string(tag).id_string]);
            let item_tag = data[EquipSlotStorage.from_string(tag).id_string]?.name || 'empty';
            if (tag == 'secondary') {
                continue;
            }
            if (item_tag == 'empty') {
                div.src = `../static/img/character_image/${race_model}/${item_tag}.png`;
            }
            if (race_model == 'human') {
                console.log(`/static/img/character_image/${race_model}/${tag}/${item_tag}_${layer}.PNG`);
                div.src = `../static/img/character_image/${race_model}/${tag}/${item_tag}_${layer}.PNG`;
            }
            else {
                console.log(`/static/img/character_image/${race_model}/${item_tag}.png`);
                div.src = `../static/img/character_image/${race_model}/${item_tag}.png`;
            }
        }
    }
}

