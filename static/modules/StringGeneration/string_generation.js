export function generate_item_name(item) {
    // console.log(item.name)
    let name_string = item.name;
    for (let aff of item.affixes_list) {
        if (aff.tag.startsWith('of')) {
            name_string = name_string + ' ' + aff.tag;
        }
        else {
            name_string = aff.tag + ' ' + name_string;
        }
    }
    return name_string;
}

