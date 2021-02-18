import { Grid, TextField } from "@material-ui/core";
import _ from "lodash";
import { useSnackbar } from "notistack";
import React, { useCallback, useEffect, useState } from "react";
import ItemList from "../itemList";
import { useGridStyles } from "../managementView";
import { UserTransfer } from "./user";
import { fetchUser, fetchUserDomains, fetchUserGroups } from "./userService";

type UserViewProps = {
    userId: number
}

export default function UserView({userId}: UserViewProps) {
    const [user, setUser] = useState<UserTransfer>();
    const {enqueueSnackbar} = useSnackbar();
    const styles = useGridStyles();

    const loadUser = useCallback(async (identifier: number) => {
        try {
            const received = await Promise.all([
                fetchUser(identifier),
                fetchUserDomains(identifier),
                fetchUserGroups(identifier),
            ]);
            setUser(_.mergeWith(received[0], {domains: received[1]}, {groups: received[2]}));
        } catch {
            enqueueSnackbar(`Failed to load user.`, {variant: "error"});
        }
    }, [enqueueSnackbar]);

    useEffect(() => {
        loadUser(userId).then();
    }, [userId, loadUser])

    return (
        <>
            <div className="view-panel">
                <div>
                    <Grid container item className={styles.root} spacing={2} xs={10}>
                        <Grid container item xs={6}>
                            <TextField className="edit-field" variant="standard" margin="none" size="small" fullWidth
                                       disabled type="text" helperText="First Name" value={user?.firstName || ""}/>
                        </Grid>
                        <Grid container item xs={6}>
                            <TextField className="edit-field" variant="standard" margin="none" size="small" fullWidth
                                       disabled type="text" helperText="Last Name" value={user?.lastName || ""}/>
                        </Grid>
                    </Grid>
                    <Grid container item className={styles.root} spacing={2} xs={10}>
                        <Grid container item xs={6}>
                            <TextField className="edit-field" variant="standard" margin="none" size="small" fullWidth
                                       disabled type="text" helperText="Login" value={user?.login || ""}/>
                        </Grid>
                        <Grid container item xs={6}>
                            <TextField className="edit-field" variant="standard" margin="none" size="small" fullWidth
                                       disabled type="text" helperText="E-mail" value={user?.email || ""}/>
                        </Grid>
                    </Grid>
                    <Grid container item className={styles.root} spacing={2} xs={10}>
                        <Grid container item xs={6}>
                            <TextField className="edit-field" variant="standard" margin="none" size="small" fullWidth
                                       disabled type="text" helperText="Creation Date" value={user?.createDate || ""}/>
                        </Grid>
                        <Grid container item xs={6}>
                            <TextField className="edit-field" variant="standard" margin="none" size="small" fullWidth
                                       disabled type="text" helperText="Created By" value={user?.createdBy || ""}/>
                        </Grid>
                    </Grid>
                    <Grid container item className={styles.root} spacing={2} xs={10}>
                        <Grid container item xs={6}>
                            <TextField className="edit-field" variant="standard" margin="none" size="small" fullWidth
                                       disabled type="text" helperText="Modification Date"
                                       value={user?.updateDate || ""}/>
                        </Grid>
                        <Grid container item xs={6}>
                            <TextField className="edit-field" variant="standard" margin="none" size="small" fullWidth
                                       disabled type="text" helperText="Modified By" value={user?.updatedBy || ""}/>
                        </Grid>
                    </Grid>
                    <Grid container item className={styles.rootMargin} spacing={2} xs={10} direction="row"
                          justify="flex-start" alignItems="flex-start">
                        <Grid container item xs={4}>
                            <ItemList singularTitle="Role" pluralTitle="Roles" data={user?.completeRoles}
                                      captionField={"name"} identifierField={"id"} dense={true}/>
                        </Grid>
                        <Grid container item xs={4}>
                            <ItemList singularTitle="Domain" pluralTitle="Domains" data={user?.domains}
                                      captionField={"name"} identifierField={"id"} dense={true}/>
                        </Grid>
                        <Grid container item xs={4}>
                            <ItemList singularTitle="Group" pluralTitle="Groups" data={user?.groups}
                                      captionField={"name"} identifierField={"id"} dense={true}/>
                        </Grid>
                    </Grid>
                </div>
            </div>
        </>
    )
}