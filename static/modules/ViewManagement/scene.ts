//CHANGE SCENES STUFF
export function show_char_creation() {
    show_scene("character_creation")
    document.getElementById('page_1')!.style.visibility = 'inherit';
}

export function show_main_menu() {
    show_scene("main_menu")
}

export function show_game() {
    console.log('show game')
    show_scene("actual_game_scene")
}

export function show_scene(scene_id: string) {
    let parent_elem = document.getElementById(scene_id)!.parentElement!;
    for (var i = 0; i < parent_elem.children.length; i++) {
        if (parent_elem.children[i].id != undefined && parent_elem.children[i].id != null && parent_elem.children[i].id != ''){
            document.getElementById(parent_elem.children[i].id)!.style.visibility = 'hidden';
        }
    }
    document.getElementById(scene_id)!.style.visibility = 'visible';    
}