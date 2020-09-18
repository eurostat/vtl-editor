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
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { detailPaneVisible, resizeDetailPane, toggleDetailPane } from "../../main-view/viewSlice";
import DataStructureDetailPanel from "../../sdmx/data-structure-details/DataStructureDetailPanel";
import { DataStructure } from "../../sdmx/entity/DataStructure";
import { SdmxRegistry } from "../../sdmx/entity/SdmxRegistry";
import { DataStructureInfo } from "../../sdmx/entity/SdmxResult";
import { errorCount } from "../editorSlice";
import CursorIndicator from "../status-bar/cursorIndicator";
import VersionIndicator from "../status-bar/versionIndicator";
import ErrorList from "./errorList";
import "./detailPane.scss";

type DetailPaneProps = {
    setTempCursor: (position: Position) => void,
    dataStructureInfo: DataStructureInfo | undefined,
    registry: SdmxRegistry,
    dataStructure: DataStructure,
}

type EditorTabs = "errorList" | "dsdPreview";

const DetailPane = ({dataStructureInfo, registry, dataStructure}: DetailPaneProps) => {
    const dispatch = useDispatch();
    const errorsCount = useSelector(errorCount);
    const showDetailPane = useSelector(detailPaneVisible);
    const [currentTab, setCurrentTab] = useState<EditorTabs>("errorList");

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
            dispatch(resizeDetailPane(height));
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
        if (showDetailPane) {
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
                                    dispatch(toggleDetailPane());
                                }} icon={faTimes}/>
                            </div>
                        </Tooltip>
                    </div>
                </div>
                <div className="info-container">
                    {currentTab === "errorList" ? <ErrorList/> : null}
                    {currentTab === "dsdPreview"
                        ? <DataStructureDetailPanel registry={registry} dataStructure={dataStructure}
                                                    showCodeListPreview={true}/>
                        : null
                    }
                </div>
            </div>
            <div id="error-bar" className="error-bar">
                <div className="position-left">
                    <Tooltip title={showDetailPane ? "Hide details" : "Show details"} placement="top" arrow>
                        <div>
                            <FontAwesomeIcon className="hand-cursor" onClick={() => {
                                changeVtlContainerSize();
                                dispatch(toggleDetailPane());
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
                    <VersionIndicator/>
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

export default DetailPane;