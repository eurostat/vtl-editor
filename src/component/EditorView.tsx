import React, {useMemo} from 'react';
import VtlEditor, {VtlEditorProps} from "../editor/VtlEditor";
import ErrorBox from "./ErrorBox";
import {languageVersions} from "../editor/settings";


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

    const memoMonaco = useMemo(() => {
        return (
            <VtlEditor {...VtlEditorProps}/>)
    }, [VtlEditorProps.code, VtlEditorProps.theme, VtlEditorProps.languageVersion, VtlEditorProps.tempCursor, VtlEditorProps.sdmxResult, VtlEditorProps.resizeLayout])
    return (
        <div className={`vtl-box ${VtlEditorProps.theme}`} style={classes}>
            <div id="top-bar" className="top-bar">
                <span>{fileName}&nbsp;{codeChanged ? "*" : ""}</span>
            </div>
            <div id="vtl-container" className="vtl-container">
                <VtlEditor {...VtlEditorProps}/>
                {/*{memoMonaco}*/}
            </div>
            <ErrorBox {...ErrorBoxProps} />
        </div>
    );
};


export default EditorView;