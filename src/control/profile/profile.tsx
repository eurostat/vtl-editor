import { Grid, TextField } from "@material-ui/core";
import { useSnackbar } from "notistack";
import React, { useCallback, useEffect, useState } from "react";
import PageHeader from "../../main-view/page-header/pageHeader";
import { fetchProfile } from "../controlService";
import ItemList from "../itemList";
import { useGridStyles } from "../managementView";
import { UserProfileTransfer } from "./userProfile";
import "../managementView.scss";

export default function Profile() {
    const [user, setUser] = useState<UserProfileTransfer | undefined>(undefined);
    const {enqueueSnackbar} = useSnackbar();
    const styles = useGridStyles();

    const loadProfile = useCallback(async () => {
        try {
            const received = await fetchProfile();
            setUser(received);
        } catch {
            enqueueSnackbar(`Failed to load profile.`, {variant: "error"});
        }
    }, [enqueueSnackbar]);

    useEffect(() => {
        loadProfile().then();
    }, [loadProfile])

    return (
        <>
            <PageHeader title={"Profile"}/>
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