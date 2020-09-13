import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_FILENAME, EditorFile } from "./editorFile";
import { RootState } from "../utility/store";

const initialState = {
    file: {
        name: DEFAULT_FILENAME,
        content: "",
        edited: false
    }
} as LoaderState;

export const loaderSlice = createSlice({
    name: 'loader',
    initialState: initialState,
    reducers: {
        loadFile(state, action: PayloadAction<EditorFile>) {
            state.file = action.payload
        }
    }
});

export interface LoaderState {
    file: EditorFile
}

export const {loadFile} = loaderSlice.actions;

export const loadedFile = (state: RootState) => {
    return state.loader.file;
}

export default loaderSlice.reducer;