import React from "react";
import { useSelector } from "react-redux";
import { fileEdited, fileName } from "../editorSlice";

const TitleBar = () => {
    const name = useSelector(fileName);
    const edited = useSelector(fileEdited);
    return (
        <div id="top-bar" className="top-bar">
            <span>{name}&nbsp;{edited ? "*" : ""}</span>
        </div>
    )
}

export default TitleBar;