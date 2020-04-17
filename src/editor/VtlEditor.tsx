import { languages } from "monaco-editor";
import * as EditorApi from 'monaco-editor/esm/vs/editor/editor.api';
import { CancellationToken, editor, Position } from 'monaco-editor/esm/vs/editor/editor.api';
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import grammar from 'raw-loader!../grammar/vtl-2.0/Vtl.g4';
import * as React from 'react';
import MonacoEditor from "react-monaco-editor";
import { suggestions } from "../grammar/vtl-2.0/vtl-2.0.autocompleteProvider";
import { VtlLexer } from '../grammar/vtl-2.0/VtlLexer';
import { VtlParser } from '../grammar/vtl-2.0/VtlParser';
import { GrammarGraph } from './grammarGraph';
import * as ParserFacade from './ParserFacade';
import { createLexer, createParser } from './ParserFacade';
import { TokensProvider } from './tokensProvider';
//import {AutoSuggestionsGenerator} from '../auto-suggest/AutoSuggestionsGenerator';
import './vtlEditor.css';
import { VocabularyPack } from './vocabularyPack';

declare const window: any;
export default class VtlEditor extends React.Component {
    private lexer = createLexer("");
    private parser = createParser("");
    private tokensProvider: TokensProvider = new TokensProvider();
    private vocabulary: VocabularyPack<VtlLexer, VtlParser> = new VocabularyPack(this.lexer,this.parser);
    private grammarGraph: GrammarGraph<VtlLexer, VtlParser> = new GrammarGraph(this.vocabulary, grammar);

    state = {
        code: [
            'ds_PY := lag ( na_main, 1 ) over ( order by time );',
            '',
            'ds_L_CY := na_main [ sub prices = "L" ] ;',
            'ds_L_PY := ds_PY [ sub prices = "L" ] ;',
            'ds_V_PY := ds_PY [ sub prices = "V" ] ;',
            'ds_Y_CY := na_main [ sub prices = "Y" ] ;',
            '',

            'ErrB:= check((abs(ds_Y_CY-(ds_L_CY / ds_L_PY[ filter obs_value <> 0 ] * ds_V_PY)) / ds_Y_CY [ filter obs_value <> 0 ]) < 0.001, ',
            '	errorcode("The observation values do not comply with the Y(t)= L(t) * V(t-1) / L(t-1) relation"), ',
            '	errorlevel("Error") );',
            '',
            'ErrB'
        ].join('\n'),
    };

    literalFg = '3b8737';
    idFg = '#f8f8f8';
    symbolsFg = '990000';
    keywordFg = '7132a8';
    errorFg = 'ff0000';
    eolFg = '009900';

    editor = (monaco: typeof EditorApi) => {
        monaco.languages.register({id: 'vtl-2.0'});
        monaco.languages.setMonarchTokensProvider('vtl-2.0', this.tokensProvider.monarchLanguage('vtl-2.0'));
        //monaco.languages.setTokensProvider('vtl', new VtlTokensProvider.VtlTokensProvider());
        monaco.editor.defineTheme('vtl', {
            base: 'vs',
            inherit: true,
            rules: [
                {token: 'string', foreground: '018B03'},
                {token: 'operator', foreground: '8B3301'},
                {token: 'delimiter.bracket', foreground: '8B3301'},
                {token: 'operator.special', foreground: '8B3301', fontStyle: 'bold'},
            ],
            colors: {}
        });

        monaco.languages.registerCompletionItemProvider("vtl-2.0", {
            provideCompletionItems: function(model: editor.ITextModel, position: Position, context: languages.CompletionContext, token: CancellationToken) {
                // find out if we are completing a property in the 'dependencies' object.
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
                const suggestionList = suggestions(range, grammar);
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
            }
        });

        function removeLanguageSyntaxFromList(vars: string[], suggestionList: any[]) {
            const suggestionsLabels = suggestionList.map(s => s.label.toLowerCase());
            return vars.filter(t => !suggestionsLabels.includes(t.toLowerCase()))
        }

    };

    didMount = (editor: any, monaco: typeof EditorApi) => {
        let to: NodeJS.Timeout;
        let onDidChangeTimout = (e: any) => {
            to = setTimeout(() => onDidChange(e), 2000);
        };

        let onDidChange = (e: any) => {
            let code = this.state.code;
            let syntaxErrors = ParserFacade.validate(code);
            let monacoErrors = [];
            for (let e of syntaxErrors) {
                monacoErrors.push({
                    startLineNumber: e.startLine,
                    startColumn: e.startCol,
                    endLineNumber: e.endLine,
                    endColumn: e.endCol,
                    message: e.message,
                    severity: monaco.MarkerSeverity.Error
                });
            }

            window.syntaxErrors = syntaxErrors;
            let model = monaco.editor.getModels()[0];
            monaco.editor.setModelMarkers(model, "owner", monacoErrors);
        };
        editor.onDidChangeModelContent((e: any) => {
            if (to) clearTimeout(to);
            onDidChangeTimout(e);
        });
    };

    onChange = (newValue: string, e: EditorApi.editor.IModelContentChangedEvent) => {
        this.setState({code: newValue});
    };

    options = {
        minimap: {
            enabled: true
        },
        automaticLayout: true
    };

    render() {
        return (
            <div className="editor-container">
                <MonacoEditor editorWillMount={this.editor} editorDidMount={this.didMount} height="60vh" language="vtl-2.0" theme="vtl" defaultValue='' options={this.options}
                              value={this.state.code} onChange={this.onChange}/>
            </div>)
    }

}