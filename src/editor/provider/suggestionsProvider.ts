import * as EditorApi from "monaco-editor";
import {CancellationToken, editor, languages, Position} from "monaco-editor";
import {suggestions} from "./autocompleteProvider";
import {getGrammarByVersion} from "./grammarProvider";
import {VTL_VERSION} from "../settings";


export const getSuggestionListByVersion = (version: VTL_VERSION, monaco: typeof EditorApi): any => {
    const txtByVersion = getGrammarByVersion(version);
    return suggestionsByTxt(version, txtByVersion, monaco);
};

const suggestionsByTxt = (version: VTL_VERSION, txt: string, monaco: typeof EditorApi): any => {
    return function (model: editor.ITextModel, position: Position, context: languages.CompletionContext, token: CancellationToken) {
        const textUntilPosition = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
        });
        const word = model.getWordUntilPosition(position);
        const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
        };

        let uniquetext = Array.from(new Set(textUntilPosition.replace(/"(.*?)"/g, "")
            .replace(/[^a-zA-Z_]/g, " ")
            .split(" ").filter(w => w !== "")).values());
        const suggestionList = suggestions(version,range, txt);
        uniquetext = removeLanguageSyntaxFromList(uniquetext, suggestionList);
        const array = uniquetext.map(w => {
            return {
                label: w,
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: w
            } as languages.CompletionItem
        });
        return {
            suggestions: [...suggestionList, ...array]
        };
    };

    function removeLanguageSyntaxFromList(vars: string[], suggestionList: any[]) {
        const suggestionsLabels = suggestionList.map(s => s.label.toLowerCase());
        return vars.filter(t => !suggestionsLabels.includes(t.toLowerCase()))
    }
};
