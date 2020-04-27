import * as EditorApi from "monaco-editor";
import { CancellationToken, editor, Position } from "monaco-editor";
import { getSuggestions as getSuggestions2_0 } from '../../grammar/vtl-2.0/suggestionsV2-0';
import { VtlLexer } from '../../grammar/vtl-2.0/VtlLexer';
import { VtlParser } from '../../grammar/vtl-2.0/VtlParser';
import { getSuggestions as getSuggestions3_0 } from '../../grammar/vtl-3.0/suggestionsV3-0';
import { AutocompleteProvider } from '../autocompleteProvider';
import { GrammarGraph } from '../grammar-graph/grammarGraph';
import { createLexer, createParser } from '../ParserFacade';
import { VocabularyPack } from '../vocabularyPack';
import { languageVersions, VTL_VERSION } from "../settings";
import { languages } from 'monaco-editor/esm/vs/editor/editor.api';
import { TokensProvider } from "../tokensProvider";
import * as ParserFacade from "../ParserFacade";
import * as ParserFacadeV3 from "../ParserFacadeV3";
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import grammar from 'raw-loader!../../grammar/vtl-2.0/Vtl.g4';

const lexer = createLexer("");
const parser = createParser("");
const tokensProvider: TokensProvider = new TokensProvider();
const vocabulary: VocabularyPack<VtlLexer, VtlParser> = new VocabularyPack(lexer, parser);
const grammarGraph: GrammarGraph<VtlLexer, VtlParser> = new GrammarGraph(vocabulary, grammar);
const autocompleteProvider: AutocompleteProvider = new AutocompleteProvider(grammarGraph.suggestions());

export const getVtlTheme = (): EditorApi.editor.IStandaloneThemeData => {
    return {
        base: 'vs',
        inherit: true,
        rules: [
            {token: 'string', foreground: '018B03'},
            {token: 'comment', foreground: '939393'},
            {token: 'operator', foreground: '8B3301'},
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

export const getEditorWillMount = () => {
    return (monaco: typeof EditorApi) => {
        languageVersions.forEach(version => {
            monaco.languages.register({id: version.code});
            monaco.languages.setMonarchTokensProvider(version.code, tokensProvider.monarchLanguage(version.code));
            monaco.editor.defineTheme('vtl', getVtlTheme());
            monaco.languages.setLanguageConfiguration(version.code, getBracketsConfiguration());
            monaco.languages.registerCompletionItemProvider(version.code, {
                provideCompletionItems: getSuggestions(version.code, monaco)
            });
        });
    };
};

const getSuggestions = (version: VTL_VERSION, monaco: typeof EditorApi): any => {
    return function(model: editor.ITextModel, position: Position, context: languages.CompletionContext, token: CancellationToken) {
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
        // const suggestionList = suggestions(version,range, txt);
        const suggestionList = getSuggestionsForVersion(version, range);
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

export const getSuggestionsForVersion = (version: VTL_VERSION, range: any) => {
    let suggestions :languages.CompletionItem[] | undefined;
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