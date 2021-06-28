import { MuiThemeProvider } from "@material-ui/core/styles";
import { AddCircleOutline, Cached, Clear, Edit } from "@material-ui/icons";
import _ from "lodash";
import MaterialTable, { MaterialTableProps } from "material-table";
import { useSnackbar } from "notistack";
import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { expelUser, replaceUsers, startUserEdit, userList } from "../controlSlice";
import { UserTransfer } from "./user";
import { deleteUser, fetchUsers } from "./userService";
import UserView from "./userView";
import {deleteEntityDialog} from "../../main-view/decision-dialog/decisionDialog";
import {materialTableAction, materialTableTheme, materialTableTitle} from "../../utility/materialTable";

export default function UsersTable() {
    const users = _.cloneDeep(useSelector(userList));
    const dispatch = useDispatch();
    const {enqueueSnackbar} = useSnackbar();

    const loadUsers = useCallback(() => {
        return fetchUsers().then((received: UserTransfer[]) => {
            dispatch(replaceUsers(received));
        }).catch(() => {
            enqueueSnackbar(`Failed to load users.`, {variant: "error"});
            return Promise.reject();
        });
    }, [dispatch, enqueueSnackbar]);

    useEffect(() => {
        loadUsers().then().catch(() => {
        });
    }, [loadUsers]);

    const refreshUsers = () => {
        loadUsers()
            .then(() => enqueueSnackbar(`Users refreshed successfully.`, {variant: "success"}))
            .catch(() => {
            });
    }

    const createUser = () => {
        dispatch(startUserEdit());
    }

    const editUser = (event: any, user: UserTransfer | UserTransfer[]) => {
        if (Array.isArray(user)) return;
        dispatch(startUserEdit(user.id));
    }

    const removeUser = (event: any, user: UserTransfer | UserTransfer[]) => {
        if (Array.isArray(user)) return;
        deleteEntityDialog("user", user.login)
            .then(() => {
                deleteUser(user.id)
                    .then((response) => {
                        if (response && response.success) {
                            dispatch(expelUser(user));
                            enqueueSnackbar(`User "${user.login}" deleted successfully.`, {variant: "success"});
                        }
                    })
                    .catch(() => {
                        enqueueSnackbar(`Failed to delete user "${user.login}".`, {variant: "error"});
                    })
            })
            .catch(() => {
            });
    }

    const tableProps = {
        title: materialTableTitle("VRM User", "VRM Users", users.length),
        data: users,
        columns: [
            {title: "Name", field: "name", defaultSort: "asc"},
            {title: "Login", field: "login"},
            {title: "E-mail", field: "email"},
            {title: "Creation Date", field: "createDate"},
        ],
        options: {
            showTitle: true,
            toolbarButtonAlignment: "left",
        },
        detailPanel: (user: UserTransfer) => {
            return (<UserView userId={user.id}/>)
        },
        actions: [
            materialTableAction(<AddCircleOutline/>, "toolbar", createUser, "New User"),
            materialTableAction(<AddCircleOutline/>, "toolbarOnSelect", createUser, "New User"),
            materialTableAction(<Cached/>, "toolbar", refreshUsers, "Refresh"),
            materialTableAction(<Cached/>, "toolbarOnSelect", refreshUsers, "Refresh"),
            materialTableAction(<Edit/>, "row", editUser, "Edit User"),
            materialTableAction(<Clear/>, "row", removeUser, "Delete User"),
        ],
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