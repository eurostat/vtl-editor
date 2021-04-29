import {MuiThemeProvider} from "@material-ui/core/styles";
import {Cached, Clear} from "@material-ui/icons";
import _ from "lodash";
import MaterialTable, {MaterialTableProps} from "material-table";
import {useSnackbar} from "notistack";
import React, {useCallback, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {definitionList, expelDefinition, replaceDefinitions} from "../editClientSlice";
import {deleteEntityDialog} from "../../main-view/decision-dialog/decisionDialog";
import {DatasetDefinitionTransfer} from "./datasetDefinitionTransfer";
import {materialTableAction, materialTableTheme, materialTableTitle} from "../../utility/materialTable";
import {deleteDefinition, fetchDefinitions} from "../editClientService";

export default function DatasetDefinitionsTable() {
    const definitions = _.cloneDeep(useSelector(definitionList));
    const dispatch = useDispatch();
    const {enqueueSnackbar} = useSnackbar();

    const loadDefinitions = useCallback(() => {
        return fetchDefinitions().then((received: DatasetDefinitionTransfer[]) => {
            dispatch(replaceDefinitions(received));
        }).catch(() => {
            enqueueSnackbar(`Failed to load dataset definitions.`, {variant: "error"});
            return Promise.reject();
        });
    }, [dispatch, enqueueSnackbar]);

    useEffect(() => {
        loadDefinitions().then().catch(() => {
        });
    }, [loadDefinitions]);

    const refreshDefinitions = () => {
        loadDefinitions()
            .then(() => enqueueSnackbar(`Dataset definitions refreshed successfully.`, {variant: "success"}))
            .catch(() => {
            });
    }

    const removeDefinition = (event: any, definition: DatasetDefinitionTransfer | DatasetDefinitionTransfer[]) => {
        if (Array.isArray(definition)) return;
        deleteEntityDialog("dataset definition", definition.name)
            .then(() => {
                deleteDefinition(definition.id)
                    .then((response) => {
                        if (response && response.success) {
                            dispatch(expelDefinition(definition));
                            enqueueSnackbar(`Dataset definition "${definition.name}" deleted successfully.`, {variant: "success"});
                        }
                    })
                    .catch(() => {
                        enqueueSnackbar(`Failed to delete dataset definition "${definition.name}".`, {variant: "error"});
                    })
            })
            .catch(() => {
            });
    }

    const tableProps = {
        title: materialTableTitle("Dataset Definition", "Dataset Definitions", definitions.length),
        data: definitions,
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
        detailPanel: (definition: DatasetDefinitionTransfer) => {
            return null
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