import {MuiThemeProvider} from "@material-ui/core/styles";
import {Cached, Clear} from "@material-ui/icons";
import _ from "lodash";
import MaterialTable, {MaterialTableProps} from "material-table";
import {useSnackbar} from "notistack";
import React, {useCallback, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {credentialsProvided, expelProgram, programList, replacePrograms} from "../editClientSlice";
import {deleteEntityDialog} from "../../main-view/decision-dialog/decisionDialog";
import {ProgramTransfer} from "./programTransfer";
import {materialTableAction, materialTableTheme, materialTableTitle} from "../../utility/materialTable";
import {deleteEditProgram, fetchEditPrograms} from "../editClientService";
import {getEditCredentials, useValidateEditCredentials} from "../credentialsService";
import {CredentialsPayload} from "../credentialsPayload";

export default function ProgramsTable() {
    const programs = _.cloneDeep(useSelector(programList));
    const hasCredentials = useSelector(credentialsProvided);
    const validatedCredentials = useValidateEditCredentials();
    const dispatch = useDispatch();
    const {enqueueSnackbar} = useSnackbar();

    const loadPrograms = useCallback((credentials: CredentialsPayload) => {
        return fetchEditPrograms(credentials).then((received: ProgramTransfer[]) => {
            dispatch(replacePrograms(received));
        }).catch(() => {
            enqueueSnackbar(`Failed to load programs.`, {variant: "error"});
            return Promise.reject();
        });
    }, [dispatch, enqueueSnackbar]);

    useEffect(() => {
        if (hasCredentials) {
            const credentials = validatedCredentials();
            if (credentials) loadPrograms(credentials)
                .then()
                .catch(() => {
                });
        }
    }, [hasCredentials, validatedCredentials, loadPrograms, enqueueSnackbar]);

    const refreshPrograms = async () => {
        try {
            const credentials = await getEditCredentials();
            loadPrograms(credentials)
                .then(() => enqueueSnackbar(`Programs refreshed successfully.`, {variant: "success"}))
                .catch(() => {
                });
        } catch {
        }
    }

    const removeProgram = async (event: any, program: ProgramTransfer | ProgramTransfer[]) => {
        if (Array.isArray(program)) return;
        try {
            await deleteEntityDialog("program", program.name);
            const credentials = await getEditCredentials();
            deleteEditProgram(program.id, credentials)
                .then((response) => {
                    if (response && response.success) {
                        dispatch(expelProgram(program));
                        enqueueSnackbar(`Program "${program.name}" deleted successfully.`, {variant: "success"});
                    }
                })
                .catch(() => {
                    enqueueSnackbar(`Failed to delete program "${program.name}".`, {variant: "error"});
                })
        } catch {
        }
    }

    const tableProps = {
        title: materialTableTitle("Program", "Programs", programs.length),
        data: programs,
        columns: [
            {title: "Name", field: "name", defaultSort: "asc"},
            {title: "Description", field: "description"},
            {title: "Creation Date", field: "createDate"},
            {title: "Created By", field: "createdBy"},
        ],
        options: {
            showTitle: true,
            toolbarButtonAlignment: "left",
        },
        actions: [
            materialTableAction(<Cached/>, "toolbar", refreshPrograms, "Refresh"),
            materialTableAction(<Cached/>, "toolbarOnSelect", refreshPrograms, "Refresh"),
            materialTableAction(<Clear/>, "row", removeProgram, "Delete Program"),
        ].filter((action) => action !== null),
    } as MaterialTableProps<any>;

    return (
        <>
            <MuiThemeProvider theme={materialTableTheme}>
                <div className="entities-table">
                    <MaterialTable {...tableProps}/>
                </div>
            </MuiThemeProvider>
        </>
    );
}
