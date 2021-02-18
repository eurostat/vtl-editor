import { MuiThemeProvider } from "@material-ui/core/styles";
import { AddCircleOutline, Cached, Clear, Edit } from "@material-ui/icons";
import _ from "lodash";
import MaterialTable, { MaterialTableProps } from "material-table";
import { useSnackbar } from "notistack";
import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { expelGroup, groupList, replaceGroups, startGroupEdit } from "../controlSlice";
import { controlTableAction, controlTableTheme, controlTableTitle, deleteEntityDialog } from "../managementView";
import { GroupTransfer } from "./group";
import { deleteGroup, fetchGroups } from "./groupService";
import GroupView from "./groupView";

export default function GroupsTable() {
    const groups = _.cloneDeep(useSelector(groupList));
    const dispatch = useDispatch();
    const {enqueueSnackbar} = useSnackbar();

    const loadGroups = useCallback(async () => {
        fetchGroups().then((received: GroupTransfer[]) => {
            dispatch(replaceGroups(received));
        }).catch(() => {
            enqueueSnackbar(`Failed to load groups.`, {variant: "error"});
            return Promise.reject();
        });
    }, [dispatch, enqueueSnackbar]);

    useEffect(() => {
        loadGroups().then().catch();
    }, [loadGroups]);

    const refreshGroups = () => {
        loadGroups()
            .then(() => enqueueSnackbar(`Groups refreshed successfully.`, {variant: "success"}))
            .catch();
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
        title: controlTableTitle("VRM Group", "VRM Groups", groups.length),
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
            controlTableAction(<AddCircleOutline/>, "toolbar", createGroup, "New Group"),
            controlTableAction(<AddCircleOutline/>, "toolbarOnSelect", createGroup, "New Group"),
            controlTableAction(<Cached/>, "toolbar", refreshGroups, "Refresh"),
            controlTableAction(<Cached/>, "toolbarOnSelect", refreshGroups, "Refresh"),
            controlTableAction(<Edit/>, "row", editGroup, "Edit Group"),
            controlTableAction(<Clear/>, "row", removeGroup, "Delete Group"),
        ],
    } as MaterialTableProps<any>;

    return (
        <>
            <MuiThemeProvider theme={controlTableTheme}>
                <div className="entities-table">
                    <MaterialTable {...tableProps}/>
                </div>
            </MuiThemeProvider>
        </>
    );
}