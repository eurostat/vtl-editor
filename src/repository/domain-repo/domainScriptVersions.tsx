import {MuiThemeProvider} from "@material-ui/core/styles";
import {Cached, CloudDownloadOutlined, RestorePageOutlined} from "@material-ui/icons";
import _ from "lodash";
import MaterialTable, {Action} from "material-table";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router-dom";
import {fetchScript, fetchScriptVersionContent, fetchScriptVersions, restoreScriptVersion} from "./domainRepoService";
import {domainVersionedScript, updateDomainRepoNode} from "./domainRepoSlice";
import {StoredItemTransfer} from "../entity/storedItemTransfer";
import {FileVersionTransfer, processVersionTransfer} from "../entity/fileVersionTransfer";
import {compareVersions} from "../personal-repo/personalRepoSlice";
import {detailTableTheme} from "../detailTableTheme";
import {buildTransferFile} from "../../editor/editorFile";
import {RepositoryType} from "../entity/repositoryType";
import {storeLoaded} from "../../editor/editorSlice";
import {useUserRole} from "../../control/authorized";
import {useErrorNotice, useSuccessNotice, useWarningNotice} from "../../utility/useNotification";

const DomainScriptVersions = () => {
    const scriptNode = useSelector(domainVersionedScript);
    const [script, setScript] = useState<StoredItemTransfer>();
    const [versions, setVersions] = useState<any[]>([]);
    const [selected, setSelected] = useState<any[]>([]);
    const tableRef = useRef<any>();
    const dispatch = useDispatch();
    const showSuccess = useSuccessNotice();
    const showWarning = useWarningNotice();
    const showError = useErrorNotice();
    const history = useHistory();
    const forUser = useUserRole();

    const loadScript = useCallback(async () => {
        if (!scriptNode || !scriptNode.entity) return Promise.reject();
        try {
            const received = await fetchScript(scriptNode.entity);
            const nodeUpdate: any = {id: scriptNode.id, type: scriptNode.type, entity: received};
            dispatch(updateDomainRepoNode(nodeUpdate));
            setScript(received);
        } catch (error) {
            showError("Failed to load script information.", error);
            return Promise.reject();
        }
    }, [scriptNode, dispatch, showError]);

    const loadVersions = useCallback(async () => {
        if (!scriptNode || !scriptNode.entity) {
            showWarning("No script selected. Select script first.");
            return Promise.reject();
        }
        try {
            const response = await fetchScriptVersions(scriptNode.entity);
            if (response) {
                const received: any[] = [];
                received.push(...response.map((item: FileVersionTransfer) => processVersionTransfer(item)));
                received.sort((a, b) => b.version.localeCompare(a.version, undefined, {numeric: true}));
                setVersions(received);
            }
        } catch (error) {
            showError("Failed to load versions.", error);
            return Promise.reject();
        }
    }, [scriptNode, showWarning, showError]);

    useEffect(() => {
        setVersions([]);
        setSelected([]);
        Promise.all([loadScript(), loadVersions()]).catch(() => {
            // ignored
        });
    }, [scriptNode, loadScript, loadVersions]);

    const refreshVersions = async () => {
        try {
            setVersions([]);
            setSelected([]);
            await Promise.all([loadScript(), loadVersions()]);
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
            compare.sort((a, b) => a.version.localeCompare(b.version, undefined, {numeric: true}));
            dispatch(compareVersions({file: script, versions: compare, repository: RepositoryType.DOMAIN}));
            history.push("/diff");
        } else {
            showWarning(`Select two versions to compare.`);
        }
    }

    const onOpenVersion = async (event: any, row: any) => {
        if (!script) return;
        try {
            const content = await fetchScriptVersionContent(script, row.version);
            const loadedFile = buildTransferFile(script, content, RepositoryType.DOMAIN);
            loadedFile.version = row.version;
            dispatch(storeLoaded(loadedFile));
            showSuccess(`Version "${row.version}" opened successfully.`);
            history.push("/");
        } catch (error) {
            showError(`Failed to load version "${row.version}".`, error);
        }
    }

    const onRestoreVersion = async (event: any, row: any) => {
        if (!script) return;
        try {
            await restoreScriptVersion(script, row.version);
            await Promise.all([loadScript(), loadVersions()]);
            showSuccess(`Version "${row.version}" restored successfully.`);
        } catch (error) {
            showError(`Failed to restore version "${row.version}".`, error)
        }
    }

    return (
        <MuiThemeProvider theme={detailTableTheme}>
            <MaterialTable tableRef={tableRef}
                           title={`Version history: ${script?.name || "—"}`}
                           data={versions}
                           columns={[
                               {title: "Version number", field: "version"},
                               {title: "Final", field: "finalizedCaption"},
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
                               forUser({
                                   icon: RestorePageOutlined,
                                   tooltip: 'Restore version',
                                   position: 'row',
                                   onClick: onRestoreVersion
                               }),
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
                           ].filter((action: any) => action !== null) as Action<any>[]}
            />
        </MuiThemeProvider>
    )
}

export default DomainScriptVersions;
