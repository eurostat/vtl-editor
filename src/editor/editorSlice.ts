import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../utility/store";
import { DEFAULT_FILENAME, EditorFile } from "./editorFile";
import { CursorPosition, VtlError } from "./vtl-editor/VtlEditor";

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
    loadedContent: ""
} as EditorState;

export const editorSlice = createSlice({
    name: 'editor',
    initialState: initialState,
    reducers: {
        updateContent(state, action: PayloadAction<string>) {
            state.file.content = action.payload
        },
        updateCursor(state, action: PayloadAction<CursorPosition>) {
            state.cursor = action.payload
        },
        markUnedited(state) {
            state.file.edited = false
        },
        markEdited(state) {
            state.file.edited = true
        },
        jumpCursor(state, action: PayloadAction<CursorPosition>) {
            state.movedCursor = action.payload
        },
        listErrors(state, action: PayloadAction<VtlError[]>) {
            state.errors = action.payload
        },
    }
});

export interface EditorState {
    file: EditorFile,
    cursor: CursorPosition,
    errors: VtlError[],
    movedCursor: CursorPosition,
    loadedContent: string
}

export const {updateContent, updateCursor, markEdited, markUnedited, jumpCursor, listErrors} = editorSlice.actions;

export const editorCursor = (state: RootState) => state.editor.cursor;
export const editorFile = (state: RootState) => state.editor.file;
export const fileName = (state: RootState) => state.editor.file.name;
export const fileContent = (state: RootState) => state.editor.file.content;
export const fileEdited = (state: RootState) => state.editor.file.edited;
export const movedCursor = (state: RootState) => state.editor.movedCursor;
export const editorErrors = (state: RootState) => state.editor.errors;
export const errorCount = (state: RootState) => state.editor.errors.length;

export default editorSlice.reducer;