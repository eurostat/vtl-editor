import * as EditorApi from "monaco-editor/esm/vs/editor/editor.api";
import { editor, Position } from "monaco-editor/esm/vs/editor/editor.api";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import MonacoEditor from "react-monaco-editor";
import { SdmxResult } from "../../sdmx/entity/SdmxResult";
import { getEditorWillMount, getParserFacade } from "../providers";

import { VTL_VERSION } from "../settings";
import "./vtlEditor.css";

export type VtlEditorProps = {
    onContentChange?: (content: string) => void,
    onCursorChange?: (position: CursorPosition) => void,
    onListErrors?: (errors: VtlError[]) => void,
    code: string,
    movedCursor: CursorPosition,
    theme: string,
    languageVersion: VTL_VERSION,
    sdmxResult: SdmxResult | null,
    resizeLayout: any[]
}

let parserFacade: any = {parser: null};

const VtlEditor = ({
                       onContentChange, onCursorChange, onListErrors,
                       code, movedCursor, theme, languageVersion,
                       sdmxResult, resizeLayout
                   }: VtlEditorProps) => {
    const monacoRef = useRef<any>(null);
    console.log("editor render");

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
            monacoRef.current.editor.setPosition(new Position(movedCursor.line, movedCursor.column));
        }
    }, [movedCursor]);

    useEffect(() => {
    }, [code])

    useEffect(() => {
        parserFacade = getParserFacade(languageVersion);
    }, [languageVersion]);

    const didMount = (editor: EditorApi.editor.IStandaloneCodeEditor, monaco: typeof EditorApi) => {

        const parseContent = () => {
            const monacoErrors: EditorApi.editor.IMarkerData[] =
                parserFacade.parser.validate(editor.getValue()).map((error: any) => {
                    return {
                        startLineNumber: error.startLine,
                        startColumn: error.startCol,
                        endLineNumber: error.endLine,
                        endColumn: error.endCol,
                        message: error.message,
                        severity: monaco.MarkerSeverity.Error
                    } as EditorApi.editor.IMarkerData;
                });
            monaco.editor.setModelMarkers(monaco.editor.getModels()[0], "owner", monacoErrors);
            if (onListErrors) onListErrors(monacoErrors.map((error) => {
                return {
                    line: error.startLineNumber,
                    column: error.startColumn,
                    message: error.message
                } as VtlError;
            }));
        };

        let parseContentTO: NodeJS.Timeout;
        let contentChangeTO: NodeJS.Timeout | undefined;

        editor.onDidChangeModelContent(() => {
            if (onContentChange) {
                if (parseContentTO) clearTimeout(parseContentTO);
                parseContentTO = setTimeout(() => parseContent(), 2000);
                if (!contentChangeTO) {
                    contentChangeTO = setTimeout(() => {
                        onContentChange(editor.getValue());
                        contentChangeTO = undefined;
                    }, 200);
                }
            }
        });

        let cursorChangeTO: NodeJS.Timeout | undefined;

        editor.onDidChangeCursorPosition(() => {
            if (onCursorChange && !cursorChangeTO) {
                cursorChangeTO = setTimeout(() => {
                    const position = editor.getPosition();
                    if (position) onCursorChange({line: position.lineNumber, column: position.column});
                    cursorChangeTO = undefined;
                }, 200);
            }
        });
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
                value={code}/>
        </div>)
};

export interface CursorPosition {
    line: number,
    column: number
}

export interface VtlError {
    line: number,
    column: number,
    message: string
}

export default VtlEditor;