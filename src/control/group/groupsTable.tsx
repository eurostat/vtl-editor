import { MuiThemeProvider } from "@material-ui/core/styles";
import { AddCircleOutline, Cached, Clear, Edit } from "@material-ui/icons";
import _ from "lodash";
import MaterialTable, { MaterialTableProps } from "material-table";
import { useSnackbar } from "notistack";
import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAdminRole } from "../authorized";
import { expelGroup, groupList, replaceGroups, startGroupEdit } from "../controlSlice";
import { GroupTransfer } from "./group";
import { deleteGroup, fetchGroups } from "./groupService";
import GroupView from "./groupView";
import {deleteEntityDialog} from "../../main-view/decision-dialog/decisionDialog";
import {materialTableAction, materialTableTheme, materialTableTitle} from "../../utility/materialTable";

export default function GroupsTable() {
    const groups = _.cloneDeep(useSelector(groupList));
    const dispatch = useDispatch();
    const {enqueueSnackbar} = useSnackbar();

    const forAdmin = useAdminRole();

    const loadGroups = useCallback(() => {
        return fetchGroups().then((received: GroupTransfer[]) => {
            dispatch(replaceGroups(received));
        }).catch(() => {
            enqueueSnackbar(`Failed to load groups.`, {variant: "error"});
            return Promise.reject();
        });
    }, [dispatch, enqueueSnackbar]);

    useEffect(() => {
        loadGroups().then().catch(() => {
        });
    }, [loadGroups]);

    const refreshGroups = () => {
        loadGroups()
            .then(() => enqueueSnackbar(`Groups refreshed successfully.`, {variant: "success"}))
            .catch(() => {
            });
    }

    const createGroup = () => {
        dispatch(startGroupEdit());
    }

    const editGroup = (event: any, group: GroupTransfer | GroupTransfer[]) => {
        if (Array.isArray(group)) return;
        dispatch(startGroupEdit(group.id));
    }

    const removeGroup = (event: any, group: GroupTransfer | GroupTransfer[]) => {
        if (Array.isArray(group)) return;
        deleteEntityDialog("group", group.name)
            .then(() => {
                deleteGroup(group.id)
                    .then((response) => {
                        if (response && response.success) {
                            dispatch(expelGroup(group));
                            enqueueSnackbar(`Group "${group.name}" deleted successfully.`, {variant: "success"});
                        }
                    })
                    .catch(() => {
                        enqueueSnackbar(`Failed to delete group "${group.name}".`, {variant: "error"});
                    })
            })
            .catch(() => {
            });
    }

    const tableProps = {
        title: materialTableTitle("VRM Group", "VRM Groups", groups.length),
        data: groups,
        columns: [
            {title: "Name", field: "name", defaultSort: "asc"},
            {title: "Description", field: "description"},
            {title: "Creation Date", field: "createDate"},
            {title: "Created By", field: "createdBy"},
        ],
        options: {
            showTitle: true,
            toolbarButtonAlignment: "left",
        },
        detailPanel: (group: GroupTransfer) => {
            return (<GroupView groupId={group.id}/>)
        },
        actions: [
            forAdmin(materialTableAction(<AddCircleOutline/>, "toolbar", createGroup, "New Group")),
            forAdmin(materialTableAction(<AddCircleOutline/>, "toolbarOnSelect", createGroup, "New Group")),
            materialTableAction(<Cached/>, "toolbar", refreshGroups, "Refresh"),
            materialTableAction(<Cached/>, "toolbarOnSelect", refreshGroups, "Refresh"),
            materialTableAction(<Edit/>, "row", editGroup, "Edit Group"),
            forAdmin(materialTableAction(<Clear/>, "row", removeGroup, "Delete Group")),
        ].filter((action) => action !== null),
    } as MaterialTableProps<any>;

    return (
        <>
            <MuiThemeProvider theme={materialTableTheme}>
                <div className="entities-table">
                    <MaterialTable {...tableProps}/>
                </div>
            </MuiThemeProvider>
        </>
    );
}