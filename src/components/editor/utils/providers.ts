import * as EditorApi from "monaco-editor";
import { editor, IDisposable, Position } from "monaco-editor";
import { languages } from "monaco-editor/esm/vs/editor/editor.api";
import { GrammarGraph } from "../grammar-graph/grammarGraph";
import { createLexer, createParser } from "./ParserFacade";
import { TokensProvider } from "./tokensProvider";
import { VocabularyPack } from "./vocabularyPack";
import { VARIABLE } from "./constants";
import { CustomTools, SdmxResult, Variable } from "../../../model";
import { fromISdmxResult } from "./completionItemMapper";

export const getTheme = (): EditorApi.editor.IStandaloneThemeData => {
    return {
        base: "vs",
        inherit: true,
        rules: [
            { token: "string", foreground: "018B03" },
            { token: "comment", foreground: "939393" },
            { token: "operator", foreground: "8B3301" },
            { token: "delimiter.bracket", foreground: "8B3301" },
            { token: "operator.special", foreground: "8B3301", fontStyle: "bold" },
        ],
        colors: {},
    };
};

export const getBracketsConfiguration = (): languages.LanguageConfiguration => {
    return {
        surroundingPairs: [
            { open: "{", close: "}" },
            { open: "(", close: ")" },
            { open: "[", close: "]" },
        ],
        autoClosingPairs: [
            { open: "{", close: "}" },
            { open: "(", close: ")" },
            { open: "[", close: "]" },
        ],
        brackets: [
            ["{", "}"],
            ["(", ")"],
            ["[", "]"],
        ],
    };
};

let completionItemDispose: IDisposable | undefined = undefined;

export const getEditorWillMount =
    (tools: CustomTools) =>
    ({ variables, sdmxResult }: { variables: Variable[]; sdmxResult: SdmxResult | undefined }) => {
        const tokensProvider: TokensProvider = new TokensProvider(tools);
        const { id } = tools;
        return (monaco: typeof EditorApi) => {
            monaco.languages.register({ id });
            monaco.languages.setMonarchTokensProvider(id, tokensProvider.monarchLanguage());
            monaco.editor.defineTheme(id.replace(".", "-"), getTheme());
            monaco.editor.defineTheme("vtl-default", getVtlTheme("vtl-default"));
            monaco.editor.defineTheme("vtl-light", getVtlTheme("vtl-light"));
            monaco.editor.defineTheme("vtl-dark", getVtlTheme("vtl-dark"));
            monaco.editor.defineTheme("vtl-black", getVtlTheme("vtl-black"));
            monaco.languages.setLanguageConfiguration(id, getBracketsConfiguration());
            if (completionItemDispose) {
                completionItemDispose.dispose();
            }
            completionItemDispose = EditorApi.languages.registerCompletionItemProvider(id, {
                provideCompletionItems: getSuggestions(tools, { variables, sdmxResult }),
            });
        };
    };

const buildGrammarGraph = (tools: CustomTools) => {
    const { lexer: Lexer, parser: Parser, grammar } = tools;
    const lexer = createLexer(Lexer)("");
    const parser = createParser({ Lexer, Parser })("");
    const vocabulary: VocabularyPack<typeof lexer, typeof parser> = new VocabularyPack(lexer, parser);
    const grammarGraph: GrammarGraph<typeof lexer, typeof parser> = new GrammarGraph(
        vocabulary,
        grammar,
    );
    return grammarGraph;
};

