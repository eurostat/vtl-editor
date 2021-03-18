import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { appliedTheme, triggerResize } from "../main-view/viewSlice";
import { SdmxResult } from "../sdmx/entity/SdmxResult";
import { readState } from "../utility/store";
import DetailPane from "./detail-pane/detailPane";
import {
    appliedVtlVersion,
    clearLoaded,
    editedContent, fileContent,
    listErrors,
    loadedFile,
    movedCursor,
    updateContent,
    updateCursor,
    updateEdited,
    updateFileMeta,
    updateSaved
} from './editorSlice';
import TopBar from "./top-bar/topBar";
import { CursorPosition, VtlError } from "./vtl-editor";
import VtlEditor from "./vtl-editor/vtlEditor";

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
    const [file, setFile] = useState<{ content: string }>();

    useEffect(() => {
        if (loaded) {
            setFile({content: loaded.content});
            dispatch(updateFileMeta(loaded));
            dispatch(updateSaved(loaded.content));
            dispatch(clearLoaded());
        }
    }, [loaded, dispatch]);

    useEffect(() => {
        if (!loaded) setFile({content: readState(editedContent)});
        return () => {
            dispatch(updateEdited(readState(fileContent)));
        }
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

    return (
        <div className={`vtl-box ${theme}`} style={classes}>
            <TopBar/>
            <div id="vtl-container" className="vtl-container">
                <VtlEditor onContentChange={onContentChange} onCursorChange={onCursorChange} onListErrors={onListErrors}
                           file={file} movedCursor={cursor} theme={theme} vtlVersion={vtlVersion}
                           sdmxResult={sdmxResult} resizeLayout={resizeLayout}/>
            </div>
            <DetailPane {...errorBoxProps} />
        </div>
    );
};

export default EditorView;