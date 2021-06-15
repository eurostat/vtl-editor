import {MuiThemeProvider} from "@material-ui/core/styles";
import {Cached, CloudDownloadOutlined, RestorePageOutlined} from "@material-ui/icons";
import _ from "lodash";
import MaterialTable from "material-table";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router-dom";
import {buildTransferFile} from "../editor/editorFile";
import {storeLoaded} from "../editor/editorSlice";
import {detailTableTheme} from "./detailTableTheme";
import {FileVersionTransfer, processVersionTransfer} from "./entity/fileVersionTransfer";
import {StoredItemTransfer} from "./entity/storedItemTransfer";
import {getFile, getFileVersions, getVersionContent, restoreFileVersion} from "./personal-repo/personalRepoService";
import {compareVersions, updateNode, versionedFile} from "./personal-repo/personalRepoSlice";
import {RepositoryType} from "./entity/repositoryType";
import {useErrorNotice, useSuccessNotice, useWarningNotice} from "../utility/useNotification";

const FileVersions = () => {
    const fileId = useSelector(versionedFile);
    const [file, setFile] = useState<StoredItemTransfer>();
    const [versions, setVersions] = useState<any[]>([]);
    const [selected, setSelected] = useState<any[]>([]);
    const tableRef = useRef<any>();
    const dispatch = useDispatch();
    const showSuccess = useSuccessNotice();
    const showWarning = useWarningNotice();
    const showError = useErrorNotice();
    const history = useHistory();

    const fetchFile = useCallback(async () => {
        if (!fileId) return Promise.reject();
        try {
            const received = await getFile(fileId);
            const nodeUpdate: any = {id: fileId, entity: received};
            dispatch(updateNode(nodeUpdate));
            setFile(received);
        } catch (error) {
            showError("Failed to load file information.", error);
            return Promise.reject();
        }
    }, [fileId, dispatch, showError]);

    const fetchVersions = useCallback(async () => {
        if (!fileId) {
            showWarning("No file selected. Select file first.");
            return Promise.reject();
        }
        try {
            const response = await getFileVersions(fileId);
            if (response) {
                const received: any[] = [];
                received.push(...response.map((item: FileVersionTransfer) => processVersionTransfer(item)));
                received.sort((a, b) => b.version.localeCompare(a.version));
                setVersions(received);
            }
        } catch (error) {
            showError("Failed to load versions.", error);
            return Promise.reject();
        }
    }, [fileId, showWarning, showError]);

    useEffect(() => {
        setVersions([]);
        setSelected([]);
        Promise.all([fetchFile(), fetchVersions()]).catch(() => {
            // ignored
        });
    }, [fileId, fetchFile, fetchVersions]);

    const refreshVersions = async () => {
        try {
            setVersions([]);
            setSelected([]);
            await Promise.all([fetchFile(), fetchVersions()]);
            showSuccess("Versions refreshed successfully.");
        } catch {
        }
    }

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
            compare.sort((a, b) => a.version.localeCompare(b.version));
            dispatch(compareVersions({file: file, versions: compare, repository: RepositoryType.PERSONAL}));
            history.push("/diff");
        } else {
            showWarning("Select two versions to compare.");
        }
    }

    const onOpenVersion = async (event: any, row: any) => {
        if (!file) return;
        try {
            const content = await getVersionContent(file, row.version);
            const loadedFile = buildTransferFile(file, content, RepositoryType.PERSONAL);
            loadedFile.version = row.version;
            dispatch(storeLoaded(loadedFile));
            showSuccess(`Version "${row.version}" opened successfully.`);
            history.push("/");
        } catch (error) {
            showError(`Failed to load version "${row.version}".`, error);
        }
    }

    const onRestoreVersion = async (event: any, row: any) => {
        if (!file) return;
        try {
            await restoreFileVersion(file.id, row.version, {optLock: file.optLock});
            await Promise.all([fetchFile(), fetchVersions()]);
            showSuccess(`Version "${row.version}" restored successfully.`);
        } catch (error) {
            showError(`Failed to restore version "${row.version}".`, error);
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
                                   onClick: refreshVersions
                               },
                               {
                                   icon: Cached,
                                   tooltip: 'Refresh',
                                   position: 'toolbarOnSelect',
                                   onClick: refreshVersions
                               }
                           ]}
            />
        </MuiThemeProvider>
    )
}

export default FileVersions;
