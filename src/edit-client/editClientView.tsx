import React from "react";
import {Tab, Tabs} from "react-bootstrap";
import "./editClientView.scss";
import {useUserRole} from "../control/authorized";
import ProgramsTable from "./program/programsTable";
import DatasetDefinitionsTable from "./dataset-definition/datasetDefinitionsTable";
import {useProvideEditCredentials, useValidateEditCredentials} from "./credentialsService";
import {useEffectOnce} from "../utility/useEffectOnce";

export default function EditClientView() {
    const forUser = useUserRole();
    const validatedCredentials = useValidateEditCredentials();
    const provideCredentials = useProvideEditCredentials();

    useEffectOnce(() => {
        if (!validatedCredentials()) {
            provideCredentials();
        }
    });

    return (
        <div className="edit-client-view">
            <Tabs defaultActiveKey="programs" transition={false} id="edit-client-tabs">
                {forUser(<Tab className="edit-client-panel" eventKey="programs"
                              title="Programs"><ProgramsTable/></Tab>)}
                {forUser(<Tab className="edit-client-panel" eventKey="definitions"
                              title="Dataset Definitions"><DatasetDefinitionsTable/></Tab>)}
            </Tabs>
        </div>
    );
}
