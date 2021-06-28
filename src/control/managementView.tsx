import {createStyles, Theme} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import React from "react";
import {Tab, Tabs} from "react-bootstrap";
import {useAdminRole, useManagerRole} from "./authorized";
import DomainsTab from "./domain/domainsTab";
import GroupsTab from "./group/groupsTab";
import "./managementView.scss";
import UsersTab from "./user/usersTab";

export default function ManagementView() {
    const forAdmin = useAdminRole();
    const forManager = useManagerRole();

    return (
        <div className="management-view">
            <Tabs defaultActiveKey="domains" transition={false} id="management-tabs">
                {forManager(<Tab className="management-panel" eventKey="domains" title="Domains"><DomainsTab/></Tab>)}
                {forManager(<Tab className="management-panel" eventKey="groups" title="Groups"><GroupsTab/></Tab>)}
                {forAdmin(<Tab className="management-panel" eventKey="users" title="Users"><UsersTab/></Tab>)}
            </Tabs>
        </div>
    );
}

export const useGridStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        rootMargin: {
            flexGrow: 1,
            marginTop: "8px",
            marginBottom: "8px",
        },
        control: {
            padding: theme.spacing(2),
        },
    }),
);

export const useCheckboxStyles = makeStyles((theme: Theme) =>
    createStyles({
        disabled: {
            ".MuiFormControlLabel-label&": {
                color: "#004494",
            },
            ".MuiCheckbox-colorSecondary&": {
                color: "rgba(0, 0, 0, 0.87)",
                marginLeft: "60px",
            },
            ".MuiFormControlLabel-root&": {
                marginLeft: "8px",
            }
        },
    }), {name: 'Mui'}
);