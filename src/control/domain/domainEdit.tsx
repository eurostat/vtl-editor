import { Grid, TextField, Tooltip } from "@material-ui/core";
import { useSnackbar } from "notistack";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "../../main-view/page-header/pageHeader";
import { FORMAT_SIMPLE } from "../controlService";
import { addDomain, editedDomain, finishDomainEdit } from "../controlSlice";
import { GroupTransfer } from "../group/group";
import { fetchGroups } from "../group/groupService";
import ItemList from "../itemList";
import { useGridStyles } from "../managementView";
import "../managementView.scss"
import { transferDialog } from "../transferDialog";
import { nameEmailCaption, UserTransfer } from "../user/user";
import { fetchUsers } from "../user/userService";
import { DomainPayload, emptyDomain, toDomainPayload } from "./domain";
import { createDomain, fetchDomain, updateDomain, updateDomainGroups, updateDomainUsers } from "./domainService";

DomainEdit.defaultProps = {
    edit: false,
}

export default function DomainEdit() {
    const domainId = useSelector(editedDomain);
    const [domain, setDomain] = useState<DomainPayload | undefined>(undefined);
    const [loaded, setLoaded] = useState<boolean>(false);
    const dispatch = useDispatch();
    const {enqueueSnackbar} = useSnackbar();
    const title = domainId ? "Edit Domain" : "New Domain";
    const styles = useGridStyles();

    const loadDomain = useCallback(async (identifier: number) => {
        try {
            setDomain(toDomainPayload(await fetchDomain(identifier)));
            setLoaded(true);
        } catch {
            enqueueSnackbar(`Failed to load domain.`, {variant: "error"});
        }
    }, [enqueueSnackbar]);

    useEffect(() => {
        if (domainId) loadDomain(domainId).then();
        else setDomain(emptyDomain());
    }, [domainId, loadDomain])

    const confirmDomain = async () => {
        try {
            if (domain) {
                const call = (domainId ? () => updateDomain(domain) : () => createDomain(domain));
                const response = await call();
                await Promise.all([
                    updateDomainUsers(response.id, domain.users),
                    updateDomainGroups(response.id, domain.groups)
                ]);
                dispatch(addDomain(response));
                setDomain(undefined);
                enqueueSnackbar(`Domain "${response.name}" ${domainId ? "updated" : "created"} successfully.`,
                    {variant: "success"});
            } else {
                enqueueSnackbar("Save of empty domain skipped.", {variant: "warning"});
            }
            dispatch(finishDomainEdit());
        } catch {
            enqueueSnackbar(`Failed to ${domainId ? "update" : "create"} domain "${domain?.name}".`, {variant: "error"});
        }
    }

    const cancelDomain = () => {
        dispatch(finishDomainEdit());
        setDomain(undefined);
    }

    const updateName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDomain(Object.assign({}, domain, {name: event.target.value}));
    }

    const updateDescription = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDomain(Object.assign({}, domain, {description: event.target.value}));
    }

    const loadUsers = async () => {
        return fetchUsers(FORMAT_SIMPLE).catch(() => {
            enqueueSnackbar(`Failed to load users.`, {variant: "error"});
            return [] as UserTransfer[];
        });
    }

    const updateUsers = (users: UserTransfer[]) => {
        setDomain(Object.assign({}, domain, {users: users}));
    }

    const editUsers = async () => {
        const result = await transferDialog({
            title: "Edit Users",
            singularItem: "User",
            pluralItem: "Users",
            selected: domain?.users || [],
            fetchAvailable: loadUsers,
            captionGet: nameEmailCaption,
        });
        if (result) updateUsers(result);
    }

    const loadGroups = async () => {
        return fetchGroups(FORMAT_SIMPLE).catch(() => {
            enqueueSnackbar(`Failed to load groups.`, {variant: "error"});
            return [] as GroupTransfer[];
        });
    }

    const updateGroups = (groups: GroupTransfer[]) => {
        setDomain(Object.assign({}, domain, {groups: groups}));
    }

    const editGroups = async () => {
        const result = await transferDialog({
            title: "Edit Groups",
            singularItem: "Group",
            pluralItem: "Groups",
            selected: domain?.groups || [],
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
                                   autoFocus={true} required={true} label="Name" helperText="Enter domain name"
                                   value={domain?.name || ""} onChange={updateName}/>
                    </Grid>
                </Grid>
                <Grid container item className={styles.root} spacing={2} xs={10}>
                    <Grid item xs={12}>
                        <TextField className="edit-field" variant="outlined" margin="dense" size="small" fullWidth
                                   label="Description" helperText="Enter domain description"
                                   value={domain?.description || ""} onChange={updateDescription}/>
                    </Grid>
                </Grid>
                <Grid container item className={styles.rootMargin} spacing={2} xs={10} direction="row"
                      justify="flex-start"
                      alignItems="flex-start">
                    <Grid item xs={4}>
                        <ItemList singularTitle="User" pluralTitle="Users" data={domain?.users || []}
                                  setData={updateUsers} editData={editUsers}
                                  captionGet={nameEmailCaption}/>
                    </Grid>
                    <Grid item xs={4}>
                        <ItemList singularTitle="Group" pluralTitle="Groups" data={domain?.groups || []}
                                  setData={updateGroups} editData={editGroups} captionField={"name"}/>
                    </Grid>
                </Grid>
                <Grid container item className={styles.rootMargin} spacing={2} xs={10} justify="center"
                      alignItems="center">
                    <Tooltip title="Save domain" placement="top" arrow>
                        <button className={`btn btn-primary default-button button-margin-right`}
                                onClick={confirmDomain} disabled={!!domainId && !loaded}>
                            <span>Save</span>
                        </button>
                    </Tooltip>
                    <Tooltip title="Cancel edit" placement="top" arrow>
                        <button className="btn btn-primary default-button outline-button"
                                onClick={cancelDomain}>
                            <span>Cancel</span>
                        </button>
                    </Tooltip>
                </Grid>
            </div>
        </>
    );
}