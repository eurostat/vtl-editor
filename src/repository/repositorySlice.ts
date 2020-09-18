import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TreeNode } from "react-treebeard";
import { RootState } from "../utility/store";

const initialState = {
    explorerTree: []
} as RepositoryState;

export const repositorySlice = createSlice({
    name: "repository",
    initialState: initialState,
    reducers: {
        updateTree(state, action: PayloadAction<TreeNode[]>) {
            state.explorerTree = action.payload
        },

    }
})

export interface RepositoryState {
    explorerTree: TreeNode[]
}

export const {updateTree} = repositorySlice.actions;

export const explorerTree = (state: RootState) => {
    return state.repository.explorerTree;
}

export default repositorySlice.reducer;