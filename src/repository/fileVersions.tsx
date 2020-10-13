import { MuiThemeProvider } from "@material-ui/core/styles";
import { Cached, CloudDownloadOutlined, RestorePageOutlined } from "@material-ui/icons";
import MaterialTable from "material-table";
import { useSnackbar } from "notistack";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { buildFile } from "../editor/editorFile";
import { muiTheme } from "../utility/detailTable";
import { FileVersionTransfer } from "./entity/fileVersionTransfer";
import { StoredItemTransfer } from "./entity/storedItemTransfer";
import { getFile, getFileVersions, getVersionContent, restoreFileVersion } from "./repositoryService";
import { compareVersions, updateNode, versionedFile } from "./repositorySlice";
import { storeLoaded } from "../editor/editorSlice";

const FileVersions = () => {
    const fileId = useSelector(versionedFile);
    const [file, setFile] = useState<StoredItemTransfer>();
    const [versions, setVersions] = useState<any[]>([]);
    const [selected, setSelected] = useState<any[]>([]);
    const tableRef = useRef<any>();
    const dispatch = useDispatch();
    const {enqueueSnackbar} = useSnackbar();
    const history = useHistory();

    const convertItem = (item: FileVersionTransfer) => {
        const converted = Object.assign({} as any, item);
        converted.updateDate = new Date(item.updateDate).toLocaleString();
        return converted;
    }

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
        fetchFile();
    }, [fileId, fetchFile]);

    const fetchVersions = useCallback(() => {
        if (file) {
            getFileVersions(file.id).then((response) => {
                if (response && response.data) {
                    const received: any[] = [];
                    received.push(...response.data.map((item: FileVersionTransfer) => convertItem(item)));
                    received.sort((a, b) => b.version - a.version);
                    setVersions(received);
                }
            }).catch(() => {
            });
        }
    }, [file]);

    useEffect(() => fetchVersions(), [file, fetchVersions]);

    const onSelectionChange = (rows: any[], row: any) => {
        if (row.tableData.checked) {
            const selection = [...selected];
            const version = Object.assign({}, row);
            version.tableData = Object.assign({}, row.tableData);
            selection.push(version);
            if (selection.length > 2) {
                const unselect = selection.shift();
                tableRef.current.dataManager.changeRowSelected(false, [unselect.tableData.id]);
            }
            setSelected(selection);
        } else {
            setSelected(selected.filter((item) => item.tableData.id !== row.tableData.id));
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
        <MuiThemeProvider theme={muiTheme}>
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