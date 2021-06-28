import {MuiThemeProvider} from "@material-ui/core/styles";
import {Cached, Clear} from "@material-ui/icons";
import _ from "lodash";
import MaterialTable, {MaterialTableProps} from "material-table";
import React, {useCallback, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {credentialsProvided, definitionList, expelDefinition, replaceDefinitions} from "../editClientSlice";
import {deleteEntityDialog} from "../../main-view/decision-dialog/decisionDialog";
import {DatasetDefinitionTransfer} from "./datasetDefinitionTransfer";
import {materialTableAction, materialTableTheme, materialTableTitle} from "../../utility/materialTable";
import {deleteEditDefinition, fetchEditDefinitions} from "../editClientService";
import {CredentialsPayload} from "../credentialsPayload";
import {getEditCredentials, useValidateEditCredentials} from "../credentialsService";
import {useErrorNotice, useSuccessNotice} from "../../utility/useNotification";

export default function DatasetDefinitionsTable() {
    const definitions = _.cloneDeep(useSelector(definitionList));
    const hasCredentials = useSelector(credentialsProvided);
    const validatedCredentials = useValidateEditCredentials();
    const dispatch = useDispatch();
    const showSuccess = useSuccessNotice();
    const showError = useErrorNotice();

    const loadDefinitions = useCallback(async (credentials: CredentialsPayload) => {
        try {
            const received = await fetchEditDefinitions(credentials);
            dispatch(replaceDefinitions(received));
        } catch(error) {
            showError("Failed to load dataset definitions.", error);
            return Promise.reject();
        }
    }, [dispatch, showError]);

    useEffect(() => {
        if (hasCredentials) {
            const credentials = validatedCredentials();
            if (credentials) loadDefinitions(credentials).catch(() => {
                // ignored
            });
        }
    }, [hasCredentials, validatedCredentials, loadDefinitions]);

    const refreshDefinitions = async () => {
        try {
            const credentials = await getEditCredentials();
            await loadDefinitions(credentials);
            showSuccess("Dataset definitions refreshed successfully.");
        } catch {
        }
    }

    const removeDefinition = async (event: any, definition: DatasetDefinitionTransfer | DatasetDefinitionTransfer[]) => {
        if (Array.isArray(definition)) return;
        try {
            await deleteEntityDialog("dataset definition", definition.name)
            const credentials = await getEditCredentials();
            deleteEditDefinition(definition.id, credentials)
                .then((response) => {
                    if (response) {
                        dispatch(expelDefinition(definition));
                        showSuccess(`Dataset definition "${definition.name}" deleted successfully.`);
                    }
                })
                .catch((error) => {
                    showError(`Failed to delete dataset definition "${definition.name}".`, error);
                })
        } catch {
        }
    }

    const tableProps = {
        title: materialTableTitle("Dataset Definition", "Dataset Definitions", definitions.length),
        data: definitions,
        columns: [
            {title: "Name", field: "name", defaultSort: "asc"},
            {title: "Description", field: "description"},
            {title: "Version", field: "version"},
            {title: "Index", field: "index"},
            {title: "Line", field: "line"},
        ],
        options: {
            showTitle: true,
            toolbarButtonAlignment: "left",
        },
        actions: [
            materialTableAction(<Cached/>, "toolbar", refreshDefinitions, "Refresh"),
            materialTableAction(<Cached/>, "toolbarOnSelect", refreshDefinitions, "Refresh"),
            materialTableAction(<Clear/>, "row", removeDefinition, "Delete Definition"),
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
