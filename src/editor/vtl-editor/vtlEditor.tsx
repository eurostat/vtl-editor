import * as EditorApi from "monaco-editor/esm/vs/editor/editor.api";
import { Position } from "monaco-editor/esm/vs/editor/editor.api";
import * as React from "react";
import { useEffect, useRef } from "react";
import MonacoEditor from "react-monaco-editor";
import { SdmxResult } from "../../sdmx/entity/SdmxResult";
import { getEditorWillMount, getParserFacade, refreshSuggestions } from "../providers";

import { VtlVersion } from "../settings";
import "./vtlEditor.css";

export type VtlEditorProps = {
    onContentChange?: (content: string) => void,
    onCursorChange?: (position: CursorPosition) => void,
    onListErrors?: (errors: VtlError[]) => void,
    loaded?: { content: string },
    movedCursor: CursorPosition,
    theme: string,
    vtlVersion: VtlVersion,
    sdmxResult: SdmxResult | undefined,
    resizeLayout: any
}

let parserFacade: any = {parser: null};

const VtlEditor = ({
                       onContentChange, onCursorChange, onListErrors,
                       loaded, movedCursor, theme, vtlVersion,
                       sdmxResult, resizeLayout
                   }: VtlEditorProps) => {
    const monacoRef = useRef<MonacoEditor>(null);

    useEffect(() => {
        monacoRef?.current?.editor?.layout();
    }, [resizeLayout]);

    useEffect(() => {
        monacoRef?.current?.editor?.focus();
        monacoRef?.current?.editor?.setPosition(new Position(movedCursor.line, movedCursor.column));
    }, [movedCursor]);

    useEffect(() => {
        if (loaded !== undefined && loaded.content !== undefined) {
            monacoRef?.current?.editor?.setValue(loaded.content);
        }
    }, [loaded])

    useEffect(() => {
        parserFacade = getParserFacade(vtlVersion);
        parseContent();
    }, [vtlVersion]);

    useEffect(() => {
        refreshSuggestions(sdmxResult);
    }, [sdmxResult]);

    const parseContent = () => {
        const editor = monacoRef?.current?.editor;
        if (editor) {
            const monacoErrors: EditorApi.editor.IMarkerData[] =
                parserFacade.parser.validate(editor.getValue()).map((error: any) => {
                    return {
                        startLineNumber: error.startLine,
                        startColumn: error.startCol,
                        endLineNumber: error.endLine,
                        endColumn: error.endCol,
                        message: error.message,
                        severity: EditorApi.MarkerSeverity.Error
                    } as EditorApi.editor.IMarkerData;
                });
            EditorApi.editor.setModelMarkers(EditorApi.editor.getModels()[0], "owner", monacoErrors);
            if (onListErrors) onListErrors(monacoErrors.map((error) => {
                return {
                    line: error.startLineNumber,
                    column: error.startColumn,
                    message: error.message
                } as VtlError;
            }));
        }
    };

    const didMount = (editor: EditorApi.editor.IStandaloneCodeEditor, monaco: typeof EditorApi) => {
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

        editor.onDidChangeCursorPosition(() => {
            if (onCursorChange) {
                const position = editor.getPosition();
                if (position) onCursorChange({line: position.lineNumber, column: position.column});
            }
        });
    };

    const options = {
        minimap: {
            enabled: true
        },
        automaticLayout: true
    };

    console.log("vtl editor render");
    return (
        <div className="editor-container">
            <MonacoEditor
                ref={monacoRef}
                editorWillMount={getEditorWillMount}
                editorDidMount={didMount}
                height="100%"
                language={vtlVersion}
                theme={theme}
                defaultValue=''
                options={options}
            />
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