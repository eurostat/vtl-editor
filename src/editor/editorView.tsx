import React, { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { appliedTheme, triggerResize } from "../main-view/viewSlice";
import { SdmxResult } from "../sdmx/entity/SdmxResult";
import DetailPane from "./detail-pane/detailPane";
import {
    appliedVtlVersion,
    listErrors,
    loadedFile,
    movedCursor,
    updateContent,
    updateCursor,
    updateEdited,
    updateName,
    updateSaved
} from './editorSlice';
import TitleBar from "./title-bar/titleBar";
import VtlEditor, { CursorPosition, VtlError } from "./vtl-editor/vtlEditor";

type EditorViewProps = {
    sdmxResult: SdmxResult | undefined,
    errorBoxProps: any
}

const classes = {
    height: "100%",
    overflow: "hidden"
};

const EditorView = ({sdmxResult, errorBoxProps}: EditorViewProps) => {
    const dispatch = useDispatch();
    const cursor = useSelector(movedCursor);
    const loaded = useSelector(loadedFile);
    const theme = useSelector(appliedTheme);
    const vtlVersion = useSelector(appliedVtlVersion);
    const resizeLayout = useSelector(triggerResize);

    useEffect(() => {
        dispatch(updateEdited(loaded.edited));
        dispatch(updateName(loaded.name));
        dispatch(updateSaved(loaded.content));
    }, [loaded, dispatch]);

    const onCursorChange = (position: CursorPosition) => {
        dispatch(updateCursor(position));
    };

    const onContentChange = (content: string) => {
        dispatch(updateContent(content));
    }

    const onListErrors = (errors: VtlError[]) => {
        dispatch(listErrors(errors));
    }

    console.log("editor view render");
    return (
        <div className={`vtl-box ${theme}`} style={classes}>
            <TitleBar/>
            <div id="vtl-container" className="vtl-container">
                <VtlEditor onContentChange={onContentChange} onCursorChange={onCursorChange} onListErrors={onListErrors}
                           loaded={loaded} movedCursor={cursor} theme={theme} vtlVersion={vtlVersion}
                           sdmxResult={sdmxResult} resizeLayout={resizeLayout}/>
            </div>
            <DetailPane {...errorBoxProps} />
        </div>
    );
};

export default EditorView;