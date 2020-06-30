import * as EditorApi from "monaco-editor";
import {CancellationToken, editor, IDisposable, Position} from "monaco-editor";
import {languages} from 'monaco-editor/esm/vs/editor/editor.api';
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import grammar from 'raw-loader!../grammar/vtl-2.0/Vtl.g4';
import {getSuggestions as getSuggestions2_0} from '../grammar/vtl-2.0/suggestions';
import {VtlLexer} from '../grammar/vtl-2.0/VtlLexer';
import {VtlParser} from '../grammar/vtl-2.0/VtlParser';
import {getSuggestions as getSuggestions3_0} from '../grammar/vtl-3.0/suggestions';
import {GrammarGraph} from './grammar-graph/grammarGraph';
import * as ParserFacade from './ParserFacade';
import {createLexer, createParser} from './ParserFacade';
import * as ParserFacadeV3 from "./ParserFacadeV3";
import {languageVersions, VTL_VERSION} from "./settings";
import {TokensProvider} from "./tokensProvider";
import {VocabularyPack} from './vocabularyPack';
import {fromISdmxResult} from "./CompletionItemMapper";
import {ISdmxResult} from "../models/api/ISdmxResult";


const lexer = createLexer("");
const parser = createParser("");
const tokensProvider: TokensProvider = new TokensProvider();
const vocabulary: VocabularyPack<VtlLexer, VtlParser> = new VocabularyPack(lexer, parser);
const grammarGraph: GrammarGraph<VtlLexer, VtlParser> = new GrammarGraph(vocabulary, grammar);

export const getVtlTheme = (): EditorApi.editor.IStandaloneThemeData => {
    return {
        base: 'vs',
        inherit: true,
        rules: [
            {token: 'string', foreground: '018B03'},
            {token: 'comment', foreground: '939393'},
            {token: 'operator', foreground: '8B3301'},
            {token: 'dsdContent', foreground: 'ff002e'},
            {token: 'delimiter.bracket', foreground: '8B3301'},
            {token: 'operator.special', foreground: '8B3301', fontStyle: 'bold'},
        ],
        colors: {}
    }
};

export const getBracketsConfiguration = (): languages.LanguageConfiguration => {
    return {
        "surroundingPairs": [{"open": "{", "close": "}"}, {"open": "(", "close": ")"}, {"open": "[", "close": "]"}],
        "autoClosingPairs": [{"open": "{", "close": "}"}, {"open": "(", "close": ")"}, {"open": "[", "close": "]"}],
        "brackets": [["{", "}"], ["(", ")"], ["[", "]"]]
    }
};
let completionItemDispose: IDisposable | undefined = undefined;

export const getEditorWillMount = (sdmxResult: ISdmxResult | null) => {
    return (monaco: typeof EditorApi) => {
        languageVersions.forEach(version => {
            monaco.languages.register({id: version.code});
            monaco.languages.setMonarchTokensProvider(version.code, tokensProvider.addDsdContent(sdmxResult).monarchLanguage(version.code));
            monaco.editor.defineTheme('vtl', getVtlTheme());
            monaco.languages.setLanguageConfiguration(version.code, getBracketsConfiguration());
            if (completionItemDispose) {
                completionItemDispose.dispose();
            }
            completionItemDispose = monaco.languages.registerCompletionItemProvider(version.code, {
                provideCompletionItems: getSuggestions(version.code, monaco, sdmxResult)
            });
        });
    };
};

const getSuggestions = (version: VTL_VERSION, monaco: typeof EditorApi, sdmxResult: ISdmxResult | null): any => {
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
        const suggestionList: languages.CompletionItem[] = getSuggestionsForVersion(version, range);
        uniquetext = removeLanguageSyntaxFromList(suggestionList, uniquetext);
        let mappedCodeLists: languages.CompletionItem[] = [];
        console.log("autocomplete");
        if (sdmxResult) {
            uniquetext = removeCodeListsFromList(sdmxResult, uniquetext);
            mappedCodeLists = fromISdmxResult(sdmxResult, range);
        }

        const array = uniquetext.map(w => {
            return {
                label: w,
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: w
            } as languages.CompletionItem
        });
        return {
            suggestions: [...suggestionList, ...array, ...mappedCodeLists]
        };
    };

    function removeCodeListsFromList(sdmxResult: ISdmxResult, vars: string[]) {
        const codeListsId: string[] = sdmxResult.codeLists.map(cl => cl.structureId);
        const textsId: string[] = sdmxResult.texts.map(cl => cl.id);
        const listToRemove = [...codeListsId, ...textsId, sdmxResult.timeDimension, sdmxResult.primaryMeasure];
        return removeItemsFromList(listToRemove, vars);
    }

    function removeLanguageSyntaxFromList(suggestionList: languages.CompletionItem[], vars: string[]) {
        const suggestionsLabels = suggestionList.map(s => {
            if (typeof s.label === "string") {
                return s.label;
            } else {
                return s.label.name;
            }
        });
        return removeItemsFromList(suggestionsLabels, vars)
    }

    function removeItemsFromList<T>(items: T[], list: T[]): T[] {
        return list.filter(val => !items.includes(val));
    }
};

export const getSuggestionsForVersion = (version: VTL_VERSION, range: any) => {
    let suggestions: languages.CompletionItem[] | undefined;
    switch (version) {
        case VTL_VERSION.VTL_2_0:
            suggestions = getSuggestions2_0(range);
            return suggestions.length !== 0 ? suggestions : grammarGraph.suggestions();
        case VTL_VERSION.VTL_3_0:
            suggestions = getSuggestions3_0(range);
            return suggestions.length !== 0 ? suggestions : grammarGraph.suggestions();
    }
};

export const getParserFacade = (version: VTL_VERSION) => {
    switch (version) {
        case VTL_VERSION.VTL_2_0:
            return {parser: ParserFacade};
        case VTL_VERSION.VTL_3_0:
            return {parser: ParserFacadeV3};
    }
};