export const getVtlTheme = (name: string): EditorApi.editor.IStandaloneThemeData => {
    switch (name) {
        case "vtl-default": {
            return {
                base: "vs",
                inherit: true,
                rules: [
                    { token: "string", foreground: "018B03" },
                    { token: "comment", foreground: "939393" },
                    { token: "operator", foreground: "8B3301" },
                    { token: "attribute", foreground: "9ffb88" },
                    { token: "dimension", foreground: "f7b74e" },
                    { token: "primaryMeasure", foreground: "953d55" },
                    { token: "delimiter.bracket", foreground: "8B3301" },
                    { token: "operator.special", foreground: "8B3301", fontStyle: "bold" },
                ],
                colors: {},
            };
        }
        case "vtl-light": {
            return {
                base: "vs",
                inherit: true,
                rules: [
                    { token: "attribute", foreground: "9ffb88" },
                    { token: "dimension", foreground: "f7b74e" },
                    { token: "primaryMeasure", foreground: "953d55" },
                ],
                colors: {},
            };
        }
        case "vtl-dark": {
            return {
                base: "vs-dark",
                inherit: true,
                rules: [
                    { token: "attribute", foreground: "9ffb88" },
                    { token: "dimension", foreground: "f7b74e" },
                    { token: "primaryMeasure", foreground: "953d55" },
                ],
                colors: {},
            };
        }
        case "vtl-black": {
            return {
                base: "hc-black",
                inherit: true,
                rules: [
                    { token: "attribute", foreground: "9ffb88" },
                    { token: "dimension", foreground: "f7b74e" },
                    { token: "primaryMeasure", foreground: "953d55" },
                ],
                colors: {},
            };
        }
    }
    return { base: "vs", colors: {}, inherit: true, rules: [] };
};

function removeItemsFromList<T>(items: T[], list: T[]): T[] {
    return list.filter(val => !items.includes(val));
}

const removeCodeListsFromList = (importedDsd: SdmxResult, vars: string[]) => {
    const codeListsId: string[] = importedDsd.dimension.codeLists
        .concat(importedDsd.attribute.codeLists)
        .map(cl => cl.structureId);
    const textsId: string[] = importedDsd.dimension.texts
        .concat(importedDsd.attribute.texts)
        .map(cl => cl.id);
    const listToRemove = [
        ...codeListsId,
        ...textsId,
        importedDsd.timeDimension,
        importedDsd.primaryMeasure,
    ];
    return removeItemsFromList(listToRemove, vars);
};

const getSuggestions = (
    tools: CustomTools,
    { variables, sdmxResult }: { variables?: Variable[]; sdmxResult?: SdmxResult },
): any => {
    return function (model: editor.ITextModel, position: Position) {
        const textUntilPosition = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
        });
        const word = model.getWordUntilPosition(position);
        const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
        };

        let uniquetext = Array.from(
            new Set(
                textUntilPosition
                    .replace(/"(.*?)"/g, "")
                    .replace(/[^a-zA-Z_]/g, " ")
                    .split(" ")
                    .filter(w => w !== ""),
            ).values(),
        );
        buildGrammarGraph(tools);
        const { getSuggestionsFromRange } = tools;
        const grammarSuggestions = getSuggestionsFromRange(range);
        const suggestionList: languages.CompletionItem[] =
            grammarSuggestions.length !== 0
                ? grammarSuggestions
                : buildGrammarGraph(tools).suggestions();
        uniquetext = removeLanguageSyntaxFromList(uniquetext, suggestionList);

        let mappedCodeLists: languages.CompletionItem[] = [];

        if (sdmxResult) {
            uniquetext = removeCodeListsFromList(sdmxResult, uniquetext);
            mappedCodeLists = fromISdmxResult(sdmxResult, range);
        }

        const array = uniquetext.map(w => {
            return {
                label: w,
                kind: EditorApi.languages.CompletionItemKind.Variable,
                insertText: w,
            } as languages.CompletionItem;
        });
        const vars = (variables || []).map(({ label, name }) => ({
            label,
            kind: VARIABLE,
            insertText: name,
            range,
        }));
        return {
            suggestions: [...suggestionList, ...array, ...vars, ...mappedCodeLists],
        };
    };

    function removeLanguageSyntaxFromList(vars: string[], suggestionList: any[]) {
        const suggestionsLabels = suggestionList.map(s => s.label.toLowerCase());
        return vars.filter(t => !suggestionsLabels.includes(t.toLowerCase()));
    }
};
