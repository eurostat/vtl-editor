import { faTimesCircle as faTimesCircleSolid } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { editorErrors, jumpCursor } from "../editorSlice";
import { CursorPosition, VtlError } from "../vtl-editor";

const ErrorList = () => {
    const dispatch = useDispatch();
    const errors = useSelector(editorErrors);

    const onMoveCursor = (error: VtlError) => {
        const position: CursorPosition = {line: error.line, column: error.column}
        dispatch(jumpCursor(position));
    };

    return (
        <div className="error-list">
            {
                errors.map((error, index) => {
                    const {line, column, message} = error;
                    const messageUpper = message.charAt(0).toUpperCase() + message.slice(1);
                    return (
                        <div onClick={() => onMoveCursor(error)} key={index}>
                            <FontAwesomeIcon icon={faTimesCircleSolid}/>
                            <span>{`[${line}, ${column}] ${messageUpper}`}</span>
                        </div>)
                })
            }
        </div>
    )
}

export default memo(ErrorList);