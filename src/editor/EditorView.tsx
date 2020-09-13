import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import { setEditorStorageValue } from "../utility/localStorage";
import ResizableEditorArea from "./detail-pane/ResizableEditorArea";
import { listErrors, movedCursor, updateContent, updateCursor } from './editorSlice';
import { loadedFile } from "./loaderSlice";
import TitleBar from "./title-bar/titleBar";
import VtlEditor, { CursorPosition, VtlEditorProps, VtlError } from "./vtl-editor/VtlEditor";

type EditorViewProps = {
    vtlEditorProps: VtlEditorProps,
    errorBoxProps: any
}

const classes = {
    height: "100%",
    overflow: "hidden"
};

const EditorView = ({vtlEditorProps, errorBoxProps}: EditorViewProps) => {
    const dispatch = useDispatch();
    const cursor = useSelector(movedCursor);
    const loaded = useSelector(loadedFile);

    const onCursorChange = (position: CursorPosition) => {
        dispatch(updateCursor(position));
    };

    const onContentChange = (content: string) => {
        dispatch(updateContent(content));
        setEditorStorageValue({edited: true});
        setEditorStorageValue({content: content});
    }

    const onListErrors = (errors: VtlError[]) => {
        dispatch(listErrors(errors));
    }

    vtlEditorProps.onCursorChange = onCursorChange;
    vtlEditorProps.onContentChange = onContentChange;
    vtlEditorProps.onListErrors = onListErrors;
    vtlEditorProps.movedCursor = cursor;
    vtlEditorProps.code = loaded.content;

    console.log("editor view render");
    return (
        <div className={`vtl-box ${vtlEditorProps.theme}`} style={classes}>
            <TitleBar/>
            <div id="vtl-container" className="vtl-container">
                <VtlEditor {...vtlEditorProps}/>
            </div>
            <ResizableEditorArea {...errorBoxProps} />
        </div>
    );
};

export default EditorView;