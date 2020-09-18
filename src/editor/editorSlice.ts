import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../utility/store";
import { DEFAULT_FILENAME, EditorFile } from "./editorFile";
import { defaultVtlVersion, VtlVersion } from "./settings";
import { CursorPosition, VtlError } from "./vtl-editor/vtlEditor";

const initialState = {
    file: {
        name: DEFAULT_FILENAME,
        content: "",
        edited: false
    },
    cursor: {
        line: 1,
        column: 1
    },
    errors: [],
    movedCursor: {
        line: 1,
        column: 1
    },
    savedContent: "",
    vtlVersion: defaultVtlVersion,
    loadedFile: {
        name: DEFAULT_FILENAME,
        content: "",
        edited: false
    }
} as EditorState;

export const editorSlice = createSlice({
    name: "editor",
    initialState: initialState,
    reducers: {
        updateContent(state, action: PayloadAction<string>) {
            state.file.content = action.payload
            if (action.payload !== state.savedContent) state.file.edited = true
        },
        updateName(state, action: PayloadAction<string>) {
            state.file.name = action.payload
        },
        updateEdited(state, action: PayloadAction<boolean>) {
            state.file.edited = action.payload
        },
        markEdited(state) {
            state.file.edited = true
        },
        markUnedited(state) {
            state.file.edited = false
        },
        updateSaved(state, action: PayloadAction<string>) {
            state.savedContent = action.payload
        },
        updateCursor(state, action: PayloadAction<CursorPosition>) {
            state.cursor = action.payload
        },
        jumpCursor(state, action: PayloadAction<CursorPosition>) {
            state.movedCursor = action.payload
        },
        listErrors(state, action: PayloadAction<VtlError[]>) {
            state.errors = action.payload
        },
        changeVtlVersion(state, action: PayloadAction<VtlVersion>) {
            state.vtlVersion = action.payload
        },
        loadFile(state, action: PayloadAction<EditorFile>) {
            state.loadedFile = action.payload
            state.savedContent = action.payload.content
        }
    }
});

export interface EditorState {
    file: EditorFile,
    cursor: CursorPosition,
    errors: VtlError[],
    movedCursor: CursorPosition,
    savedContent: string,
    vtlVersion: VtlVersion,
    loadedFile: EditorFile
}

export const {
    updateContent, updateName, updateEdited, markEdited, markUnedited, updateSaved,
    updateCursor, jumpCursor, listErrors, changeVtlVersion, loadFile
} = editorSlice.actions;

export const editorCursor = (state: RootState) => state.editor.cursor;
export const editorFile = (state: RootState) => state.editor.file;
export const fileName = (state: RootState) => state.editor.file.name;
export const fileContent = (state: RootState) => state.editor.file.content;
export const fileEdited = (state: RootState) => state.editor.file.edited;
export const movedCursor = (state: RootState) => state.editor.movedCursor;
export const editorErrors = (state: RootState) => state.editor.errors;
export const errorCount = (state: RootState) => state.editor.errors.length;
export const appliedVtlVersion = (state: RootState) => state.editor.vtlVersion;
export const loadedFile = (state: RootState) => state.editor.loadedFile;
export const savedContent = (state: RootState) => state.editor.savedContent;

export default editorSlice.reducer;