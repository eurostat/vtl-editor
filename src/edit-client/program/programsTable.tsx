import {MuiThemeProvider} from "@material-ui/core/styles";
import {Cached, Clear} from "@material-ui/icons";
import _ from "lodash";
import MaterialTable, {MaterialTableProps} from "material-table";
import React, {useCallback, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {credentialsProvided, expelProgram, programList, replacePrograms} from "../editClientSlice";
import {deleteEntityDialog} from "../../main-view/decision-dialog/decisionDialog";
import {ProgramTransfer} from "./programTransfer";
import {materialTableAction, materialTableTheme, materialTableTitle} from "../../utility/materialTable";
import {deleteEditProgram, fetchEditPrograms} from "../editClientService";
import {getEditCredentials, useValidateEditCredentials} from "../credentialsService";
import {CredentialsPayload} from "../credentialsPayload";
import {useErrorNotice, useSuccessNotice} from "../../utility/useNotification";

export default function ProgramsTable() {
    const programs = _.cloneDeep(useSelector(programList));
    const hasCredentials = useSelector(credentialsProvided);
    const validatedCredentials = useValidateEditCredentials();
    const dispatch = useDispatch();
    const showSuccess = useSuccessNotice();
    const showError = useErrorNotice();

    const loadPrograms = useCallback(async (credentials: CredentialsPayload) => {
        try {
            const received = await fetchEditPrograms(credentials);
            dispatch(replacePrograms(received));
        } catch(error) {
            showError("Failed to load programs.", error);
            return Promise.reject();
        }
    }, [dispatch, showError]);

    useEffect(() => {
        if (hasCredentials) {
            const credentials = validatedCredentials();
            if (credentials) loadPrograms(credentials).catch(() => {
                    // ignored
                });
        }
    }, [hasCredentials, validatedCredentials, loadPrograms]);

    const refreshPrograms = async () => {
        try {
            const credentials = await getEditCredentials();
            await loadPrograms(credentials);
            showSuccess("Programs refreshed successfully.");
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
                    if (response) {
                        dispatch(expelProgram(program));
                        showSuccess(`Program "${program.name}" deleted successfully.`);
                    }
                })
                .catch((error) => {
                    showError(`Failed to delete program "${program.name}".`, error);
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
