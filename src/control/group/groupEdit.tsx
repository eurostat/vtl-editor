import { Grid, TextField, Tooltip } from "@material-ui/core";
import _ from "lodash";
import { useSnackbar } from "notistack";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "../../main-view/page-header/pageHeader";
import { fetchAllRoles } from "../controlService";
import { addGroup, editedGroup, finishGroupEdit } from "../controlSlice";
import { DomainTransfer } from "../domain/domain";
import { fetchDomains } from "../domain/domainService";
import ItemList from "../itemList";
import { useGridStyles } from "../managementView";
import { RoleEntity } from "../role";
import { transferDialog } from "../transferDialog";
import { UserTransfer } from "../user/user";
import { fetchUsers } from "../user/userService";
import { emptyGroup, GroupPayload, toGroupPayload } from "./group";
import {
    createGroup,
    fetchGroup,
    fetchGroupDomains,
    fetchGroupUsers,
    updateGroup,
    updateGroupDomains,
    updateGroupUsers
} from "./groupService";

GroupEdit.defaultProps = {
    edit: false,
}

export default function GroupEdit() {
    const groupId = useSelector(editedGroup);
    const [group, setGroup] = useState<GroupPayload | undefined>(undefined);
    const [loaded, setLoaded] = useState<boolean>(false);
    const dispatch = useDispatch();
    const {enqueueSnackbar} = useSnackbar();
    const title = groupId ? "Edit Group" : "New Group";
    const styles = useGridStyles();

    const loadGroup = useCallback(async (identifier: number) => {
        try {
            const received = await Promise.all([
                fetchGroup(identifier),
                fetchGroupUsers(identifier),
                fetchGroupDomains(identifier),
            ]);
            setGroup(toGroupPayload(
                _.mergeWith(received[0], {users: received[1]}, {domains: received[2]})));
            setLoaded(true);
        } catch {
            enqueueSnackbar(`Failed to load group.`, {variant: "error"});
        }
    }, [enqueueSnackbar]);

    useEffect(() => {
        if (groupId) loadGroup(groupId).then();
        else setGroup(emptyGroup());
    }, [groupId, loadGroup])

    const confirmGroup = async () => {
        try {
            if (group) {
                const call = (groupId ? () => updateGroup(group) : () => createGroup(group));
                const response = await call();
                await Promise.all([
                    updateGroupUsers(response.id, group.users),
                    updateGroupDomains(response.id, group.domains)
                ]);
                dispatch(addGroup(response));
                setGroup(undefined);
                enqueueSnackbar(`Domain "${response.name}" ${groupId ? "updated" : "created"} successfully.`,
                    {variant: "success"});
            } else {
                enqueueSnackbar("Save of empty group skipped.", {variant: "warning"});
            }
            dispatch(finishGroupEdit());
        } catch {
            enqueueSnackbar(`Failed to ${groupId ? "update" : "create"} group "${group?.name}".`, {variant: "error"});
        }
    }

    const cancelGroup = () => {
        dispatch(finishGroupEdit());
        setGroup(undefined);
    }

    const updateName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGroup(Object.assign({}, group, {name: event.target.value}));
    }

    const updateDescription = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGroup(Object.assign({}, group, {description: event.target.value}));
    }

    const loadRoles = async () => {
        return fetchAllRoles().catch(() => {
            enqueueSnackbar(`Failed to load roles.`, {variant: "error"});
            return [] as string[];
        });
    }

    const updateRoles = (roles: RoleEntity[]) => {
        setGroup(Object.assign({}, group, {completeRoles: roles}));
    }

    const editRoles = async () => {
        const result = await transferDialog({
            title: "Edit Roles",
            singularItem: "Role",
            pluralItem: "Roles",
            selected: group?.completeRoles || [],
            fetchAvailable: loadRoles,
            captionField: "name",
            identifierField: "id",
        });
        if (result) updateRoles(result);
    }

    const loadUsers = async () => {
        return fetchUsers().catch(() => {
            enqueueSnackbar(`Failed to load users.`, {variant: "error"});
            return [] as UserTransfer[];
        });
    }

    const updateUsers = (users: UserTransfer[]) => {
        setGroup(Object.assign({}, group, {users: users}));
    }

    const editUsers = async () => {
        const result = await transferDialog({
            title: "Edit Users",
            singularItem: "User",
            pluralItem: "Users",
            selected: group?.users || [],
            fetchAvailable: loadUsers,
            captionField: "name",
            identifierField: "id",
        });
        if (result) updateUsers(result);
    }

    const loadDomains = async () => {
        return fetchDomains().catch(() => {
            enqueueSnackbar(`Failed to load domains.`, {variant: "error"});
            return [] as DomainTransfer[];
        });
    }

    const updateDomains = (domains: DomainTransfer[]) => {
        setGroup(Object.assign({}, group, {domains: domains}));
    }

    const editDomains = async () => {
        const result = await transferDialog({
            title: "Edit Domains",
            singularItem: "Domain",
            pluralItem: "Domains",
            selected: group?.domains || [],
            fetchAvailable: loadDomains,
            captionField: "name",
            identifierField: "id",
        });
        if (result) updateDomains(result);
    }

    return (
        <>
            <PageHeader title={title}/>
            <div className="edit-panel">
                <Grid container item className={styles.root} spacing={2} xs={10}>
                    <Grid item xs={6}>
                        <TextField className="edit-field" variant="outlined" margin="dense" size="small" fullWidth
                                   autoFocus={true} required={true}
                                   label="Name" helperText="Enter group name"
                                   value={group?.name || ""} onChange={updateName}/>
                    </Grid>
                </Grid>
                <Grid container item className={styles.root} spacing={2} xs={10}>
                    <Grid item xs={12}>
                        <TextField className="edit-field" variant="outlined" margin="dense" size="small" fullWidth
                                   label="Description" helperText="Enter group description"
                                   value={group?.description || ""} onChange={updateDescription}/>
                    </Grid>
                </Grid>
                <Grid container item className={styles.rootMargin} spacing={2} xs={10} direction="row"
                      justify="space-between"
                      alignItems="flex-start">
                    <Grid item xs={4}>
                        <ItemList singularTitle="Role" pluralTitle="Roles" data={group?.completeRoles || []}
                                  setData={updateRoles} editData={editRoles}
                                  captionField={"name"} identifierField={"id"}/>
                    </Grid>
                    <Grid item xs={4}>
                        <ItemList singularTitle="User" pluralTitle="Users" data={group?.users || []}
                                  setData={updateUsers} editData={editUsers}
                                  captionField={"name"} identifierField={"id"}/>
                    </Grid>
                    <Grid item xs={4}>
                        <ItemList singularTitle="Domain" pluralTitle="Domains" data={group?.domains || []}
                                  setData={updateDomains} editData={editDomains}
                                  captionField={"name"} identifierField={"id"}/>
                    </Grid>
                </Grid>
                <Grid container item className={styles.rootMargin} spacing={2} xs={10} justify="center"
                      alignItems="center">
                    <Tooltip title="Save group" placement="top" arrow>
                        <button className={`btn btn-primary default-button button-margin-right`}
                                onClick={confirmGroup}
                                disabled={!!groupId && !loaded}>
                            <span>Save</span>
                        </button>
                    </Tooltip>
                    <Tooltip title="Cancel edit" placement="top" arrow>
                        <button className="btn btn-primary default-button outline-button"
                                onClick={cancelGroup}>
                            <span>Cancel</span>
                        </button>
                    </Tooltip>
                </Grid>
            </div>
        </>
    );
}