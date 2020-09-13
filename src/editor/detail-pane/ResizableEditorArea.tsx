import { faTimesCircle } from "@fortawesome/free-regular-svg-icons";
import {
    faChevronUp,
    faDatabase,
    faTimes,
    faTimesCircle as faTimesCircleSolid
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@material-ui/core";
import { Position } from "monaco-editor";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import DataStructureDetailPanel from "../../sdmx/data-structure-details/DataStructureDetailPanel";
import { DataStructure } from "../../sdmx/entity/DataStructure";
import { SdmxRegistry } from "../../sdmx/entity/SdmxRegistry";
import { DataStructureInfo } from "../../sdmx/entity/SdmxResult";
import { errorCount } from "../editorSlice";
import { languageVersions, VTL_VERSION } from "../settings";
import CursorIndicator from "../status-bar/cursorIndicator";
import ErrorList from "./ErrorList";
import "./resizableEditorArea.scss";

type ResizableEditorAreaProps = {
    showErrorBox: boolean,
    changeErrorBoxState: () => void,
    setErrorBoxSize: (size: number) => void,
    languageVersion: VTL_VERSION,
    setTempCursor: (position: Position) => void,
    dataStructureInfo: DataStructureInfo | undefined,
    registry: SdmxRegistry,
    dataStructure: DataStructure,
}

type EditorTabs = "errorList" | "dsdPreview";

const ResizableEditorArea = ({
                                 showErrorBox, changeErrorBoxState, setErrorBoxSize, languageVersion,
                                 dataStructureInfo, registry, dataStructure
                             }: ResizableEditorAreaProps) => {
    const errorsCount = useSelector(errorCount);
    const version = languageVersions.find(l => l.code === languageVersion)!.name;
    const [currentTab, setCurrentTab] = useState<EditorTabs>("errorList");
    const memoDataStructureDetails = useMemo(() => {
        return (
            <DataStructureDetailPanel registry={registry} dataStructure={dataStructure} showCodeListPreview={true}/>)
    }, [registry, dataStructure])

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
                            {errorsCount && currentTab === 'errorList' ? "[Line, Column] Message" : ""}
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
                <div className="info-container">
                    <Tabs activeTab={currentTab}>
                        <div title="errorList">
                            <ErrorList/>
                        </div>
                        <div title="dsdPreview">
                            {memoDataStructureDetails}
                        </div>
                    </Tabs>
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
                        <div className="error-box-item-container" onClick={() => setCurrentTab("errorList")}>
                            <div>
                                <FontAwesomeIcon icon={faTimesCircle}/>
                            </div>
                            <div>
                                {errorsCount}
                            </div>
                        </div>
                    </Tooltip>
                    {dataStructureInfo ?
                        <Tooltip title={dataStructureInfo.name} placement="top" arrow>
                            <div className="error-box-item-container" onClick={() => setCurrentTab("dsdPreview")}>
                                <div>
                                    <FontAwesomeIcon icon={faDatabase}/>
                                </div>
                                <div>
                                    {dataStructureInfo.id}
                                </div>
                            </div>
                        </Tooltip>
                        : null
                    }


                </div>
                <div className="position-right">
                    <CursorIndicator/>
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

type TabsProps = {
    activeTab: string,
    children: any[];
}

const Tabs = ({activeTab, children}: TabsProps) => {
    return (<div>
        {children.map(child => {
            if (child.props.title !== activeTab) return undefined;
            return child.props.children;
        })}
    </div>)
}

export default ResizableEditorArea;