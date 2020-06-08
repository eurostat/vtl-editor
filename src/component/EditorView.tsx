import React from 'react';
import VtlEditor from "../editor/VtlEditor";
import ErrorBox from "./ErrorBox";


type EditorViewProps= {
    fileName: string,
    codeChanged: boolean,
    VtlEditorProps: any,
    ErrorBoxProps: any
}

const EditorView = ({fileName, codeChanged, VtlEditorProps,ErrorBoxProps}: EditorViewProps) => {

    return (
        <>
            <div id="top-bar" className="top-bar">
                <span>{fileName}&nbsp;{codeChanged ? "*" : ""}</span>
            </div>
            <div id="vtl-container" className="vtl-container">
                <VtlEditor {...VtlEditorProps}/>
            </div>
            <ErrorBox {...ErrorBoxProps} />
        </>
    );
};


export default EditorView;