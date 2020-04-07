import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import MonacoEditor from "react-monaco-editor";
import {GrammarGraph} from './grammarGraph';
import {TokensProvider} from './tokensProvider';
import * as ParserFacade from './ParserFacade';
import * as EditorApi from 'monaco-editor/esm/vs/editor/editor.api';
import {CancellationToken, editor, Position} from 'monaco-editor/esm/vs/editor/editor.api';
//import {AutoSuggestionsGenerator} from '../auto-suggest/AutoSuggestionsGenerator';
import './vtlEditor.css';
import {languages} from "monaco-editor";
import {suggestions} from "../grammar/vtl-2.0/vtl-2.0.autocompleteProvider";
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import txt from 'raw-loader!../grammar/vtl-2.0/Vtl.g4';


declare const window: any;


const defaultText = `ds_PY := lag ( na_main, 1 ) over ( order by time );

ds_L_CY := na_main [ sub prices = "L" ] ;
ds_L_PY := ds_PY [ sub prices = "L" ] ;
ds_V_PY := ds_PY [ sub prices = "V" ] ;
ds_Y_CY := na_main [ sub prices = "Y" ] ;


ErrB:= check((abs(ds_Y_CY-(ds_L_CY / ds_L_PY[ filter obs_value <> 0 ] * ds_V_PY)) / ds_Y_CY [ filter obs_value <> 0 ]) < 0.001, 
    errorcode("The observation values do not comply with the Y(t)= L(t) * V(t-1) / L(t-1) relation"), 
    errorlevel("Error") );

ErrB`;

type VtlEditorProps = {
    browsedFiles: string[],
    showMenu: boolean;
    code: string,
    setCode: (value: string) => void,
    setCodeChanged: (value: boolean) => void,
    theme: string,
    languageVersion: string
}

const VtlEditor = ({browsedFiles, showMenu, code, setCode, setCodeChanged, theme, languageVersion}: VtlEditorProps) => {
    const tokensProvider: TokensProvider = new TokensProvider();
    const grammarGraph: GrammarGraph = new GrammarGraph();
    // const [code, setCode] = useState(defaultText);
    const monacoRef = useRef(null);

    useEffect(() => {
        console.log("USE EFFECT");
        console.log(browsedFiles.length);
        if (browsedFiles.length > 0) {
            console.log("if statement");
            setCode(browsedFiles[0]);
        }
    }, [browsedFiles]);

    useEffect(() => {
        if (monacoRef && monacoRef.current) {
            // @ts-ignore
            monacoRef.current.editor.layout();
        }
    }, [showMenu]);

    const editor = (monaco: typeof EditorApi) => {
        monaco.languages.register({id: 'vtl-2.0'});
        monaco.languages.setMonarchTokensProvider('vtl-2.0', tokensProvider.monarchLanguage('vtl-2.0'));
        //monaco.languages.setTokensProvider('vtl', new VtlTokensProvider.VtlTokensProvider());
        monaco.editor.defineTheme('vtl', {
            base: 'vs',
            inherit: true,
            rules: [
                {token: 'string', foreground: '018B03'},
                {token: 'operator', foreground: '8B3301'},
                {token: 'operator.special', foreground: '8B3301', fontStyle: 'bold'},
            ],
            colors: {}
        });


        monaco.languages.registerCompletionItemProvider("vtl-2.0", {
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


    const didMount = (editor: any, monaco: typeof EditorApi) => {
        console.log("DID MOUNT");
        let to: NodeJS.Timeout;
        let onDidChangeTimout = (e: any) => {
            to = setTimeout(() => onDidChange(e), 2000);
        };

        let onDidChange = (e: any) => {
            // console.log("Test");
            // this.tokensProvider.addVariables();
            monaco.languages.setMonarchTokensProvider('vtl-2.0', tokensProvider.monarchLanguage('vtl-2.0'));
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

    const onChange = (newValue: string, e: EditorApi.editor.IModelContentChangedEvent) => {
        console.log("ON CHANGE");
        // console.log(newValue);
        // console.log(e);
        // console.log('onChange', newValue, e);
        setCode(newValue);
        setCodeChanged(true);

    };

    const options = {
        minimap: {
            enabled: true
        },
        automaticLayout: true
    };
    return (
        <div className="editor-container">
            <MonacoEditor
                ref={monacoRef}
                editorWillMount={editor}
                editorDidMount={didMount}
                height="60vh"
                language="vtl-2.0"
                theme={theme}
                defaultValue=''
                options={options}
                value={code}
                onChange={onChange}/>
        </div>)
};

export default VtlEditor;