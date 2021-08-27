import { useState } from "react";
import Editor from "./editor";
import monarchDefinition from "./monarch.json";
import { CursorPosition, Error, Options, SdmxResult, Tools, Variables } from "../model";
import { getDefaultSuggestionsFromRange } from "./default-suggestions";

export type AntlrEditorProps = {
    script: string;
    setScript: (value: string) => void;
    sdmxResult?: SdmxResult;
    readOnly?: boolean;
    variables?: Variables;
    variableURLs?: string[];
    tools: Tools;
    options?: Options;
    onCursorChange?: (position: CursorPosition) => void;
    onListErrors?: (errors: Error[]) => void;
    movedCursor?: CursorPosition;
    resizeLayout?: any;
};

export const AntlrEditor = (props: AntlrEditorProps) => {
    const [cursor, setCursor] = useState({ line: 1, column: 1 });

    const {
        script,
        setScript,
        readOnly,
        variables = {},
        variableURLs = [],
        sdmxResult,
        tools,
        options = {},
        onCursorChange,
        onListErrors,
        movedCursor,
        resizeLayout,
    } = props;

    const {
        id = "default-id",
        Lexer: lexer,
        Parser: parser,
        grammar,
        initialRule,
        getSuggestionsFromRange = getDefaultSuggestionsFromRange,
    } = tools;

    const customTools = {
        id,
        monarchDefinition,
        lexer,
        parser,
        grammar,
        initialRule,
        getSuggestionsFromRange,
    };

    return (
        <Editor
            tools={customTools}
            script={script}
            setScript={setScript}
            readOnly={readOnly}
            onListErrors={onListErrors}
            movedCursor={movedCursor || cursor}
            onCursorChange={onCursorChange || setCursor}
            variables={variables}
            variableURLs={variableURLs}
            sdmxResult={sdmxResult}
            resizeLayout={resizeLayout}
            options={options}
        />
    );
};
