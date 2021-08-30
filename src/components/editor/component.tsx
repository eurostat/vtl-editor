import { useState, useEffect, useRef, useCallback } from "react";
import * as EditorApi from "monaco-editor/esm/vs/editor/editor.api";
import { Position } from "monaco-editor/esm/vs/editor/editor.api";
import MonacoEditor from "react-monaco-editor";
import { SdmxResult } from "../../model";
import { getEditorWillMount } from "./utils/providers";
import { validate } from "./utils/ParserFacade";
import { CursorPosition, CustomTools, Error, Options, Variables } from "../../model";
import { buildVariables, buildUniqueVariables } from "./utils/variables";
import { buildCustomOptions, buildStyle } from "./utils/customization";

import "./editor.css";

type EditorProps = {
    script: string;
    setScript: (value: string) => void;
    sdmxResult?: SdmxResult;
    sdmxResultURL?: string;
    readOnly?: boolean;
    variables: Variables;
    variableURLs: string[];
    tools: CustomTools;
    options: Options;
    onCursorChange: (position: CursorPosition) => void;
    onListErrors?: (errors: Error[]) => void;
    movedCursor?: CursorPosition;
    resizeLayout?: any;
};

const Editor = ({
    script,
    setScript,
    sdmxResult,
    sdmxResultURL,
    variables,
    variableURLs,
    tools,
    options,
    onCursorChange,
    onListErrors,
    movedCursor,
    readOnly,
    resizeLayout,
}: EditorProps) => {
    const [vars, setVars] = useState(buildVariables(variables));
    const [sdmxRes, setSdmxRes] = useState(sdmxResult);
    const [ready, setReady] = useState(false);

    const monacoRef = useRef<MonacoEditor>(null);

    useEffect(() => {
        monacoRef?.current?.editor?.layout();
    }, [resizeLayout]);

    useEffect(() => {
        if (movedCursor) {
            monacoRef?.current?.editor?.focus();
            monacoRef?.current?.editor?.setPosition(new Position(movedCursor.line, movedCursor.column));
        }
    }, [movedCursor]);

    // TODO: better handle tool updates
    useEffect(() => {
        parseContent(tools);
    }, []);

    const parseContent = useCallback(
        (t: CustomTools) => {
            const editor = monacoRef?.current?.editor;
            if (editor) {
                const monacoErrors: EditorApi.editor.IMarkerData[] = validate(t)(editor.getValue()).map(
                    (error: any) => {
                        return {
                            startLineNumber: error.startLine,
                            startColumn: error.startCol,
                            endLineNumber: error.endLine,
                            endColumn: error.endCol,
                            message: error.message,
                            severity: EditorApi.MarkerSeverity.Error,
                        } as EditorApi.editor.IMarkerData;
                    },
                );
                const model = editor.getModel();
                if (model) EditorApi.editor.setModelMarkers(model, "owner", monacoErrors);
                if (onListErrors) {
                    onListErrors(
                        monacoErrors.map(error => {
                            return {
                                line: error.startLineNumber,
                                column: error.startColumn,
                                message: error.message,
                            } as Error;
                        }),
                    );
                }
            }
        },
        [tools],
    );

    const didMount = (editor: EditorApi.editor.IStandaloneCodeEditor, t: CustomTools) => {
        let parseContentTO: NodeJS.Timeout;
        let contentChangeTO: NodeJS.Timeout | undefined;
        editor.onDidChangeModelContent(() => {
            if (setScript) {
                if (parseContentTO) clearTimeout(parseContentTO);
                parseContentTO = setTimeout(() => parseContent(t), 0);
                if (!contentChangeTO) {
                    contentChangeTO = setTimeout(() => {
                        setScript(editor.getValue());
                        contentChangeTO = undefined;
                    }, 200);
                }
            }
        });

        editor.onDidChangeCursorPosition(() => {
            if (onCursorChange) {
                const position = editor.getPosition();
                if (position) onCursorChange({ line: position.lineNumber, column: position.column });
            }
        });
    };

    useEffect(() => {
        if ((!Array.isArray(variableURLs) || variableURLs.length === 0) && !sdmxResultURL)
            setReady(true);
        else if (sdmxResultURL)
            fetch(sdmxResultURL)
                .then(res => res.json())
                .then(res => {
                    setSdmxRes(res);
                    setReady(true);
                })
                .catch(() => {
                    setReady(true);
                });
        else {
            Promise.all(variableURLs.map(v => fetch(v)))
                .then(res =>
                    Promise.all(res.map(r => r.json())).then(res => {
                        setVars(buildUniqueVariables(res));
                        setReady(true);
                    }),
                )
                .catch(() => {
                    setReady(true);
                });
        }
    }, [variableURLs]);

    const onChange = (newValue: string) => {
        setScript(newValue);
    };

    if (!ready) return null;

    return (
        <div className="editor-container" style={buildStyle(options)}>
            <MonacoEditor
                ref={monacoRef}
                editorWillMount={getEditorWillMount(tools)({ variables: vars, sdmxResult: sdmxRes })}
                editorDidMount={e => didMount(e, tools)}
                language={tools.id}
                theme={options?.theme || "vs-dark"}
                defaultValue=""
                options={buildCustomOptions({ ...options, readOnly })}
                value={script}
                onChange={onChange}
            />
        </div>
    );
};

export default Editor;
