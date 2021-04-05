import {TreeNode} from "react-treebeard";
import {StoredItemTransfer} from "../entity/storedItemTransfer";
import {StoredItemType} from "../entity/storedItemType";

export const buildFolderNode = (folder: StoredItemTransfer) => {
    return {
        name: folder.name,
        id: "F" + folder.id,
        parentId: folder.parentId ? "F" + folder.parentId : undefined,
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
        parentId: file.parentId ? "F" + file.parentId : undefined,
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