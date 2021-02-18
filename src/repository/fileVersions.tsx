import { MuiThemeProvider } from "@material-ui/core/styles";
import { Cached, CloudDownloadOutlined, RestorePageOutlined } from "@material-ui/icons";
import _ from "lodash";
import MaterialTable from "material-table";
import { useSnackbar } from "notistack";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { buildFile } from "../editor/editorFile";
import { storeLoaded } from "../editor/editorSlice";
import { convertEntityDates } from "../web-api/apiUtility";
import { detailTableTheme } from "./detailTableTheme";
import { FileVersionTransfer } from "./entity/fileVersionTransfer";
import { StoredItemTransfer } from "./entity/storedItemTransfer";
import { getFile, getFileVersions, getVersionContent, restoreFileVersion } from "./repositoryService";
import { compareVersions, updateNode, versionedFile } from "./repositorySlice";

const FileVersions = () => {
    const fileId = useSelector(versionedFile);
    const [file, setFile] = useState<StoredItemTransfer>();
    const [versions, setVersions] = useState<any[]>([]);
    const [selected, setSelected] = useState<any[]>([]);
    const tableRef = useRef<any>();
    const dispatch = useDispatch();
    const {enqueueSnackbar} = useSnackbar();
    const history = useHistory();

    const fetchFile = useCallback(() => {
        if (fileId) {
            getFile(fileId).then((received) => {
                const nodeUpdate: any = {id: fileId, entity: received};
                dispatch(updateNode(nodeUpdate));
                setFile(received);
            }).catch(() => {
            });
        }
    }, [fileId, dispatch]);

    useEffect(() => {
        setVersions([]);
        setSelected([]);
        fetchFile();
    }, [fileId, fetchFile]);

    const fetchVersions = useCallback(() => {
        if (file) {
            getFileVersions(file.id)
                .then((response) => {
                    if (response && response.data) {
                        const received: any[] = [];
                        received.push(...response.data.map((item: FileVersionTransfer) => convertEntityDates(item)));
                        received.sort((a, b) => b.version - a.version);
                        setVersions(received);
                    }
                })
                .catch(() => {
                });
        }
    }, [file]);

    useEffect(() => {
        setSelected([]);
        fetchVersions();
    }, [file, fetchVersions]);

    const onSelectionChange = (rows: any[], row?: any) => {
        if (row) {
            if (row.tableData.checked) {
                const selection = [...selected];
                selection.push(_.cloneDeep(row));
                if (selection.length > 2) {
                    const unselect = selection.shift();
                    tableRef.current.dataManager.changeRowSelected(false, [unselect.tableData.id]);
                }
                setSelected(selection);
            } else {
                setSelected(selected.filter((item) => item.tableData.id !== row.tableData.id));
            }
        }
    }

    const onVersionCompare = () => {
        if (selected.length === 2) {
            const compare = [...selected];
            compare.sort((a, b) => a.version - b.version);
            dispatch(compareVersions({file: file, versions: compare}));
            history.push("/diff");
        } else {
            enqueueSnackbar(`Select two versions to compare.`, {variant: "warning"});
        }
    }

    const onOpenVersion = (event: any, row: any) => {
        if (file) {
            getVersionContent(file.id, row.version).then((content) => {
                const loadedFile = buildFile(file.name, content, false, file.id, file.optLock, file.version);
                dispatch(storeLoaded(loadedFile));
                enqueueSnackbar(`Version "${row.version}" opened successfully.`, {variant: "success"});
                history.push("/");
            }).catch(() => enqueueSnackbar(`Failed to load version "${row.version}".`, {variant: "error"}));
        }
    }

    const onRestoreVersion = (event: any, row: any) => {
        if (file) {
            restoreFileVersion(file.id, row.version, {version: file.version}).then(() => {
                fetchFile();
                enqueueSnackbar(`Version "${row.version}" restored successfully.`, {variant: "success"});
            }).catch(() => enqueueSnackbar(`Failed to restore version "${row.version}".`, {variant: "error"}));
        }
    }

    return (
        <MuiThemeProvider theme={detailTableTheme}>
            <MaterialTable tableRef={tableRef}
                           title={`Version history: ${file?.name || "—"}`}
                           data={versions}
                           columns={[
                               {title: "Version number", field: "version"},
                               {title: "Date", field: "updateDate"},
                               {title: "Author", field: "updatedBy"},
                               {title: "Restored from", field: "restoredFrom"}
                           ]}
                           options={{
                               showTitle: true,
                               selection: true,
                               showSelectAllCheckbox: false,
                               showTextRowsSelected: false,
                               toolbarButtonAlignment: "left"
                           }}
                           onSelectionChange={onSelectionChange}
                           actions={[
                               {
                                   tooltip: 'Compare Versions',
                                   icon: 'compare',
                                   onClick: onVersionCompare
                               },
                               {
                                   icon: CloudDownloadOutlined,
                                   tooltip: 'Open version',
                                   position: 'row',
                                   onClick: onOpenVersion
                               },
                               {
                                   icon: RestorePageOutlined,
                                   tooltip: 'Restore version',
                                   position: 'row',
                                   onClick: onRestoreVersion
                               },
                               {
                                   icon: Cached,
                                   tooltip: 'Refresh',
                                   position: 'toolbar',
                                   onClick: fetchFile
                               },
                               {
                                   icon: Cached,
                                   tooltip: 'Refresh',
                                   position: 'toolbarOnSelect',
                                   onClick: fetchFile
                               }
                           ]}
            />
        </MuiThemeProvider>
    )
}

export default FileVersions;