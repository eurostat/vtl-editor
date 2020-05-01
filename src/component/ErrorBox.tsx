import React from "react";
import "./errorbox.scss";
import {faChevronUp, faTimes, faTimesCircle as faTimesCircleSolid} from "@fortawesome/free-solid-svg-icons";
import {faSave, faTimesCircle} from "@fortawesome/free-regular-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {languageVersions, VTL_VERSION} from "../editor/settings";
import {editor, Position} from "monaco-editor";
import {Tooltip} from "@material-ui/core";

type ErrorBoxProps = {
    showErrorBox: boolean,
    changeErrorBoxState: () => void,
    languageVersion: VTL_VERSION,
    cursorPosition: Position,
    errors: editor.IMarkerData[],
    setTempCursor: (position: Position) => void,
}

const ErrorBox = ({showErrorBox, changeErrorBoxState, languageVersion, cursorPosition, errors, setTempCursor}: ErrorBoxProps) => {
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
                            {errorsCount ? "[Line, Column] Message" : ""}
                        </div>

                    </div>
                    <div className="position-right">
                        <Tooltip title="Error count" placement="top-start" arrow>
                            <div>
                                <div>
                                    {errorsCount}
                                </div>
                                <div className="error-count">
                                    <FontAwesomeIcon icon={faTimesCircleSolid}/>
                                </div>
                            </div>
                        </Tooltip>
                        <Tooltip title="Close" placement="top" arrow>
                            <div className="close-button">
                                <FontAwesomeIcon className="hand-cursor" onClick={changeErrorBoxState} icon={faTimes}/>
                            </div>
                        </Tooltip>
                    </div>
                </div>
                <div className="error-list">
                    {errors.map((e, i) => {
                        const {startLineNumber, startColumn, message} = e;
                        const messageUpper = message.charAt(0).toUpperCase() + message.slice(1);
                        return (
                            <div onClick={() => newCursorPosition(e)} key={i}>
                                <FontAwesomeIcon icon={faTimesCircleSolid}/>
                                <span>{`[${startLineNumber}, ${startColumn}] ${messageUpper}`}</span>
                            </div>)
                    })}
                </div>
            </div>
            <div className="error-bar">
                <div className="position-left">
                    <Tooltip title={showErrorBox ? "Hide error box" : "Show error box"} placement="top" arrow>
                        <div>
                            <FontAwesomeIcon className="hand-cursor" onClick={changeErrorBoxState} icon={faChevronUp}/>
                        </div>
                    </Tooltip>
                    <Tooltip title="Error count" placement="top-start" arrow>
                        <div>
                            <div>
                                <FontAwesomeIcon icon={faTimesCircle}/>
                            </div>
                            <div>
                                {errorsCount}
                            </div>
                        </div>
                    </Tooltip>
                </div>
                <div className="position-right">
                    <Tooltip title="Line and column" placement="top" arrow>
                        <div>
                            Line {cursorPosition.lineNumber}, Col {cursorPosition.column}
                        </div>
                    </Tooltip>
                    <Tooltip title="VTL version" placement="top" arrow>
                        <div>
                            VTL {version}
                        </div>
                    </Tooltip>
                </div>
            </div>
        </>
    )
};


export default ErrorBox;