export function div(id, innerHTML, classes, background, onckick, children) {
    let div = document.createElement('div');
    if (id != undefined) {
        div.id = id;
    }
    div.innerHTML = innerHTML;
    div.classList.add(...classes);
    if (background != undefined) {
        div.style.background = background;
    }
    if (onckick != undefined) {
        div.onclick = onckick;
    }
    for (let child of children) {
        div.appendChild(child);
    }
    return div;
}

