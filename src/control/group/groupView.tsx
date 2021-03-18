import { Grid, TextField } from "@material-ui/core";
import { useSnackbar } from "notistack";
import React, { useCallback, useEffect, useState } from "react";
import ItemList from "../itemList";
import { useGridStyles } from "../managementView";
import { nameEmailCaption } from "../user/user";
import { GroupTransfer } from "./group";
import { fetchGroup } from "./groupService";

type GroupViewProps = {
    groupId: number,
}

export default function GroupView({groupId}: GroupViewProps) {
    const [group, setGroup] = useState<GroupTransfer>();
    const {enqueueSnackbar} = useSnackbar();
    const styles = useGridStyles();

    const loadGroup = useCallback(async (identifier: number) => {
        try {
            setGroup(await fetchGroup(identifier));
        } catch {
            enqueueSnackbar(`Failed to load group.`, {variant: "error"});
        }
    }, [enqueueSnackbar]);

    useEffect(() => {
        loadGroup(groupId).then();
    }, [groupId, loadGroup])

    return (
        <>
            <div className="view-panel">
                <div>
                    <Grid container item className={styles.root} spacing={2} xs={10}>
                        <Grid container item xs={6}>
                            <TextField className="edit-field" variant="standard" margin="none" size="small" fullWidth
                                       disabled type="text" helperText="Name" value={group?.name || ""}/>
                        </Grid>
                        <Grid container item xs={6}>
                            <TextField className="edit-field" variant="standard" margin="none" size="small" fullWidth
                                       disabled type="text" helperText="Description" value={group?.description || ""}/>
                        </Grid>
                    </Grid>
                    <Grid container item className={styles.root} spacing={2} xs={10}>
                        <Grid container item xs={6}>
                            <TextField className="edit-field" variant="standard" margin="none" size="small" fullWidth
                                       disabled type="text" helperText="Creation Date" value={group?.createDate || ""}/>
                        </Grid>
                        <Grid container item xs={6}>
                            <TextField className="edit-field" variant="standard" margin="none" size="small" fullWidth
                                       disabled type="text" helperText="Created By" value={group?.createdBy || ""}/>
                        </Grid>
                    </Grid>
                    <Grid container item className={styles.root} spacing={2} xs={10}>
                        <Grid container item xs={6}>
                            <TextField className="edit-field" variant="standard" margin="none" size="small" fullWidth
                                       disabled type="text" helperText="Modification Date"
                                       value={group?.updateDate || ""}/>
                        </Grid>
                        <Grid container item xs={6}>
                            <TextField className="edit-field" variant="standard" margin="none" size="small" fullWidth
                                       disabled type="text" helperText="Modified By" value={group?.updatedBy || ""}/>
                        </Grid>
                    </Grid>
                    <Grid container item className={styles.rootMargin} spacing={2} xs={10} direction="row"
                          justify="flex-start"
                          alignItems="flex-start">
                        <Grid container item xs={4}>
                            <ItemList dense={true} singularTitle="Role" pluralTitle="Roles"
                                      data={group?.completeRoles} captionField={"name"}/>
                        </Grid>
                        <Grid container item xs={4}>
                            <ItemList dense={true} singularTitle="User" pluralTitle="Users"
                                      data={group?.users} captionGet={nameEmailCaption}/>
                        </Grid>
                        <Grid container item xs={4}>
                            <ItemList dense={true} singularTitle="Domain" pluralTitle="Domains"
                                      data={group?.domains} captionField={"name"}/>
                        </Grid>
                    </Grid>
                </div>
            </div>
        </>
    )
}