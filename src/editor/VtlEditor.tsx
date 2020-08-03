import * as EditorApi from 'monaco-editor/esm/vs/editor/editor.api';
import {Position} from 'monaco-editor/esm/vs/editor/editor.api';
import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import MonacoEditor from "react-monaco-editor";
import {getEditorWillMount, getParserFacade} from "./providers";

import {VTL_VERSION} from "./settings";
import './vtlEditor.css';
import {SdmxResult} from "../models/api/SdmxResult";

declare const window: any;

export type VtlEditorProps = {
    resizeLayout: any[],
    code: string,
    setCode: (value: string) => void,
    setCodeChanged: (value: boolean) => void,
    theme: string,
    languageVersion: VTL_VERSION,
    setCursorPosition: (e: Position) => void,
    tempCursor: Position,
    setErrors: (array: EditorApi.editor.IMarkerData[]) => void,
    sdmxResult: SdmxResult | null,
}

let parserFacade: any = {parser: null};
let errors: any = {value: ""};


const VtlEditor = ({resizeLayout, code, setCode, setCodeChanged, theme, languageVersion, setCursorPosition, tempCursor, setErrors, sdmxResult}: VtlEditorProps) => {
    const [innerCode, setInnerCode] = useState<string>("");
    const monacoRef = useRef<any>(null);

    useEffect(() => {
        if (monacoRef && monacoRef.current) {
            // @ts-ignore
            monacoRef.current.editor.layout();
        }
    }, [...resizeLayout]);

    useEffect(() => {
        if (monacoRef && monacoRef.current) {
            // @ts-ignore
            monacoRef.current.editor.focus();
            // @ts-ignore
            monacoRef.current.editor.setPosition(new Position(tempCursor.lineNumber, tempCursor.column));
        }
    }, [tempCursor]);

    useEffect(() => {
        setInnerCode(code)
    }, [code])

    useEffect(() => {
        parserFacade = getParserFacade(languageVersion);
    }, [languageVersion]);

    const didMount = (editor: EditorApi.editor.IStandaloneCodeEditor, monaco: typeof EditorApi) => {
        let to: NodeJS.Timeout;
        let cursorTO: NodeJS.Timeout;
        let delayCursorSettingAction = (e: any) => {
            cursorTO = setTimeout(() => {
                setCursorPosition(e.position);
            }, 400);
        }
        let onDidChangeTimout = (e: any) => {
            to = setTimeout(() => onDidChange(e), 2000);
        };

        const onDidChange = (e: any) => {
            // @ts-ignore
            let syntaxErrors = parserFacade.parser.validate(editor.getValue());
            setCode(editor.getValue());
            setCodeChanged(true);
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
            let errorsString = monacoErrors.map(e => e.message).reduce((e1, e2) => e1 + ", " + e2, "");
            if (errorsString !== errors.value) {
                setErrors(monacoErrors);
                errors = {value: errorsString};
            }
            window.syntaxErrors = syntaxErrors;
            let model = monaco.editor.getModels()[0];
            monaco.editor.setModelMarkers(model, "owner", monacoErrors);
        };
        editor.onDidChangeModelContent((e: any) => {
            if (to) clearTimeout(to);
            return onDidChangeTimout(e);
        });
        editor.onDidChangeCursorPosition((e: EditorApi.editor.ICursorPositionChangedEvent) => {
            if (cursorTO) clearTimeout(cursorTO);
            return delayCursorSettingAction(e);
        });
    };

    const onChange = (newValue: string, e: EditorApi.editor.IModelContentChangedEvent) => {
        setInnerCode(newValue);
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
                key={sdmxResult?.dataStructureInfo.name || ""}
                ref={monacoRef}
                editorWillMount={getEditorWillMount(sdmxResult)}
                editorDidMount={didMount}
                height="100%"
                language={languageVersion}
                theme={theme}
                defaultValue=''
                options={options}
                value={innerCode}
                onChange={onChange}/>
        </div>)
};

export default VtlEditor;