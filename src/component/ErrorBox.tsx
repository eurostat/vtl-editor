import React from "react";
import "./errorbox.scss";
import {faChevronUp, faTimes, faTimesCircle as faTimesCircleSolid} from "@fortawesome/free-solid-svg-icons";
import {faTimesCircle} from "@fortawesome/free-regular-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {languageVersions, VTL_VERSION} from "../editor/settings";
import {editor, Position} from "monaco-editor";


type ErrorBoxProps = {
    changeErrorBoxState: () => void,
    languageVersion: VTL_VERSION,
    cursorPosition: Position,
    errors: editor.IMarkerData[],
    setTempCursor: (position: Position) => void,
}


const ErrorBox = ({changeErrorBoxState, languageVersion, cursorPosition, errors, setTempCursor}: ErrorBoxProps) => {
    const errorsCount = errors.length;
    const version = languageVersions!.find(l => l.code === languageVersion)!.name;

    const newCursorPosition = (error: editor.IMarkerData) => {
        setTempCursor(new Position(error.startLineNumber, error.startColumn));
    };

    return (
        <>
            <div className="error-container">
                <div className="error-top">
                    <div className="position-left">
                        <div>
                            [Line, Column] Message
                        </div>

                    </div>
                    <div className="position-right">
                        <div>
                            {errorsCount}
                        </div>
                        <div className="error-count">
                            <FontAwesomeIcon icon={faTimesCircleSolid}/>
                        </div>
                        <div className="close-button">
                            <FontAwesomeIcon className="hand-cursor" onClick={changeErrorBoxState} icon={faTimes}/>
                        </div>
                    </div>
                </div>
                <div className="error-list">
                    {errors.map((e, i) => {
                        const {startLineNumber, startColumn, message} = e;
                        const line = !i ? "Line " : "";
                        const col = !i ? " Column " : "";
                        return (
                            <div onClick={() => newCursorPosition(e)}>
                                <FontAwesomeIcon icon={faTimesCircleSolid}/>
                                <span>{`[${line}${startLineNumber},${col}${startColumn}] ${message}`}</span>
                            </div>)
                    })}
                </div>
            </div>
            <div className="error-bar">
                <div className="position-left">
                    <div>
                        <FontAwesomeIcon className="hand-cursor" onClick={changeErrorBoxState} icon={faChevronUp}/>
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faTimesCircle}/>
                    </div>
                    <div>
                        {errorsCount}
                    </div>
                </div>
                <div className="position-right">
                    <div>
                        Line {cursorPosition.lineNumber}, Col {cursorPosition.column}
                    </div>
                    <div>
                        VTL {version}
                    </div>
                </div>
            </div>
        </>
    )
};


export default ErrorBox;