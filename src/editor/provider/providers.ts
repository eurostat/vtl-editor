import * as EditorApi from "monaco-editor";
import {getSuggestionListByVersion} from "./suggestionsProvider";
import {VTL_VERSION} from "../settings";
import {languages} from 'monaco-editor/esm/vs/editor/editor.api';

export const getSuggestions = (version: VTL_VERSION, monaco: typeof EditorApi) => {
    let suggestionListByVersion = getSuggestionListByVersion(version, monaco);
    return suggestionListByVersion
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

export const getBracketsConfiguration = (): languages.LanguageConfiguration => {
    return {
        "surroundingPairs": [{"open": "{", "close": "}"},{"open": "(", "close": ")"}, {"open": "[", "close": "]"}],
        "autoClosingPairs": [{"open": "{", "close": "}"},{"open": "(", "close": ")"},{"open": "[", "close": "]"}],
        "brackets": [["{", "}"],["(", ")"],["[", "]"]]
    }
}


export const getEditorWillMount = (languageVersion: VTL_VERSION, tokensProvider: any) => {
    return (monaco: typeof EditorApi) => {
        monaco.languages.register({id: languageVersion});
        monaco.languages.setMonarchTokensProvider(languageVersion, tokensProvider.monarchLanguage(languageVersion));
        monaco.editor.defineTheme('vtl', getVtlTheme());
        monaco.languages.registerCompletionItemProvider(languageVersion, {
            provideCompletionItems: getSuggestions(languageVersion, monaco)
        });
    };
}