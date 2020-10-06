import React from "react";
import { useSelector } from "react-redux";
import { fileChanged, fileName } from "../editorSlice";

const TitleBar = () => {
    const name = useSelector(fileName);
    const changed = useSelector(fileChanged);
    return (
        <div id="top-bar" className="top-bar">
            <span>{name}&nbsp;{changed ? "*" : ""}</span>
        </div>
    )
}

export default TitleBar;