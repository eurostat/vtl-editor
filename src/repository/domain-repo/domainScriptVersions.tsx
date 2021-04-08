import {MuiThemeProvider} from "@material-ui/core/styles";
import {Cached, CloudDownloadOutlined, RestorePageOutlined} from "@material-ui/icons";
import _ from "lodash";
import MaterialTable, {Action} from "material-table";
import {useSnackbar} from "notistack";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router-dom";
import {fetchScript, fetchScriptVersionContent, fetchScriptVersions, restoreScriptVersion} from "./domainRepoService";
import {domainVersionedScript, updateDomainRepoNode} from "./domainRepoSlice";
import {StoredItemTransfer} from "../entity/storedItemTransfer";
import {FileVersionTransfer} from "../entity/fileVersionTransfer";
import {convertEntityDates} from "../../web-api/apiUtility";
import {compareVersions} from "../personal-repo/personalRepoSlice";
import {detailTableTheme} from "../detailTableTheme";
import {buildTransferFile} from "../../editor/editorFile";
import {RepositoryType} from "../entity/repositoryType";
import {storeLoaded} from "../../editor/editorSlice";
import {useUserRole} from "../../control/authorized";

const DomainScriptVersions = () => {
    const scriptNode = useSelector(domainVersionedScript);
    const [script, setScript] = useState<StoredItemTransfer>();
    const [versions, setVersions] = useState<any[]>([]);
    const [selected, setSelected] = useState<any[]>([]);
    const tableRef = useRef<any>();
    const dispatch = useDispatch();
    const {enqueueSnackbar} = useSnackbar();
    const history = useHistory();
    const forUser = useUserRole();

    const loadScript = useCallback(() => {
        if (!scriptNode || !scriptNode.entity) return;
        fetchScript(scriptNode.entity).then((received) => {
            const nodeUpdate: any = {id: scriptNode.id, type: scriptNode.type, entity: received};
            dispatch(updateDomainRepoNode(nodeUpdate));
            setScript(received);
        }).catch(() => {
        });
    }, [scriptNode, dispatch]);

    useEffect(() => {
        setVersions([]);
        setSelected([]);
        loadScript();
    }, [scriptNode, loadScript]);

    const loadVersions = useCallback(() => {
        if (!script) return;
        fetchScriptVersions(script)
            .then((response) => {
                if (response && response.data) {
                    const received: any[] = [];
                    received.push(...response.data.map((item: FileVersionTransfer) => convertEntityDates(item)));
                    received.sort((a, b) => b.version.localeCompare(a.version, undefined, {numeric: true}));
                    setVersions(received);
                }
            })
            .catch(() => enqueueSnackbar(`Failed to load versions.`, {variant: "error"}));
    }, [script, enqueueSnackbar]);

    useEffect(() => {
        setSelected([]);
        loadVersions();
    }, [script, loadVersions]);

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
            enqueueSnackbar(`Select two versions to compare.`, {variant: "warning"});
        }
    }

    const onOpenVersion = (event: any, row: any) => {
        if (script) {
            fetchScriptVersionContent(script, row.version).then((content) => {
                const loadedFile = buildTransferFile(script, content, RepositoryType.DOMAIN);
                dispatch(storeLoaded(loadedFile));
                enqueueSnackbar(`Version "${row.version}" opened successfully.`, {variant: "success"});
                history.push("/");
            }).catch(() => enqueueSnackbar(`Failed to load version "${row.version}".`, {variant: "error"}));
        }
    }

    const onRestoreVersion = (event: any, row: any) => {
        if (script) {
            restoreScriptVersion(script, row.version).then(() => {
                loadScript();
                enqueueSnackbar(`Version "${row.version}" restored successfully.`, {variant: "success"});
            }).catch(() => enqueueSnackbar(`Failed to restore version "${row.version}".`, {variant: "error"}));
        }
    }

    return (
        <MuiThemeProvider theme={detailTableTheme}>
            <MaterialTable tableRef={tableRef}
                           title={`Version history: ${script?.name || "—"}`}
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
                                   onClick: loadScript
                               },
                               {
                                   icon: Cached,
                                   tooltip: 'Refresh',
                                   position: 'toolbarOnSelect',
                                   onClick: loadScript
                               }
                           ].filter((action: any) => action !== null) as Action<any>[]}
            />
        </MuiThemeProvider>
    )
}

export default DomainScriptVersions;