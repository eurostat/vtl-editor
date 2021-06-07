import React from "react";
import { useSelector } from "react-redux"
import { userEdit } from "../controlSlice";
import "../managementView.scss";
import UserEdit from "./userEdit";
import UsersTable from "./usersTable";

const UsersTab = () => {
    const editShown = useSelector(userEdit);

    return (
        <>
            <div className={`${editShown ? "hidden" : ""}`}>
                {<UsersTable/>}
            </div>
            <div className={`${editShown ? "" : " hidden"}`}>
                <UserEdit/>
            </div>
        </>
    );
}

export default UsersTab;