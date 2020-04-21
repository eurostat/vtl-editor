import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import MonacoEditor from "react-monaco-editor";
import {GrammarGraph} from './grammarGraph';
import {TokensProvider} from './tokensProvider';
import * as ParserFacadeV3 from './ParserFacadeV3';
import * as EditorApi from 'monaco-editor/esm/vs/editor/editor.api';
import {languages, Position} from 'monaco-editor/esm/vs/editor/editor.api';
//import {AutoSuggestionsGenerator} from '../auto-suggest/AutoSuggestionsGenerator';
import './vtlEditor.css';
// @ts-ignore
// eslint-disable-next-line import/no-webpack-loader-syntax
import {languageVersions, VTL_VERSION} from "./settings";
import {getBracketsConfiguration, getSuggestions, getVtlTheme} from "./provider/providers";
import {editor} from "monaco-editor/esm/vs/editor/editor.api";

declare const window: any;

type VtlEditorProps = {
    showMenu: boolean;
    showErrorBox: boolean,
    code: string,
    setCode: (value: string) => void,
    setCodeChanged: (value: boolean) => void,
    theme: string,
    languageVersion: VTL_VERSION,
    setCursorPosition: (e: Position) => void,
    tempCursor: Position,
    setErrors: (array: EditorApi.editor.IMarkerData[]) => void,
}

const VtlEditor = ({showMenu, showErrorBox, code, setCode, setCodeChanged, theme, languageVersion, setCursorPosition, tempCursor, setErrors}: VtlEditorProps) => {
    const tokensProvider: TokensProvider = new TokensProvider();
    const grammarGraph: GrammarGraph = new GrammarGraph();
    const monacoRef = useRef(null);

    useEffect(() => {
        if (monacoRef && monacoRef.current) {
            // @ts-ignore
            monacoRef.current.editor.layout();
        }
       // console.log(monacoRef.current, "monaco efect");
    }, [showMenu, showErrorBox]);

    useEffect(() => {
        if (monacoRef && monacoRef.current) {
            // @ts-ignore
            monacoRef.current.editor.focus();
            // @ts-ignore
            monacoRef.current.editor.setPosition(new Position(tempCursor.lineNumber, tempCursor.column));
        }
    }, [tempCursor]);

    const editorWillMount = (monaco: typeof EditorApi) => {
        console.log("define");
        monaco.editor.defineTheme('vtl', getVtlTheme());
        languageVersions.forEach(version => {
            monaco.languages.register({id: version.code});
            monaco.languages.setMonarchTokensProvider(version.code, tokensProvider.monarchLanguage(version.code));
            monaco.languages.setLanguageConfiguration(version.code,getBracketsConfiguration());
            monaco.languages.registerCompletionItemProvider(version.code, {
                provideCompletionItems: getSuggestions(version.code, monaco)
            });
        });
    };

    const didMount = (editor: EditorApi.editor.IStandaloneCodeEditor, monaco: typeof EditorApi) => {
        console.log("DID MOUNT");
        let to: NodeJS.Timeout;
        let onDidChangeTimout = (e: any) => {
            to = setTimeout(() => onDidChange(e), 2000);
        };
        console.log(editor);

        const onDidChange = (e: any) => {
            monaco.languages.setMonarchTokensProvider('vtl-2.0', tokensProvider.monarchLanguage('vtl-2.0'));
            let syntaxErrors = ParserFacadeV3.validate(editor.getValue());
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
            setErrors(monacoErrors);
            window.syntaxErrors = syntaxErrors;
            let model = monaco.editor.getModels()[0];
            monaco.editor.setModelMarkers(model, "owner", monacoErrors);
        };
        editor.onDidChangeModelContent((e: any) => {
            if (to) clearTimeout(to);
            return onDidChangeTimout(e);
        });
        editor.onDidChangeCursorPosition((e: EditorApi.editor.ICursorPositionChangedEvent) => setCursorPosition(e.position));
    };

    const onChange = (newValue: string, e: EditorApi.editor.IModelContentChangedEvent) => {
        console.log("ON CHANGE");
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
                editorWillMount={editorWillMount}
                editorDidMount={didMount}
                height="100%"
                language={languageVersion}
                theme={theme}
                defaultValue=''
                options={options}
                value={code}
                onChange={onChange}/>
        </div>)
};

export default VtlEditor;