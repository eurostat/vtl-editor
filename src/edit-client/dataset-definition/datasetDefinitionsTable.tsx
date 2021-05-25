import {MuiThemeProvider} from "@material-ui/core/styles";
import {Cached, Clear} from "@material-ui/icons";
import _ from "lodash";
import MaterialTable, {MaterialTableProps} from "material-table";
import {useSnackbar} from "notistack";
import React, {useCallback, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {credentialsProvided, definitionList, expelDefinition, replaceDefinitions} from "../editClientSlice";
import {deleteEntityDialog} from "../../main-view/decision-dialog/decisionDialog";
import {DatasetDefinitionTransfer} from "./datasetDefinitionTransfer";
import {materialTableAction, materialTableTheme, materialTableTitle} from "../../utility/materialTable";
import {deleteEditDefinition, fetchEditDefinitions} from "../editClientService";
import {CredentialsPayload} from "../credentialsPayload";
import {getEditCredentials, useValidateEditCredentials} from "../credentialsService";

export default function DatasetDefinitionsTable() {
    const definitions = _.cloneDeep(useSelector(definitionList));
    const dispatch = useDispatch();
    const hasCredentials = useSelector(credentialsProvided);
    const validatedCredentials = useValidateEditCredentials();
    const {enqueueSnackbar} = useSnackbar();

    const loadDefinitions = useCallback((credentials: CredentialsPayload) => {
        return fetchEditDefinitions(credentials).then((received: DatasetDefinitionTransfer[]) => {
            dispatch(replaceDefinitions(received));
        }).catch(() => {
            enqueueSnackbar(`Failed to load dataset definitions.`, {variant: "error"});
            return Promise.reject();
        });
    }, [dispatch, enqueueSnackbar]);

    useEffect(() => {
        if (hasCredentials) {
            const credentials = validatedCredentials();
            if (credentials) loadDefinitions(credentials)
                .then()
                .catch(() => {
                });
        }
    }, [hasCredentials, validatedCredentials, loadDefinitions, enqueueSnackbar]);

    const refreshDefinitions = async () => {
        try {
            const credentials = await getEditCredentials();
            loadDefinitions(credentials)
                .then(() => enqueueSnackbar(`Dataset definitions refreshed successfully.`, {variant: "success"}))
                .catch(() => {
                });
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
                    if (response && response.success) {
                        dispatch(expelDefinition(definition));
                        enqueueSnackbar(`Dataset definition "${definition.name}" deleted successfully.`, {variant: "success"});
                    }
                })
                .catch(() => {
                    enqueueSnackbar(`Failed to delete dataset definition "${definition.name}".`, {variant: "error"});
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
