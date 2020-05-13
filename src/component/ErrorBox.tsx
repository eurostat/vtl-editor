import React, {DOMElement, useEffect} from "react";
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
    setErrorBoxSize: (size: number) => void,
    languageVersion: VTL_VERSION,
    cursorPosition: Position,
    errors: editor.IMarkerData[],
    setTempCursor: (position: Position) => void,
}

const ErrorBox = ({showErrorBox, changeErrorBoxState, setErrorBoxSize, languageVersion, cursorPosition, errors, setTempCursor}: ErrorBoxProps) => {
    const errorsCount = errors.length;
    const version = languageVersions.find(l => l.code === languageVersion)!.name;

    const newCursorPosition = (error: editor.IMarkerData) => {
        setTempCursor(new Position(error.startLineNumber, error.startColumn));
    };

    useEffect(() => {
        const middleContainer = document.getElementById("middle-container");
        const topBar = document.getElementById("top-bar");
        const errorBar = document.getElementById("error-bar");
        let middleContainerHeight = getElementHeight(middleContainer);
        let topBarHeight = getElementHeight(topBar);
        let errorBarHeight = getElementHeight(errorBar);
        const elementToResize = document.getElementById("resizable");
        const resizer = document.getElementById("resize");
        const vtlContainer = document.getElementById("vtl-container");
        let elementBottom = 0;
        let height = 0;
        let mouseDownListener = (e: MouseEvent) => {
            elementBottom = elementToResize!.getBoundingClientRect().bottom;

            window.addEventListener("mousemove", resize);
            window.addEventListener("mouseup", stopResize);
            window.addEventListener("selectstart", disableSelect);
        };

        resizer!.addEventListener("mousedown", mouseDownListener);

        const resize = (e: MouseEvent) => {
            height = elementBottom - e.pageY;
            if (height < middleContainerHeight * 0.8 && height > 100) {
                elementToResize!.style.height = height + 'px';
                vtlContainer!.style.height = `calc( 100% - ${topBarHeight}px - ${errorBarHeight}px - ${height}px)`;
            }
        };

        const stopResize = () => {
            window.removeEventListener('mousemove', resize)
            resizer!.removeEventListener("mousedown", mouseDownListener);
            window.removeEventListener("selectstart", disableSelect);
            setErrorBoxSize(height);
            window.removeEventListener("mouseup", stopResize);
        };

        const disableSelect = (event: any) => {
            event.preventDefault();
        };
        console.log(window);
    });

    const getElementHeight = (element: any) => {
        const style = getComputedStyle(element);
        parseFloat(getComputedStyle(element!, null).getPropertyValue('height').replace('px', ''));
        return parseFloat(style.height) + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    };

    const changeVtlContainerSize = () => {
        const middleContainer = document.getElementById("middle-container");
        const topBar = document.getElementById("top-bar");
        const errorBar = document.getElementById("error-bar");
        const elementToResize = document.getElementById("resizable");
        const vtlContainer = document.getElementById("vtl-container");
        let middleContainerHeight = getElementHeight(middleContainer);
        let topBarHeight = getElementHeight(topBar);
        let errorBarHeight = getElementHeight(errorBar);
        elementToResize!.style.display = "block";
        let elementToResizeHeight = getElementHeight(elementToResize);
        elementToResize!.style.display = "";
        if (showErrorBox) {
            vtlContainer!.style.height = middleContainerHeight - topBarHeight - errorBarHeight + "px";
        } else {
            vtlContainer!.style.height = middleContainerHeight - topBarHeight - errorBarHeight - elementToResizeHeight + "px";
        }

    };

    return (
        <>
            <div id="resizable" className="error-container">
                <div id="resize" className="error-top">
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
                                <FontAwesomeIcon className="hand-cursor" onClick={() => {
                                    changeVtlContainerSize();
                                    changeErrorBoxState();
                                }} icon={faTimes}/>
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
            <div id="error-bar" className="error-bar">
                <div className="position-left">
                    <Tooltip title={showErrorBox ? "Hide error box" : "Show error box"} placement="top" arrow>
                        <div>
                            <FontAwesomeIcon className="hand-cursor" onClick={() => {
                                changeVtlContainerSize();
                                changeErrorBoxState();
                            }} icon={faChevronUp}/>
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