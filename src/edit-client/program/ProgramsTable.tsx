import {MuiThemeProvider} from "@material-ui/core/styles";
import {Cached, Clear} from "@material-ui/icons";
import _ from "lodash";
import MaterialTable, {MaterialTableProps} from "material-table";
import {useSnackbar} from "notistack";
import React, {useCallback, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {expelProgram, programList, replacePrograms} from "../editClientSlice";
import {deleteEntityDialog} from "../../main-view/decision-dialog/decisionDialog";
import {ProgramTransfer} from "./programTransfer";
import {materialTableAction, materialTableTheme, materialTableTitle} from "../../utility/materialTable";
import {deleteProgram, fetchPrograms} from "../editClientService";

export default function ProgramsTable() {
    const programs = _.cloneDeep(useSelector(programList));
    const dispatch = useDispatch();
    const {enqueueSnackbar} = useSnackbar();

    const loadPrograms = useCallback(() => {
        return fetchPrograms().then((received: ProgramTransfer[]) => {
            dispatch(replacePrograms(received));
        }).catch(() => {
            enqueueSnackbar(`Failed to load programs.`, {variant: "error"});
            return Promise.reject();
        });
    }, [dispatch, enqueueSnackbar]);

    useEffect(() => {
        loadPrograms().then().catch(() => {
        });
    }, [loadPrograms]);

    const refreshPrograms = () => {
        loadPrograms()
            .then(() => enqueueSnackbar(`Programs refreshed successfully.`, {variant: "success"}))
            .catch(() => {
            });
    }

    const removeProgram = (event: any, program: ProgramTransfer | ProgramTransfer[]) => {
        if (Array.isArray(program)) return;
        deleteEntityDialog("program", program.name)
            .then(() => {
                deleteProgram(program.id)
                    .then((response) => {
                        if (response && response.success) {
                            dispatch(expelProgram(program));
                            enqueueSnackbar(`Program "${program.name}" deleted successfully.`, {variant: "success"});
                        }
                    })
                    .catch(() => {
                        enqueueSnackbar(`Failed to delete program "${program.name}".`, {variant: "error"});
                    })
            })
            .catch(() => {
            });
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
        detailPanel: (program: ProgramTransfer) => {
            return null
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