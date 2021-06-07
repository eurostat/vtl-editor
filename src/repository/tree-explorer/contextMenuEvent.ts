import {TreeNode} from "react-treebeard";

export enum ContextMenuEventType {
    Refresh,
    NewFile,
    NewFolder,
    OpenFile,
    SaveFile,
    RenameItem,
    DeleteItem,
    RestoreItem,
    ContainerDetails,
    FileVersions,
    PublishItem,
    IncrementVersion,
    FinalizeVersion
}

export interface ContextMenuEvent {
    type: ContextMenuEventType,
    node?: TreeNode,
    parent?: TreeNode,
    payload?: any
}

export type TreeExplorerMenuProps = {
    onMenuEvent?: (event: ContextMenuEvent) => any
}