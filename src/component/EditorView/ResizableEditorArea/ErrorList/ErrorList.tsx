import {editor, Position} from "monaco-editor";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTimesCircle as faTimesCircleSolid} from "@fortawesome/free-solid-svg-icons";
import React from "react";


type ErrorListProps = {
    errors: editor.IMarkerData[],
    setTempCursor: (position: Position) => void,
}


const ErrorList = ({errors, setTempCursor}: ErrorListProps) => {
    const newCursorPosition = (error: editor.IMarkerData) => {
        setTempCursor(new Position(error.startLineNumber, error.startColumn));
    };
    return (
        <div className="error-list">
            {
                errors.map((e, i) => {
                    const {startLineNumber, startColumn, message} = e;
                    const messageUpper = message.charAt(0).toUpperCase() + message.slice(1);
                    return (
                        <div onClick={() => newCursorPosition(e)} key={i}>
                            <FontAwesomeIcon icon={faTimesCircleSolid}/>
                            <span>{`[${startLineNumber}, ${startColumn}] ${messageUpper}`}</span>
                        </div>)
                })
            }
        </div>
    )
}

export default ErrorList;