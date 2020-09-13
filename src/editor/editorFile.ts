export const DEFAULT_FILENAME = "untitled.vtl";

export interface StoredFile {
    content?: string,
    edited?: boolean,
    theme?: string,
    showErrorBox?: boolean,
    name?: string
}

export interface EditorFile {
    name: string,
    content: string,
    edited: boolean
}

export const buildFile = (name?: string, content?: string, edited?: boolean): EditorFile => {
    return {
        name: name || DEFAULT_FILENAME,
        content: content || "",
        edited: edited || false
    } as EditorFile;
}