import { Grid, TextField } from "@material-ui/core";
import { useSnackbar } from "notistack";
import React, { useCallback, useEffect, useState } from "react";
import ItemList from "../itemList";
import { useGridStyles } from "../managementView";
import "../managementView.scss"
import { nameEmailCaption } from "../user/user";
import { DomainTransfer } from "./domain";
import { fetchDomain } from "./domainService";

type DomainViewProps = {
    domainId: number,
}

export default function DomainView({domainId}: DomainViewProps) {
    const [domain, setDomain] = useState<DomainTransfer>();
    const {enqueueSnackbar} = useSnackbar();
    const styles = useGridStyles();

    const loadDomain = useCallback(async (identifier: number) => {
        try {
            setDomain(await fetchDomain(identifier));
        } catch {
            enqueueSnackbar(`Failed to load domain.`, {variant: "error"});
        }
    }, [enqueueSnackbar]);

    useEffect(() => {
        loadDomain(domainId).then();
    }, [domainId, loadDomain])

    return (
        <>
            <div className="view-panel">
                <div>
                    <Grid container item className={styles.root} spacing={2} xs={10}>
                        <Grid container item xs={6}>
                            <TextField className="edit-field" variant="standard" margin="none" size="small" fullWidth
                                       disabled type="text" helperText="Name" value={domain?.name || ""}/>
                        </Grid>
                        <Grid container item xs={6}>
                            <TextField className="edit-field" variant="standard" margin="none" size="small" fullWidth
                                       disabled type="text" helperText="Description" value={domain?.description || ""}/>
                        </Grid>
                    </Grid>
                    <Grid container item className={styles.root} spacing={2} xs={10}>
                        <Grid container item xs={6}>
                            <TextField className="edit-field" variant="standard" margin="none" size="small" fullWidth
                                       disabled type="text" helperText="Creation Date"
                                       value={domain?.createDate || ""}/>
                        </Grid>
                        <Grid container item xs={6}>
                            <TextField className="edit-field" variant="standard" margin="none" size="small" fullWidth
                                       disabled type="text" helperText="Created By" value={domain?.createdBy || ""}/>
                        </Grid>
                    </Grid>
                    <Grid container item className={styles.root} spacing={2} xs={10}>
                        <Grid container item xs={6}>
                            <TextField className="edit-field" variant="standard" margin="none" size="small" fullWidth
                                       disabled type="text" helperText="Modification Date"
                                       value={domain?.updateDate || ""}/>
                        </Grid>
                        <Grid container item xs={6}>
                            <TextField className="edit-field" variant="standard" margin="none" size="small" fullWidth
                                       disabled type="text" helperText="Modified By" value={domain?.updatedBy || ""}/>
                        </Grid>
                    </Grid>
                    <Grid container item className={styles.rootMargin} spacing={2} xs={10} direction="row"
                          justify="flex-start"
                          alignItems="flex-start">
                        <Grid container item xs={4}>
                            <ItemList dense={true} singularTitle="User" pluralTitle="Users"
                                      data={domain?.users} captionGet={nameEmailCaption}/>
                        </Grid>
                        <Grid container item xs={4}>
                            <ItemList dense={true} singularTitle="Group" pluralTitle="Groups"
                                      data={domain?.groups} captionField={"name"}/>
                        </Grid>
                    </Grid>
                </div>
            </div>
        </>
    )
}