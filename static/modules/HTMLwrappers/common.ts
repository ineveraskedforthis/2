export function existsById(id: string): boolean {
    let candidate = document.getElementById(id);

    return !((candidate == null) || (candidate == undefined))
}

export function elementById(id: string): HTMLElement {
    let candidate = document.getElementById(id);

    if (candidate == undefined) {
        let error_string = `Element with ID: ${id} doesn't exist`;
        alert(error_string);
        throw new Error(error_string);
    }

    return candidate;
}

export function inputById(id: string): HTMLInputElement {
    let candidate = elementById(id);

    if(!isInput(candidate)) {
        let error_string = `Element with ID: ${id} is not an input element`;
        alert(error_string);
        throw new Error(error_string);
    }

    return candidate
}

export function imageById(id: string): HTMLImageElement {
    let candidate = elementById(id);

    if(!isImage(candidate)) {
        let error_string = `Element with ID: ${id} is not an image element`;
        alert(error_string);
        throw new Error(error_string);
    }

    return candidate
}

export function select(selectors: string): NodeListOf<Element> {
    return document.querySelectorAll(selectors);
}

export function selectOne(selectors: string) {
    return selectOneFrom(document, selectors);
}

export function selectOneFrom(origin: Element|Document, selectors: string): HTMLElement {
    let candidate = origin.querySelector(selectors)

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

    return candidate
}

export function selectImage(selectors: string): HTMLImageElement {
    let candidate = selectOne(selectors)

    if (!isImage(candidate)) {
        let error_string = `Element with selectors: ${selectors} is not an image element`;
        alert(error_string);
        throw new Error(error_string);
    }

    return candidate;
}

export function isHTML(item: Element): item is HTMLElement {
    return item instanceof HTMLElement;
}

export function isImage(item: Element): item is HTMLImageElement {
    return item instanceof HTMLImageElement;
}

export function isInput(item: Element): item is HTMLInputElement {
    return item instanceof HTMLInputElement;
}

export function setInnerHTMLById(id: string, string: string) {
    elementById(id).innerHTML = string;
}

export function resetInnerHTMLById(id: string) {
    setInnerHTMLById(id, "");
}

export function elementParent(element: HTMLElement) {
    let candidate = element.parentElement;
    if (candidate == undefined) {
        let error_string = `Element has no parent!`;
        alert(error_string);
        throw new Error(error_string);
    }

    return candidate
}