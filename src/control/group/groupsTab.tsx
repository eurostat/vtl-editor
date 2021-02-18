import React from "react";
import { useSelector } from "react-redux";
import { groupEdit } from "../controlSlice";
import "../managementView.scss";
import GroupEdit from "./groupEdit";
import GroupsTable from "./groupsTable";

const GroupsTab = () => {
    const editShown = useSelector(groupEdit);

    return (
        <>
            <div className={`${editShown ? "hidden" : ""}`}>
                <GroupsTable/>
            </div>
            <div className={`${editShown ? "" : " hidden"}`}>
                <GroupEdit/>
            </div>
        </>
    );
}

export default GroupsTab;