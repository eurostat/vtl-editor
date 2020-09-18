import { TreeNode } from "react-treebeard";
import { decisionModal } from "../../main-view/decision-dialog/decisionModal";
import { decisionModalInput } from "../../main-view/decision-dialog/DecisionModalInput";
import { StoredItemTransfer } from "../entity/storedItemTransfer";
import { StoredItemType } from "../entity/storedItemType";

export enum ContextMenuEventType {
    NewFile,
    NewFolder
}

export interface ContextMenuEvent {
    type: ContextMenuEventType,
    node?: TreeNode,
    parent?: TreeNode,
    payload?: any
}

export const createItemDialog = (type: StoredItemType) => {
    const decision = async () => {
        const descriptor = type.toLocaleLowerCase();
        const result = await decisionModalInput({
            title: "Create New",
            text: `Enter new ${descriptor} name.`,
            acceptButton: {value: "create", color: "primary"}
        });
        return result !== "cancel"
            ? Promise.resolve(result)
            : Promise.reject();
    }
    return decision();
}

export const deleteItemDialog = (type: StoredItemType) => {
    const decision = async () => {
        const descriptor = type.toLocaleLowerCase();
        const result = await decisionModal({
            title: "Warning",
            text: `Do you really want to delete this ${descriptor}?`
        });
        return result === "yes"
            ? Promise.resolve()
            : Promise.reject();

    }
    return decision();
}

export const buildFolderNode = (folder: StoredItemTransfer) => {
    return {
        name: folder.name,
        id: "F" + folder.id,
        toggled: false,
        children: [],
        entity: folder,
        loading: true
    } as TreeNode;
}

export const buildFileNode = (file: StoredItemTransfer) => {
    return {
        name: file.name,
        id: "f" + file.id,
        toggled: false,
        entity: file
    } as TreeNode;
}