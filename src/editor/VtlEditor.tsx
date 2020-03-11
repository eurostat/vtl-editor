import * as React from 'react';
import MonacoEditor, {EditorWillMount} from "react-monaco-editor";
import * as VtlTokensProvider from './VtlTokensProvider';
import * as ParserFacade from './ParserFacade';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';
//import {AutoSuggestionsGenerator} from '../auto-suggest/AutoSuggestionsGenerator';
import './vtl-editor.css';

declare const window: any;
export default class VtlEditor extends React.Component {

    state = {
        code: [
            'input salary',
            'input nEmployees',
            'input revenues',
            'input otherExpenses',
            'input taxRate',
            '',
            'totalExpenses = salary * nEmployees + otherExpenses',
            'grossProfit = revenues - totalExpenses',
            'totalTaxes = grossProfit * (taxRate / 100)',
            'profit = profit - totalTaxes',
            '',
            'output totalTaxes',
            'output profit',
            ''
        ].join('\n'),
    }

    literalFg = '3b8737';
    idFg = '344482';
    symbolsFg = '000000';
    keywordFg = '7132a8';
    errorFg = 'ff0000';

    editor = (monaco: any) => {
        monaco.languages.register({id: 'vtl'});
        monaco.languages.setTokensProvider('vtl', new VtlTokensProvider.VtlTokensProvider());
        monaco.editor.defineTheme('vtlTheme', {
            base: 'vs',
            inherit: false,
            rules: [
                {token: 'number_lit.calc', foreground: this.literalFg},

                {token: 'id.calc', foreground: this.idFg, fontStyle: 'italic'},

                {token: 'lparen.calc', foreground: this.symbolsFg},
                {token: 'rparen.calc', foreground: this.symbolsFg},

                {token: 'equal.calc', foreground: this.symbolsFg},
                {token: 'minus.calc', foreground: this.symbolsFg},
                {token: 'plus.calc', foreground: this.symbolsFg},
                {token: 'div.calc', foreground: this.symbolsFg},
                {token: 'mul.calc', foreground: this.symbolsFg},

                {token: 'input_kw.calc', foreground: this.keywordFg, fontStyle: 'bold'},
                {token: 'output_kw.calc', foreground: this.keywordFg, fontStyle: 'bold'},

                {token: 'unrecognized.calc', foreground: this.errorFg}
            ]
        });

        // let editor = monaco.editor.create(document.getElementById('container'), {
        //     value: [
        //         'input salary',
        //         'input nEmployees',
        //         'input revenues',
        //         'input otherExpenses',
        //         'input taxRate',
        //         '',
        //         'totalExpenses = salary * nEmployees + otherExpenses',
        //         'grossProfit = revenues - totalExpenses',
        //         'totalTaxes = grossProfit * (taxRate / 100)',
        //         'profit = profit - totalTaxes',
        //         '',
        //         'output totalTaxes',
        //         'output profit',
        //         ''
        //     ].join('\n'),
        //     language: 'vtl',
        //     theme: 'vtlTheme'
        // });


        // editor.onDidChangeModelContent(function (e) {
        // 	let code = editor.getValue()
        // 	let syntaxErrors = ParserFacade.validate(code);
        // 	let monacoErrors = [];
        // 	for (let e of syntaxErrors) {
        // 		monacoErrors.push({
        // 			startLineNumber: e.startLine,
        // 			startColumn: e.startCol,
        // 			endLineNumber: e.endLine,
        // 			endColumn: e.endCol,
        // 			message: e.message,
        // 			severity: monaco.MarkerSeverity.Error
        // 		});
        // 	};
        // 	window.syntaxErrors = syntaxErrors;
        // 	let model = monaco.editor.getModels()[0];
        // 	monaco.editor.setModelMarkers(model, "owner", monacoErrors);
        // });
        // console.log(monaco);
        // console.log(monaco.editor);

    }

    didMount = (editor: any, monaco: any) => {
        console.log("DID MOUNT");
        console.log(editor);
        console.log(monaco);
        let to: NodeJS.Timeout;
        let onDidChangeTimout = (e: any) => {
            to = setTimeout(() => onDidChange(e), 2000);
        }

        let onDidChange = (e: any) => {
            console.log("Test");
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
            ;
            window.syntaxErrors = syntaxErrors;
            let model = monaco.editor.getModels()[0];
            monaco.editor.setModelMarkers(model, "owner", monacoErrors);
        }
        editor.onDidChangeModelContent((e: any) => {
            if (to) clearTimeout(to);
            onDidChangeTimout(e);
        });
    }

    onChange = (newValue: string, e: monacoEditor.editor.IModelContentChangedEvent) => {
        console.log("ON CHANGE");
        console.log(newValue);
        console.log(e);
        // console.log('onChange', newValue, e);
        this.setState({code: newValue});

    }

    options = {
        minimap: {
            enabled: true
        },
        automaticLayout: true
    }

    render() {
        return (
            <div className="editor-container">
                <MonacoEditor
                    editorWillMount={this.editor}
                    editorDidMount={this.didMount}
                    height="60vh"
                    language="vtl"
                    theme="vtlTheme"
                    defaultValue=''
                    options={this.options}
                    value={this.state.code}
                    onChange={this.onChange}
                />
            </div>)
    }

}