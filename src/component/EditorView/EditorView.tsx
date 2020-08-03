import React, {useMemo} from 'react';
import VtlEditor, {VtlEditorProps} from "../../editor/VtlEditor";
import ErrorBox from "./ErrorBox/ErrorBox";
import {languageVersions} from "../../editor/settings";


type EditorViewProps = {
    fileName: string,
    codeChanged: boolean,
    VtlEditorProps: VtlEditorProps,
    ErrorBoxProps: any
}

const classes = {
    height: "100%",
    overflow: "hidden"
};

const EditorView = ({fileName, codeChanged, VtlEditorProps, ErrorBoxProps}: EditorViewProps) => {
    return (
        <div className={`vtl-box ${VtlEditorProps.theme}`} style={classes}>
            <div id="top-bar" className="top-bar">
                <span>{fileName}&nbsp;{codeChanged ? "*" : ""}</span>
            </div>
            <div id="vtl-container" className="vtl-container">
                <VtlEditor {...VtlEditorProps}/>
            </div>
            <ErrorBox {...ErrorBoxProps} />
        </div>
    );
};


export default EditorView;