export function existsById(id) {
    let candidate = document.getElementById(id);
    return !((candidate == null) || (candidate == undefined));
}
export function elementById(id) {
    let candidate = document.getElementById(id);
    if (candidate == undefined) {
        let error_string = `Element with ID: ${id} doesn't exist`;
        alert(error_string);
        throw new Error(error_string);
    }
    return candidate;
}
export function inputById(id) {
    let candidate = elementById(id);
    if (!isInput(candidate)) {
        let error_string = `Element with ID: ${id} is not an input element`;
        alert(error_string);
        throw new Error(error_string);
    }
    return candidate;
}
export function selectById(id) {
    let candidate = elementById(id);
    if (!isSelect(candidate)) {
        let error_string = `Element with ID: ${id} is not a select element`;
        alert(error_string);
        throw new Error(error_string);
    }
    return candidate;
}
export function imageById(id) {
    let candidate = elementById(id);
    if (!isImage(candidate)) {
        let error_string = `Element with ID: ${id} is not an image element`;
        alert(error_string);
        throw new Error(error_string);
    }
    return candidate;
}
export function select(selectors) {
    return document.querySelectorAll(selectors);
}
export function selectOne(selectors) {
    return selectOneFrom(document, selectors);
}
export function selectOneFrom(origin, selectors) {
    let candidate = origin.querySelector(selectors);
    if (candidate == undefined) {
        let error_string = `Element with selector: ${selectors} doesn't exist`;
        alert(error_string);
        throw new Error(error_string);
    }
    if (!isHTML(candidate)) {
        let error_string = `Element with selector: ${selectors} is not valid HTML element`;
        alert(error_string);
        throw new Error(error_string);
    }
    return candidate;
}
export function selectImage(selectors) {
    let candidate = selectOne(selectors);
    if (!isImage(candidate)) {
        let error_string = `Element with selectors: ${selectors} is not an image element`;
        alert(error_string);
        throw new Error(error_string);
    }
    return candidate;
}
export function isHTML(item) {
    return item instanceof HTMLElement;
}
export function isImage(item) {
    return item instanceof HTMLImageElement;
}
export function isInput(item) {
    return item instanceof HTMLInputElement;
}
export function isSelect(item) {
    return item instanceof HTMLSelectElement;
}
export function setInnerHTMLById(id, string) {
    elementById(id).innerHTML = string;
}
export function resetInnerHTMLById(id) {
    setInnerHTMLById(id, "");
}
export function elementParent(element) {
    let candidate = element.parentElement;
    if (candidate == undefined) {
        let error_string = `Element has no parent!`;
        alert(error_string);
        throw new Error(error_string);
    }
    return candidate;
}
