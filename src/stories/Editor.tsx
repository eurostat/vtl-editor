import React, { useState } from "react";
import { AntlrEditor } from "../components";
import { SdmxResult } from "../model";
import { Options, Tools, Variables } from "../model";

export interface StorybookEditorProps {
    initialScript: string;
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
    const [errors, setErrors] = useState([]);
    console.log(errors);
    return (
        <>
            {def && <div>{def}</div>}
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
        </>
    );
};
