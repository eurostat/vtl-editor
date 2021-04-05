import { TreeNode } from "react-treebeard";
import { EditorFile } from "../editor/editorFile";

export async function buildFormData(payload: EditorFile) {
    const formData = new FormData();
    const content = new Blob([payload.content], {type: "text/plain", endings: "native"});
    const arrayContent = await new Promise<ArrayBuffer>((resolve, reject) => {
        let result: ArrayBuffer = new ArrayBuffer(1);
        const reader = new FileReader();
        reader.onloadend = function(event) {
            if (event != null && event.target != null) {
                result = event.target.result as ArrayBuffer;
            }
            resolve(result);
        };
        reader.onerror = function(event) {
            reject(event);
        };
        reader.readAsArrayBuffer(content);
    })
    const byteContent = new Blob([arrayContent], {type: "application/octet-stream"});
    const metadata = new Blob([JSON.stringify({"version": payload.version})], {type: "application/json"});
    formData.append('file', byteContent, payload.name);
    formData.append('uploadInfo', metadata);
    return formData;
}

export async function readBlob(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = (event) => {
            if (event.target != null && event.target.result != null) resolve(event.target.result.toString());
            else reject();
        };
        reader.onerror = () => reject();
        reader.readAsText(blob);
    });
}

export const buildContainerBase = () => {
    return {
        id: "",
        name: "",
        children: [],
        toggled: false,
        loading: true,
    } as TreeNode;
}