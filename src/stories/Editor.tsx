import React, { useState } from "react";
import { AntlrEditor } from "../components";
import { SdmxResult } from "../model";
import { Options, Tools, Variables } from "../model";

export interface StorybookEditorProps {
    initialScript?: string;
    initialScriptExpr: string;
    customFetcher?: (url: string) => Promise<any>;
    readOnly: boolean;
    tools: Tools;
    variables?: Variables;
    variableURLs?: string[];
    sdmxResult?: SdmxResult;
    sdmxResultURL?: string;
    languageVersion: string;
    def?: Element;
    options?: Options;
}

export const EditorForStory: React.FC<StorybookEditorProps> = ({
    initialScript,
    initialScriptExpr,
    customFetcher,
    readOnly,
    tools,
    variables = {},
    variableURLs = [],
    sdmxResult,
    sdmxResultURL,
    def = "",
    options,
}) => {
    const [script, setScript] = useState(initialScript);
    const [scriptExpr, setScriptExpr] = useState(initialScriptExpr);
    const [errors, setErrors] = useState([]);
    const [errorsExpr, setErrorsExpr] = useState([]);
    console.log(errors);
    console.log(errorsExpr);
    return (
        <>
            {def && <div>{def}</div>}
            {initialScriptExpr && <h4>Start level</h4>}
            <AntlrEditor
                script={script}
                setScript={setScript}
                customFetcher={customFetcher}
                readOnly={readOnly}
                variables={variables}
                variableURLs={variableURLs}
                sdmxResult={sdmxResult}
                sdmxResultURL={sdmxResultURL}
                tools={tools}
                options={options}
                onListErrors={setErrors}
            />
            {initialScriptExpr && (
                <>
                    <h4>Expr level</h4>
                    <AntlrEditor
                        script={scriptExpr}
                        setScript={setScriptExpr}
                        customFetcher={customFetcher}
                        readOnly={readOnly}
                        variables={variables}
                        variableURLs={variableURLs}
                        sdmxResult={sdmxResult}
                        sdmxResultURL={sdmxResultURL}
                        tools={{ ...tools, initialRule: "expr" }}
                        options={options}
                        onListErrors={setErrorsExpr}
                    />
                </>
            )}
        </>
    );
};
