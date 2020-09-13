import { Tooltip } from "@material-ui/core";
import React from "react";
import { useSelector } from "react-redux";
import { editorCursor } from "../editorSlice";

const CursorIndicator = () => {
    const cursor = useSelector(editorCursor);
    return (
        <Tooltip title="Line and column" placement="top" arrow>
            <div>
                Line {cursor.line}, Col {cursor.column}
            </div>
        </Tooltip>
    )
}

export default CursorIndicator;