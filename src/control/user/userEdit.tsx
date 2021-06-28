import { Checkbox, FormControlLabel, Grid, TextField, Tooltip } from "@material-ui/core";
import { useSnackbar } from "notistack";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "../../main-view/page-header/pageHeader";
import { fetchAllRoles, FORMAT_SIMPLE } from "../controlService";
import { addUser, editedUser, finishUserEdit } from "../controlSlice";
import { DomainTransfer } from "../domain/domain";
import { fetchDomains } from "../domain/domainService";
import { GroupTransfer } from "../group/group";
import { fetchGroups } from "../group/groupService";
import ItemList from "../itemList";
import { useCheckboxStyles, useGridStyles } from "../managementView";
import "../managementView.scss"
import { RoleEntity } from "../role";
import { transferDialog } from "../transferDialog";
import { toUserPayload, UserPayload } from "./user";
import { createUser, fetchUser, updateUser, updateUserDomains, updateUserGroups } from "./userService";

UserEdit.defaultProps = {
    edit: false,
}

export default function UserEdit() {
    const userId = useSelector(editedUser);
    const [user, setUser] = useState<UserPayload | undefined>(undefined);
    const [loaded, setLoaded] = useState<boolean>(false);
    const dispatch = useDispatch();
    const {enqueueSnackbar} = useSnackbar();
    const title = userId ? "Edit User" : "New User";
    const styles = useGridStyles();
    const checkboxStyles = useCheckboxStyles();

    const loadUser = useCallback(async (identifier: number) => {
        try {
            setUser(toUserPayload(await fetchUser(identifier)));
            setLoaded(true);
        } catch {
            enqueueSnackbar(`Failed to load user.`, {variant: "error"});
        }
    }, [enqueueSnackbar]);

    useEffect(() => {
        if (userId) loadUser(userId).then();
    }, [userId, loadUser])

    const confirmUser = async () => {
        try {
            if (user) {
                const response = userId ? await updateUser(user) : await createUser(user);
                await Promise.all([
                    updateUserDomains(response.id, user.domains),
                    updateUserGroups(response.id, user.groups)
                ]);
                dispatch(addUser(response));
                setUser(undefined);
                enqueueSnackbar(`User "${response.name}" ${userId ? "updated" : "created"} successfully.`,
                    {variant: "success"});
            } else {
                enqueueSnackbar("Save of empty user skipped.", {variant: "warning"});
            }
            dispatch(finishUserEdit());
        } catch {
            enqueueSnackbar(`Failed to ${userId ? "update" : "create"} user "${user?.firstName} ${user?.lastName}".`, {variant: "error"});
        }
    }

    const cancelUser = () => {
        dispatch(finishUserEdit());
        setUser(undefined);
    }

    const updateFirstName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUser(Object.assign({}, user, {firstName: event.target.value}));
    };

    const updateLastName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUser(Object.assign({}, user, {lastName: event.target.value}));
    };

    const updateLogin = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUser(Object.assign({}, user, {login: event.target.value}));
    };

    const updateEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUser(Object.assign({}, user, {email: event.target.value}));
    };

    const loadRoles = async () => {
        return fetchAllRoles().catch(() => {
            enqueueSnackbar(`Failed to load roles.`, {variant: "error"});
            return [] as string[];
        });
    }

    const updateRoles = (roles: RoleEntity[]) => {
        setUser(Object.assign({}, user, {completeRoles: roles}));
    }

    const editRoles = async () => {
        const result = await transferDialog({
            title: "Edit Roles",
            singularItem: "Role",
            pluralItem: "Roles",
            selected: user?.completeRoles || [],
            fetchAvailable: loadRoles,
            captionField: "name",
        });
        if (result) updateRoles(result);
    }

    const loadDomains = async () => {
        return fetchDomains(FORMAT_SIMPLE).catch(() => {
            enqueueSnackbar(`Failed to load domains.`, {variant: "error"});
            return [] as DomainTransfer[];
        });
    }

    const updateDomains = (domains: DomainTransfer[]) => {
        setUser(Object.assign({}, user, {domains: domains}));
    }

    const editDomains = async () => {
        const result = await transferDialog({
            title: "Edit Domains",
            singularItem: "Domain",
            pluralItem: "Domains",
            selected: user?.domains || [],
            fetchAvailable: loadDomains,
            captionField: "name",
        });
        if (result) updateDomains(result);
    }

    const loadGroups = async () => {
        return fetchGroups(FORMAT_SIMPLE).catch(() => {
            enqueueSnackbar(`Failed to load groups.`, {variant: "error"});
            return [] as GroupTransfer[];
        });
    }

    const updateGroups = (groups: GroupTransfer[]) => {
        setUser(Object.assign({}, user, {groups: groups}));
    }

    const updateAllDomains = () => {
        setUser(Object.assign({}, user, {hasAllDomains: !user?.hasAllDomains}));
    }

    const editGroups = async () => {
        const result = await transferDialog({
            title: "Edit Groups",
            singularItem: "Group",
            pluralItem: "Groups",
            selected: user?.groups || [],
            fetchAvailable: loadGroups,
            captionField: "name",
        });
        if (result) updateGroups(result);
    }

    return (
        <>
            <PageHeader title={title}/>
            <div className="edit-panel">
                <Grid container item className={styles.root} spacing={2} xs={10}>
                    <Grid item xs={6}>
                        <TextField className="edit-field" variant="outlined" margin="dense" size="small" fullWidth
                                   required={true} autoFocus={true}
                                   label="First Name" helperText="Enter user first name"
                                   value={user?.firstName || ""} onChange={updateFirstName}/>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField className="edit-field" variant="outlined" margin="dense" size="small" fullWidth
                                   required={true}
                                   label="Last Name" helperText="Enter user last name"
                                   value={user?.lastName || ""} onChange={updateLastName}/>
                    </Grid>
                </Grid>
                <Grid container item className={styles.root} spacing={2} xs={10}>
                    <Grid item xs={6}>
                        <TextField className="edit-field" variant="outlined" margin="dense" size="small" fullWidth
                                   autoFocus={true} required={true}
                                   label="Login" helperText="Enter user login"
                                   value={user?.login || ""} onChange={updateLogin}/>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField className="edit-field" variant="outlined" margin="dense" size="small" fullWidth
                                   required={true}
                                   label="E-mail" helperText="Enter user e-mail"
                                   value={user?.email || ""} onChange={updateEmail}/>
                    </Grid>
                </Grid>
                <Grid container item className={styles.root} spacing={2} xs={10}>
                    <FormControlLabel className={checkboxStyles.disabled} label="All Domains" labelPlacement="start"
                                      control={
                                          <Checkbox className={checkboxStyles.disabled} disableRipple
                                                    checked={!!user?.hasAllDomains} onChange={updateAllDomains}
                                                    name="all-domains"/>
                                      }
                    />
                </Grid>
                <Grid container item className={styles.rootMargin} spacing={2} xs={10} direction="row"
                      justify="space-between"
                      alignItems="flex-start">
                    <Grid item xs={4}>
                        <ItemList singularTitle="Role" pluralTitle="Roles" data={user?.completeRoles || []}
                                  setData={updateRoles} editData={editRoles} captionField={"name"}/>
                    </Grid>
                    <Grid item xs={4}>
                        <ItemList singularTitle="Domain" pluralTitle="Domains" data={user?.domains || []}
                                  setData={updateDomains} editData={editDomains} captionField={"name"}/>
                    </Grid>
                    <Grid item xs={4}>
                        <ItemList singularTitle="Group" pluralTitle="Groups" data={user?.groups || []}
                                  setData={updateGroups} editData={editGroups} captionField={"name"}/>
                    </Grid>
                </Grid>
                <Grid container item className={styles.rootMargin} spacing={2} xs={10} justify="center"
                      alignItems="center">
                    <Tooltip title="Save user" placement="top" arrow>
                        <button className={`btn btn-primary default-button button-margin-right`}
                                onClick={confirmUser} disabled={!!userId && !loaded}>
                            <span>Save</span>
                        </button>
                    </Tooltip>
                    <Tooltip title="Cancel edit" placement="top" arrow>
                        <button className="btn btn-primary default-button outline-button"
                                onClick={cancelUser}>
                            <span>Cancel</span>
                        </button>
                    </Tooltip>
                </Grid>
            </div>
        </>
    );
}
