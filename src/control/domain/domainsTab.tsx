import React from "react";
import { useSelector } from "react-redux";
import { domainEdit } from "../controlSlice";
import "../managementView.scss";
import DomainEdit from "./domainEdit";
import DomainsTable from "./domainsTable";

const DomainsTab = () => {
    const editShown = useSelector(domainEdit);

    return (
        <>
            <div className={`${editShown ? "hidden" : ""}`}>
                <DomainsTable/>
            </div>
            <div className={`${editShown ? "" : " hidden"}`}>
                <DomainEdit/>
            </div>
        </>
    );
}

export default DomainsTab;