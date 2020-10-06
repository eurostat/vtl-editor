import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TreeNode } from "react-treebeard";
import { RootState } from "../utility/store";

const initialState = {
    explorerTree: {
        folders: [],
        files: []
    },
    selectedFolder: undefined,
    detailedFolder: undefined,
    versionedFile: 0,
    comparedVersions: {
        file: undefined,
        versions: []
    }
} as RepositoryState;

export const repositorySlice = createSlice({
    name: "repository",
    initialState: initialState,
    reducers: {
        replaceTree(state, action: PayloadAction<ExplorerTreeState>) {
            state.explorerTree = action.payload
        },
        addToTree(state, action: PayloadAction<ExplorerTreeState>) {
            let replacements = action.payload.files.map((item) => item.id);
            let existing = state.explorerTree.files.filter((item) => !replacements.includes(item.id));
            existing.push(...action.payload.files);
            state.explorerTree.files = existing;
            replacements = action.payload.folders.map((item) => item.id);
            existing = state.explorerTree.folders.filter((item) => !replacements.includes(item.id));
            existing.push(...action.payload.folders);
            state.explorerTree.folders = existing;
        },
        addFolderToTree(state, action: PayloadAction<TreeNode>) {
            state.explorerTree.folders = state.explorerTree.folders.filter((item) => item.id !== action.payload.id);
            state.explorerTree.folders.push(action.payload);
        },
        addFileToTree(state, action: PayloadAction<TreeNode>) {
            state.explorerTree.files = state.explorerTree.files.filter((item) => item.id !== action.payload.id);
            state.explorerTree.files.push(action.payload);
        },
        replaceNode(state, action: PayloadAction<TreeNode>) {
            const active = action.payload.active;
            state.explorerTree.folders = state.explorerTree.folders.map((item) => {
                if (item.id === action.payload.id) return action.payload;
                if (active) item.active = false;
                return item;
            });
            state.explorerTree.files = state.explorerTree.files.map((item) => {
                if (item.id === action.payload.id) return action.payload;
                if (active) item.active = false;
                return item;
            });
        },
        deleteNode(state, action: PayloadAction<TreeNode>) {
            state.explorerTree.folders = state.explorerTree.folders.filter((item) => item.id !== action.payload.id);
            state.explorerTree.files = state.explorerTree.files.filter((item) => item.id !== action.payload.id);
        },
        updateNode(state, action: PayloadAction<any>) {
            const active = action.payload.active;
            state.explorerTree.folders = state.explorerTree.folders.map((item) => {
                if (item.id === action.payload.id) return Object.assign({}, item, action.payload);
                if (active) item.active = false;
                return item;
            });
            state.explorerTree.files = state.explorerTree.files.map((item) => {
                if (item.id === action.payload.id) return Object.assign({}, item, action.payload);
                if (active) item.active = false;
                return item;
            });
        },
        selectFolder(state, action: PayloadAction<number | undefined>) {
            state.selectedFolder = action.payload
        },
        detailFolder(state, action: PayloadAction<any>) {
            state.detailedFolder = action.payload
        },
        versionFile(state, action: PayloadAction<number>) {
            state.versionedFile = action.payload
        },
        compareVersions(state, action: PayloadAction<{ file: any, versions: any[] }>) {
            const compare = Object.assign({}, action.payload);
            if (compare.versions.length > 2) compare.versions = compare.versions.slice(0, 3);
            state.comparedVersions = compare;
        }
    }
})

export interface RepositoryState {
    explorerTree: ExplorerTreeState
    selectedFolder: number | undefined
    detailedFolder: any
    versionedFile: number
    comparedVersions: {
        file: any
        versions: any[]
    }
}

export interface ExplorerTreeState {
    folders: TreeNode[],
    files: TreeNode[]
}

export const {
    replaceTree, addToTree, replaceNode, deleteNode, updateNode,
    addFolderToTree, addFileToTree, selectFolder, detailFolder, versionFile, compareVersions
} = repositorySlice.actions;

export const explorerTree = (state: RootState) => {
    const stateFolders = state.repository.explorerTree.folders.map((folder) => Object.assign({}, folder, {children: []}));
    const stateFiles = state.repository.explorerTree.files.map((file) => Object.assign({}, file));

    const addChildren = (parent: TreeNode) => {
        if (parent.children) {
            const treeFolders = stateFolders.filter((folder) => folder.parentId === parent.id);
            const treeFiles = stateFiles.filter((file) => file.parentId === parent.id);
            parent.children.push(...treeFolders, ...treeFiles);
            treeFolders.forEach((folder) => addChildren(folder));
        }
    }

    const treeFolders = stateFolders.filter((folder) => folder.parentId === undefined);
    const treeFiles = stateFiles.filter((file) => file.parentId === undefined);
    treeFolders.forEach((folder) => addChildren(folder));
    return [...treeFolders, ...treeFiles];
}
export const selectedFolder = (state: RootState) => state.repository.selectedFolder;
export const detailedFolder = (state: RootState) => state.repository.detailedFolder;
export const versionedFile = (state: RootState) => state.repository.versionedFile;
export const comparedVersions = (state: RootState) => state.repository.comparedVersions;

export default repositorySlice.reducer;