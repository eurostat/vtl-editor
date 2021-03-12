import { createMuiTheme, createStyles, Theme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Action } from "material-table";
import React from "react";
import { Tab, Tabs } from "react-bootstrap";
import { decisionDialog } from "../main-view/decision-dialog/decisionDialog";
import { useAdminRole, useManagerRole } from "./authorized";
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

export const deleteEntityDialog = (type: string, name: string) => {
    const decision = async () => {
        const descriptor = type.toLocaleLowerCase();
        const result = await decisionDialog({
            title: "Warning",
            text: `Do you really want to delete ${descriptor} "${name}"?`,
            buttons: [
                {key: "yes", text: "Yes", color: "primary"},
                {key: "no", text: "No", color: "secondary"}
            ]
        });
        return result === "yes"
            ? Promise.resolve()
            : Promise.reject();
    }
    return decision();
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

export const controlTableTheme = createMuiTheme({
    overrides: {
        MuiToolbar: {
            root: {
                backgroundColor: '#e0e0e0',
                minHeight: '48px !important',
            },
            gutters: {
                paddingLeft: '8px !important',
            },
        },
    },
});

export function controlTableTitle(singularTitle: string, pluralTitle: string, count: number) {
    return (
        <div className="table-title">
            <h6>{count}</h6>
            <h6>{count === 1 ? singularTitle : pluralTitle}</h6>
        </div>
    );
}

export type MatTableIconPosition = "auto" | "toolbar" | "toolbarOnSelect" | "row";

export function controlTableAction<RowData extends object>(icon: React.ReactElement,
                                                           position: MatTableIconPosition,
                                                           onClick: (event: any, data: RowData | RowData[]) => void,
                                                           tooltip?: string) {
    return {
        icon: () => icon,
        tooltip: tooltip,
        position: position,
        onClick: onClick
    } as Action<RowData>
}
