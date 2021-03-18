import { Checkbox, FormControlLabel, Grid, TextField } from "@material-ui/core";
import { useSnackbar } from "notistack";
import React, { useCallback, useEffect, useState } from "react";
import ItemList from "../itemList";
import { useCheckboxStyles, useGridStyles } from "../managementView";
import { UserTransfer } from "./user";
import { fetchUser } from "./userService";

type UserViewProps = {
    userId: number
}

export default function UserView({userId}: UserViewProps) {
    const [user, setUser] = useState<UserTransfer>();
    const {enqueueSnackbar} = useSnackbar();
    const styles = useGridStyles();
    const checkboxStyles = useCheckboxStyles();

    const loadUser = useCallback(async (identifier: number) => {
        try {
            setUser(await fetchUser(identifier));
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
                    <Grid container item className={styles.root} spacing={2} xs={10}>
                        <FormControlLabel className={checkboxStyles.disabled} label="All Domains" labelPlacement="start"
                                          disabled control={
                                              <Checkbox className={checkboxStyles.disabled} disableRipple
                                                        checked={!!user?.hasAllDomains} name="all-domains"/>
                                          }
                        />
                    </Grid>
                    <Grid container item className={styles.rootMargin} spacing={2} xs={10} direction="row"
                          justify="flex-start" alignItems="flex-start">
                        <Grid container item xs={4}>
                            <ItemList dense={true} singularTitle="Role" pluralTitle="Roles"
                                      data={user?.completeRoles} captionField={"name"}/>
                        </Grid>
                        <Grid container item xs={4}>
                            <ItemList dense={true} singularTitle="Domain" pluralTitle="Domains"
                                      data={user?.domains} captionField={"name"}/>
                        </Grid>
                        <Grid container item xs={4}>
                            <ItemList dense={true} singularTitle="Group" pluralTitle="Groups"
                                      data={user?.groups} captionField={"name"}/>
                        </Grid>
                    </Grid>
                </div>
            </div>
        </>
    )
}