import * as React from 'react';
import MonacoEditor, {EditorWillMount} from "react-monaco-editor";
import * as VtlTokensProvider from './VtlTokensProvider';
import * as ParserFacade from './ParserFacade';
import * as EditorApi from 'monaco-editor/esm/vs/editor/editor.api';
//import {AutoSuggestionsGenerator} from '../auto-suggest/AutoSuggestionsGenerator';
import './vtl-editor.css';
import {editor} from "monaco-editor/esm/vs/editor/editor.api";
import {Position} from "monaco-editor/esm/vs/editor/editor.api";
import {languages} from "monaco-editor";
import {CancellationToken} from "monaco-editor/esm/vs/editor/editor.api";
import {suggestions} from "./vtl-2.0.autocompleteProvider";
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import txt from 'raw-loader!../grammar/vtl-2.0/Vtl.g4';

declare const window: any;
export default class VtlEditor extends React.Component {

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
    idFg = '000000';
    symbolsFg = '990000';
    keywordFg = '7132a8';
    errorFg = 'ff0000';
    eolFg = '009900';

    editor = (monaco: any) => {
        monaco.languages.register({id: 'vtl'});
        monaco.languages.setTokensProvider('vtl', new VtlTokensProvider.VtlTokensProvider());
        monaco.editor.defineTheme('vtlTheme', {
            base: 'vs',
            inherit: false,
            rules: [
                {token: 'assign.vtl', foreground: this.symbolsFg},
                {token: '1.vtl', foreground: this.symbolsFg},
                {token: '2.vtl', foreground: this.symbolsFg},
                {token: '3.vtl', foreground: this.symbolsFg},
                {token: '4.vtl', foreground: this.symbolsFg},
                {token: '11.vtl', foreground: this.symbolsFg},
                {token: '13.vtl', foreground: this.symbolsFg},
                {token: '14.vtl', foreground: this.symbolsFg},
                {token: '5.vtl', foreground: this.symbolsFg},
                {token: '6.vtl', foreground: this.symbolsFg},
                {token: 'cartesian_per.vtl', foreground: this.symbolsFg},


                {token: 'integer_constant.vtl', foreground: this.symbolsFg, fontStyle: 'bold'},

                {token: 'eol.vtl', foreground: this.eolFg, fontStyle: 'bold'},
                {token: 'string_constant.vtl', foreground: this.literalFg},

                {token: 'subspace.vtl', foreground: this.keywordFg, fontStyle: 'bold'},
                {token: 'order.vtl', foreground: this.keywordFg, fontStyle: 'bold'},
                {token: 'lag.vtl', foreground: this.keywordFg, fontStyle: 'bold'},
                {token: 'over.vtl', foreground: this.keywordFg, fontStyle: 'bold'},
                {token: 'check.vtl', foreground: this.keywordFg, fontStyle: 'bold'},
                {token: 'by.vtl', foreground: this.keywordFg, fontStyle: 'bold'},
                {token: 'filter.vtl', foreground: this.keywordFg, fontStyle: 'bold'},
                {token: 'errorcode.vtl', foreground: this.keywordFg, fontStyle: 'bold'},
                {token: 'errorlevel.vtl', foreground: this.keywordFg, fontStyle: 'bold'},
                {token: 'abs.vtl', foreground: this.keywordFg, fontStyle: 'bold'},

                {token: 'identifier.vtl', foreground: this.idFg, fontStyle: 'italic'},
            ]
        });


        monaco.languages.registerCompletionItemProvider("vtl", {
            provideCompletionItems: function (model: editor.ITextModel, position: Position, context: languages.CompletionContext, token: CancellationToken) {
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
                const suggestionList = suggestions(range, txt);
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



    didMount = (editor: any, monaco: any) => {
        console.log("DID MOUNT");
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
        console.log("ON CHANGE");
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
                <MonacoEditor editorWillMount={this.editor} editorDidMount={this.didMount} height="60vh" language="vtl"
                              theme="vtlTheme" defaultValue='' options={this.options}
                              value={this.state.code} onChange={this.onChange}/>
            </div>)
    }

}