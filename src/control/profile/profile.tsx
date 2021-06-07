import { Checkbox, FormControlLabel, Grid, TextField } from "@material-ui/core";
import { useSnackbar } from "notistack";
import React, { useCallback, useEffect, useState } from "react";
import PageHeader from "../../main-view/page-header/pageHeader";
import { fetchProfile } from "../controlService";
import { domainInheritedCaption } from "../domain/domain";
import ItemList from "../itemList";
import { useCheckboxStyles, useGridStyles } from "../managementView";
import "../managementView.scss";
import { roleInheritedCaption } from "../role";
import { UserProfileTransfer } from "./userProfile";

export default function Profile() {
    const [user, setUser] = useState<UserProfileTransfer | undefined>(undefined);
    const {enqueueSnackbar} = useSnackbar();
    const styles = useGridStyles();
    const checkboxStyles = useCheckboxStyles();

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
                                      data={user?.completeRoles} captionGet={roleInheritedCaption}/>
                        </Grid>
                        <Grid container item xs={4}>
                            <ItemList dense={true} singularTitle="Domain" pluralTitle="Domains"
                                      data={user?.domains} captionGet={domainInheritedCaption}/>
                        </Grid>
                        <Grid container item xs={4}>
                            <ItemList dense={true} singularTitle="Group" pluralTitle="Groups"
                                      data={user?.groups} captionField={"name"}/>
                        </Grid>
                    </Grid>
                    <Grid container item className={styles.rootMargin} spacing={2} xs={10} direction="row"
                          justify="flex-start" alignItems="flex-start">
                        <Grid container item xs={12}>
                            <span>* Roles and domains inherited from groups.</span>
                        </Grid>
                    </Grid>
                </div>
            </div>
        </>
    )
}