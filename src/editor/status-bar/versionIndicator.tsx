import { Tooltip } from "@material-ui/core";
import React from "react";
import { useSelector } from "react-redux";
import { appliedVtlVersion } from "../editorSlice";
import { languageVersions } from "../settings";

const VersionIndicator = () => {
    const vtlVersion = useSelector(appliedVtlVersion);
    const vtlVersionName = languageVersions.find(version => version.code === vtlVersion)!.name;
    return (
        <Tooltip title="VTL version" placement="top" arrow>
            <div>
                VTL {vtlVersionName}
            </div>
        </Tooltip>
    )
}

export default VersionIndicator;