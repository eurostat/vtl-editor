import { Tooltip } from "@material-ui/core";
import React from "react";
import { useSelector } from "react-redux";
import { fileVersion } from "../editorSlice";

const FileVersionIndicator = () => {
    const version = useSelector(fileVersion);
    return (
        <Tooltip title="Edited file version" placement="top" arrow>
            <div>
                Ver. {version}
            </div>
        </Tooltip>
    )
}

export default FileVersionIndicator;