import * as EditorApi from "monaco-editor";
import {getSuggestionListByVersion} from "./suggestionsProvider";
import {VTL_VERSION} from "../settings";


export const getSuggestions = (version: VTL_VERSION, monaco: typeof EditorApi) => {
    let suggestionListByVersion = getSuggestionListByVersion(version, monaco);
    console.log(suggestionListByVersion)
    return suggestionListByVersion
};

export const getVtlTheme = () : EditorApi.editor.IStandaloneThemeData => {
    return {
        base: 'vs',
        inherit: true,
        rules: [
            {token: 'string', foreground: '018B03'},
            {token: 'operator', foreground: '8B3301'},
            {token: 'operator.special', foreground: '8B3301', fontStyle: 'bold'},
        ],
        colors: {}
    }
};


export const getEditorWillMount = (languageVersion:VTL_VERSION, tokensProvider:any) => {
    return(monaco: typeof EditorApi) => {
        console.log("edit will mount",monaco);
        monaco.languages.register({id: languageVersion});
        monaco.languages.setMonarchTokensProvider(languageVersion, tokensProvider.monarchLanguage(languageVersion));
        monaco.editor.defineTheme('vtl', getVtlTheme());
        monaco.languages.registerCompletionItemProvider(languageVersion, {
            provideCompletionItems: getSuggestions(languageVersion, monaco)
        });
    };
}