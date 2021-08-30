import React, { useState } from "react";
import { AntlrEditor } from "../components";
import { SdmxResult } from "../model";
import { Options, Tools, Variables } from "../model";

export interface StorybookEditorProps {
    initialScript: string;
    readOnly: boolean;
    tools: Tools;
    variables?: Variables;
    variableURLs?: string[];
    sdmxResult?: SdmxResult;
    languageVersion: string;
    def?: Element;
    options?: Options;
}

export const EditorForStory: React.FC<StorybookEditorProps> = ({
    initialScript,
    readOnly,
    tools,
    variables = {},
    variableURLs = [],
    sdmxResult,
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
                readOnly={readOnly}
                variables={variables}
                variableURLs={variableURLs}
                sdmxResult={sdmxResult}
                tools={tools}
                options={options}
                onListErrors={setErrors}
            />
        </>
    );
};
