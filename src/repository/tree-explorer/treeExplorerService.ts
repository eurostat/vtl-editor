import { TreeNode } from "react-treebeard";
import { decisionDialog } from "../../main-view/decision-dialog/decisionDialog";
import { inputDialog } from "../../main-view/decision-dialog/inputDialog";
import { StoredItemTransfer } from "../entity/storedItemTransfer";
import { StoredItemType } from "../entity/storedItemType";

export enum ContextMenuEventType {
    Refresh,
    NewFile,
    NewFolder,
    OpenFile,
    SaveFile,
    RenameItem,
    DeleteItem,
    FolderDetails,
    FileVersions
}

export interface ContextMenuEvent {
    type: ContextMenuEventType,
    node?: TreeNode,
    parent?: TreeNode,
    payload?: any
}

export const createItemDialog = (type: StoredItemType, input?: string) => {
    const decision = async () => {
        const descriptor = type.toLocaleLowerCase();
        const result = await inputDialog({
            title: "Create New",
            text: `Enter new ${descriptor} name.`,
            defaultValue: input || "",
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
        const result = await decisionDialog({
            title: "Warning",
            text: `Do you really want to delete this ${descriptor}?`,
            buttons: [
                {key: "yes", text: "Yes", color: "primary"},
                {key: "no", text: "No", color: "secondary"}
            ]
        });
        return result === "yes"
            ? Promise.resolve()
            : Promise.reject();
    }
    return decision();
}

export const renameItemDialog = (type: StoredItemType, name: string) => {
    const decision = async () => {
        const descriptor = type.toLocaleLowerCase();
        const result = await inputDialog({
            title: "Rename",
            text: `Renaming ${descriptor} "${name}". Enter new name.`,
            defaultValue: name,
            acceptButton: {value: "rename", color: "primary"}
        });
        return result !== "cancel"
            ? Promise.resolve(result)
            : Promise.reject();
    }
    return decision();
}

export const buildFolderNode = (folder: StoredItemTransfer) => {
    return {
        name: folder.name,
        id: "F" + folder.id,
        parentId: folder.parentFolderId ? "F" + folder.parentFolderId : undefined,
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
        parentId: file.parentFolderId ? "F" + file.parentFolderId : undefined,
        toggled: false,
        entity: file
    } as TreeNode;
}

export const buildNode = (item: StoredItemTransfer) => {
    switch (item.type) {
        case StoredItemType.FOLDER: {
            return buildFolderNode(item);
        }
        case StoredItemType.FILE: {
            return buildFileNode(item);
        }
        default: {
            return {name: item.name} as TreeNode;
        }
    }
}