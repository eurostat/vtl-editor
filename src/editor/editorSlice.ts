import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {RootState} from "../utility/store";
import {buildEmptyFile, EditorFile} from "./editorFile";
import {defaultVtlVersion, VtlVersion} from "./settings";
import {CursorPosition, VtlError} from "./vtl-editor";

export interface EditorState {
    file: EditorFile,
    cursor: CursorPosition,
    errors: VtlError[],
    movedCursor: CursorPosition,
    editedContent: string,
    savedContent: string,
    vtlVersion: VtlVersion,
    loadedFile: EditorFile | undefined
}

const initialState = {
    file: buildEmptyFile(),
    cursor: {
        line: 1,
        column: 1
    },
    errors: [],
    movedCursor: {
        line: 1,
        column: 1
    },
    editedContent: "",
    savedContent: "",
    vtlVersion: defaultVtlVersion,
    loadedFile: undefined
} as EditorState;

export const editorSlice = createSlice({
    name: "editor",
    initialState: initialState,
    reducers: {
        updateContent(state, action: PayloadAction<string>) {
            state.file.content = action.payload
            state.editedContent = action.payload
            if (action.payload !== state.savedContent) state.file.changed = true
        },
        updateName(state, action: PayloadAction<string>) {
            state.file.name = action.payload
        },
        updateFileMeta(state, action: PayloadAction<EditorFile>) {
            const newFile = Object.assign({}, action.payload);
            newFile.content = state.file.content;
            state.file = newFile;
        },
        markChanged(state) {
            state.file.changed = true
        },
        markUnchanged(state) {
            state.file.changed = false
        },
        updateEdited(state, action: PayloadAction<string>) {
            state.editedContent = action.payload
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
        storeLoaded(state, action: PayloadAction<EditorFile>) {
            state.loadedFile = action.payload
            state.savedContent = action.payload.content
        },
        clearLoaded(state) {
            state.loadedFile = undefined
        }
    }
});

export const {
    updateContent, updateName, updateFileMeta, markChanged, markUnchanged, updateEdited, updateSaved,
    updateCursor, jumpCursor, listErrors, changeVtlVersion, storeLoaded, clearLoaded
} = editorSlice.actions;

export const editorCursor = (state: RootState) => state.editor.cursor;
export const editorFile = (state: RootState) => state.editor.file;
export const fileName = (state: RootState) => state.editor.file.name;
export const fileContent = (state: RootState) => state.editor.file.content;
export const fileChanged = (state: RootState) => state.editor.file.changed;
export const fileRepo = (state: RootState) => state.editor.file.repository;
export const fileId = (state: RootState) => state.editor.file.id;
export const fileVersion = (state: RootState) => state.editor.file.version;
export const movedCursor = (state: RootState) => state.editor.movedCursor;
export const editorErrors = (state: RootState) => state.editor.errors;
export const errorCount = (state: RootState) => state.editor.errors.length;
export const appliedVtlVersion = (state: RootState) => state.editor.vtlVersion;
export const loadedFile = (state: RootState) => state.editor.loadedFile;
export const savedContent = (state: RootState) => state.editor.savedContent;
export const editedContent = (state: RootState) => state.editor.editedContent;

export default editorSlice.reducer;