import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TreeNode } from "react-treebeard";
import { RootState } from "../../utility/store";

export interface ExplorerTreeState {
    folders: TreeNode[],
    files: TreeNode[]
}

export interface RepositoryState {
    explorerTree: ExplorerTreeState,
    loaded: boolean
    selectedFolder: number | undefined
    detailedFolder: number | undefined
    versionedFile: number | undefined
    comparedVersions: {
        file: any
        versions: any[]
    }
}

const initialState = {
    explorerTree: {
        folders: [],
        files: []
    },
    loaded: false,
    selectedFolder: undefined,
    detailedFolder: undefined,
    versionedFile: undefined,
    comparedVersions: {
        file: undefined,
        versions: []
    }
} as RepositoryState;

export const personalRepoSlice = createSlice({
    name: "personalRepo",
    initialState: initialState,
    reducers: {
        replaceTree(state, action: PayloadAction<ExplorerTreeState>) {
            state.explorerTree = action.payload;
            state.loaded = true;
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
        detailFolder(state, action: PayloadAction<number | undefined>) {
            state.detailedFolder = action.payload
        },
        versionFile(state, action: PayloadAction<number | undefined>) {
            state.versionedFile = action.payload
        },
        compareVersions(state, action: PayloadAction<{ file: any, versions: any[] }>) {
            const compare = Object.assign({}, action.payload);
            if (compare.versions.length > 2) compare.versions = compare.versions.slice(0, 3);
            state.comparedVersions = compare;
        }
    }
})

export const {
    replaceTree, addToTree, replaceNode, deleteNode, updateNode,
    addFolderToTree, addFileToTree, selectFolder, detailFolder, versionFile, compareVersions
} = personalRepoSlice.actions;

export const personalRepoTree = (state: RootState) => {
    const stateFolders = state.personalRepo.explorerTree.folders.map((folder) => Object.assign({}, folder, {children: []}));
    const stateFiles = state.personalRepo.explorerTree.files.map((file) => Object.assign({}, file));

    const addChildren = (parent: TreeNode) => {
        if (parent.children) {
            const childFolders = stateFolders.filter((folder) => folder.parentId === parent.id);
            const childFiles = stateFiles.filter((file) => file.parentId === parent.id);
            parent.children.push(...childFolders, ...childFiles);
            childFolders.forEach((folder) => addChildren(folder));
        }
    }

    const treeFolders = stateFolders.filter((folder) => folder.parentId === undefined);
    const treeFiles = stateFiles.filter((file) => file.parentId === undefined);
    treeFolders.forEach((folder) => addChildren(folder));
    return [...treeFolders, ...treeFiles];
}

const folderPath = (state: RootState, folderId: number | undefined) => {
    const parentPath = (parentId: string | undefined) => {
        let prevPath: string = "";
        if (parentId !== undefined) {
            const branch = state.personalRepo.explorerTree.folders.find(folder => folder.id === parentId);
            if (branch) prevPath = parentPath(branch.parentId) + branch.name + "/";
        }
        return prevPath;
    }

    let path: string = "/";
    if (folderId) {
        const leaf = state.personalRepo.explorerTree.folders.find(folder => folder.entity?.id === folderId);
        if (leaf) {
            path = path + parentPath(leaf.parentId) + leaf.name + "/";
        }
    }
    return path;
}

export const personalRepoLoaded = (state: RootState) => state.personalRepo.loaded;
export const detailedFolderPath = (state: RootState) =>  folderPath(state, state.personalRepo.detailedFolder);
export const selectedFolderPath = (state: RootState) =>  folderPath(state, state.personalRepo.selectedFolder);
export const selectedFolder = (state: RootState) => state.personalRepo.selectedFolder;
export const detailedFolder = (state: RootState) => state.personalRepo.detailedFolder;
export const versionedFile = (state: RootState) => state.personalRepo.versionedFile;
export const comparedVersions = (state: RootState) => state.personalRepo.comparedVersions;

export default personalRepoSlice.reducer;