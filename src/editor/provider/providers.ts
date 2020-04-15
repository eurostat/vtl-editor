import * as EditorApi from "monaco-editor";
import { getSuggestionListByVersion } from "./suggestionsProvider";
import { VTL_VERSION } from "../settings";

export const getSuggestions = (version: VTL_VERSION, monaco: typeof EditorApi) => {
    return getSuggestionListByVersion(version, monaco)
};

export const getVtlTheme = (): EditorApi.editor.IStandaloneThemeData => {
    return {
        base: 'vs',
        inherit: true,
        rules: [
            {token: 'string', foreground: '018B03'},
            {token: 'comment', foreground: '939393'},
            {token: 'operator', foreground: '8B3301'},
            {token: 'operator.special', foreground: '8B3301', fontStyle: 'bold'},
        ],
        colors: {}
    }
};