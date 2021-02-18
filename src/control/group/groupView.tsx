import { Grid, TextField } from "@material-ui/core";
import _ from "lodash";
import { useSnackbar } from "notistack";
import React, { useCallback, useEffect, useState } from "react";
import ItemList from "../itemList";
import { useGridStyles } from "../managementView";
import { GroupTransfer } from "./group";
import { fetchGroup, fetchGroupDomains, fetchGroupUsers } from "./groupService";

type GroupViewProps = {
    groupId: number,
}

export default function GroupView({groupId}: GroupViewProps) {
    const [group, setGroup] = useState<GroupTransfer>();
    const {enqueueSnackbar} = useSnackbar();
    const styles = useGridStyles();

    const loadGroup = useCallback(async (identifier: number) => {
        try {
            const received = await Promise.all([
                fetchGroup(identifier),
                fetchGroupUsers(identifier),
                fetchGroupDomains(identifier),
            ]);
            setGroup(_.mergeWith(received[0], {users: received[1]}, {domains: received[2]}));
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
                            <ItemList singularTitle="Role" pluralTitle="Roles" data={group?.completeRoles}
                                      captionField={"name"} identifierField={"id"} dense={true}/>
                        </Grid>
                        <Grid container item xs={4}>
                            <ItemList singularTitle="User" pluralTitle="Users" data={group?.users}
                                      captionField={"name"} identifierField={"id"} dense={true}/>
                        </Grid>
                        <Grid container item xs={4}>
                            <ItemList singularTitle="Domain" pluralTitle="Domains" data={group?.domains}
                                      captionField={"name"} identifierField={"id"} dense={true}/>
                        </Grid>
                    </Grid>
                </div>
            </div>
        </>
    )
}