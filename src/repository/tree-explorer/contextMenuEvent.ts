import {TreeNode} from "react-treebeard";

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