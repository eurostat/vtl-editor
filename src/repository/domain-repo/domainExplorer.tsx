import _ from "lodash";
import React, {useCallback, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router-dom";
import {decorators, TreeNode, TreeTheme} from 'react-treebeard';
import {buildTransferFile} from "../../editor/editorFile";
import {storeLoaded} from "../../editor/editorSlice";
import {StoredItemTransfer} from "../entity/storedItemTransfer";
import ContextMenu from "../tree-explorer/contextMenu";
import ItemHeader from "../tree-explorer/itemHeader";
import Toggle from "../tree-explorer/tree-beard/components/Decorators/Toggle";
import TreeBeard from "../tree-explorer/tree-beard/components/treeBeard";
import defaultAnimations from "../tree-explorer/tree-beard/themes/animations";
import defaultTheme from "../tree-explorer/tree-beard/themes/defaultTheme";
import "../tree-explorer/treeExplorer.scss";
import {RepositoryType} from "../entity/repositoryType";
import {ContextMenuEvent, ContextMenuEventType} from "../tree-explorer/contextMenuEvent";
import {
    addDomainRepoNode,
    addToDomainRepoTree,
    clearDomainRepoTree,
    deleteDomainRepoNode,
    detailDomainFolder,
    domainRepoLoaded,
    domainRepoTree,
    updateDomainRepoNode,
    versionDomainScript
} from "./domainRepoSlice";
import {
    buildContainerNode,
    deleteBinnedItem,
    deleteDomainItem,
    domainRepoContainers,
    fetchDomainBinned,
    fetchDomainRepository,
    fetchDomainScripts,
    fetchScript,
    fetchScriptContent,
    finalizeScriptVersion,
    incrementScriptVersion,
    restoreBinnedItem
} from "./domainRepoService";
import {isDomain, NodeType} from "../tree-explorer/nodeType";
import DomainExplorerMenu from "./domainExplorerMenu";
import DomainItemContainer from "./domainItemContainer";
import {TreePayload} from "../repositorySlice";
import {useEffectOnce} from "../../utility/useEffectOnce";
import {finalizeVersionDialog, incrementVersionDialog, restoreItemDialog} from "../tree-explorer/treeExplorerService";
import {buildIncrementPayload} from "../entity/incrementVersionPayload";
import {IncrementDialogResult} from "../incrementDialog";
import {useManagerRole, useRole} from "../../control/authorized";
import {deleteEntityDialog} from "../../main-view/decision-dialog/decisionDialog";
import {uploadEditDefinition, uploadEditProgram} from "../../edit-client/editClientService";
import {getEditCredentials} from "../../edit-client/credentialsService";
import {useErrorNotice, useSuccessNotice} from "../../utility/useNotification";

const DomainExplorer = () => {
    const explorerPanelRef = useRef(null);
    const showSuccess = useSuccessNotice();
    const showError = useErrorNotice();
    const dispatch = useDispatch();
    const treeItems = useSelector(domainRepoTree);
    const treeLoaded = useSelector(domainRepoLoaded);
    const history = useHistory();
    const [style] = useState<TreeTheme>((() => {
        const initial: TreeTheme = _.cloneDeep(defaultTheme as TreeTheme);
        initial.tree.base.backgroundColor = "transparent";
        initial.tree.node.header.title.whiteSpace = "nowrap";
        initial.tree.node.header.title.display = "inline";
        initial.tree.node.header.title.position = "relative";
        return initial;
    })());
    const forManager = useManagerRole();
    const hasRole = useRole();

    const loadRepositoryContents = useCallback(async () => {
        return fetchDomainRepository().then((domains) => {
            dispatch(clearDomainRepoTree());
            let domainLoad: TreePayload = {type: NodeType.DOMAIN, nodes: domains}
            dispatch(addToDomainRepoTree(domainLoad));
            domains.forEach((domain) => {
                const containers = domainRepoContainers
                    .filter((container) => !container.role || hasRole(container.role))
                    .map((container) => buildContainerNode(container.name, domain, container.childType));
                let containerLoad: TreePayload = {type: NodeType.CONTAINER, nodes: containers}
                dispatch(addToDomainRepoTree(containerLoad));
            })
        });
    }, [hasRole, dispatch]);

    useEffectOnce(() => {
        if (!treeLoaded) loadRepositoryContents()
            .catch((error) => showError("Failed to load domain repository.", error));
    });

    const onToggle = (node: TreeNode, toggled: boolean) => {
        if (node.children) {
            const baseUpdate: any = {id: node.id, type: node.type, toggled: toggled};
            if (node.loading) {
                if (isDomain(node)) {
                    fetchDomainScripts(node)
                        .then((results) => {
                            dispatch(addToDomainRepoTree({type: NodeType.SCRIPT, nodes: results}));
                            const fetchUpdate: any = {id: node.id, type: node.type, loading: false};
                            dispatch(updateDomainRepoNode(fetchUpdate));
                        })
                        .catch((error) => showError("Failed to load scripts.", error));
                    if (forManager(true)) {
                        fetchDomainBinned(node)
                            .then((results) => {
                                dispatch(addToDomainRepoTree({type: NodeType.BINNED, nodes: results}));
                            })
                            .catch((error) => showError("Failed to load recycle bin.", error));
                    }
                }
            }
            dispatch(updateDomainRepoNode(baseUpdate));
        }
    }

    const onSelect = (node: TreeNode) => {
        const nodeUpdate: any = {id: node.id, type: node.type, active: !node.active};
        dispatch(updateDomainRepoNode(nodeUpdate));
    }

    const loadScriptContents = (node: TreeNode) => {
        if (!node.entity) return;
        const script: StoredItemTransfer = node.entity;
        fetchScriptContent(script).then((content) => {
            fetchScript(script).then((file) => {
                const nodeUpdate: any = {id: node.id, type: node.type, entity: file};
                dispatch(updateDomainRepoNode(nodeUpdate));
                const loadedFile = buildTransferFile(file, content, RepositoryType.DOMAIN);
                dispatch(storeLoaded(loadedFile));
                showSuccess(`Script "${file.name}" opened successfully.`);
                history.push("/");
            }).catch((error) => () => showError(`Failed to load script "${script.name}".`, error))
        }).catch((error) => showError(`Failed to load script "${script.name}".`, error))
    }

    const incrementVersion = (item: StoredItemTransfer) => {
        incrementVersionDialog(item)
            .then(async (target: IncrementDialogResult) => {
                const descriptor = item.type.toLocaleLowerCase();
                const payload = buildIncrementPayload(target.version, item.optLock, target.squash);
                try {
                    await incrementScriptVersion(item, payload);
                    showSuccess(`Version of ${descriptor} "${item.name}" incremented successfully.`);
                } catch (error) {
                    showError(`Failed to increment version of ${descriptor} "${item.name}".`, error);
                }
            })
            .catch(() => {
                // ignored
            });
    }

    const finalizeVersion = (item: StoredItemTransfer) => {
        finalizeVersionDialog(item)
            .then(async () => {
                const descriptor = item.type.toLocaleLowerCase();
                try {
                    await finalizeScriptVersion(item);
                    showSuccess(`Version ${item.version} of ${descriptor} "${item.name}" finalized successfully.`);
                } catch (error) {
                    showError(`Failed to finalize version ${item.version} of ${descriptor} "${item.name}".`, error);
                }
            })
            .catch(() => {
                // ignored
            });
    }

    const sendDefinition = async (item: StoredItemTransfer) => {
        const descriptor = item.type.toLocaleLowerCase();
        try {
            const credentials = await getEditCredentials();
            uploadEditDefinition(item, item.parentId, credentials)
                .then((response) => {
                    if (response) {
                        showSuccess(`${descriptor} "${item.name}" uploaded successfully to EDIT as dataset definition.`);
                    }
                })
                .catch((error) => showError(`Failed to upload ${item.type.toLocaleLowerCase()} "${item.name}".`, error));
        } catch {
        }
    }

    const sendProgram = async (item: StoredItemTransfer) => {
        const descriptor = item.type.toLocaleLowerCase();
        try {
            const credentials = await getEditCredentials();
            uploadEditProgram(item, item.parentId, credentials)
                .then((response) => {
                    if (response) {
                        showSuccess(`${descriptor} "${item.name}" uploaded successfully to EDIT as program.`);
                    }
                })
                .catch((error) => showError(`Failed to upload ${item.type.toLocaleLowerCase()} "${item.name}".`, error));
        } catch {
        }
    }

    const removeItem = (node: TreeNode) => {
        if (!node || !node.entity || !node.type || !node.entity.type) return;
        const item = node.entity;
        deleteEntityDialog(item.type.toString(), item.name)
            .then(async () => {
                const descriptor = item.type[0] + item.type.slice(1).toLocaleLowerCase();
                try {
                    const response = node.type === NodeType.BINNED
                        ? await deleteBinnedItem(node)
                        : await deleteDomainItem(node);
                    dispatch(deleteDomainRepoNode(node));
                    if (response) dispatch(addDomainRepoNode(response));
                    showSuccess(`${descriptor} "${item.name}" deleted successfully.`);
                } catch (error) {
                    showError(`Failed to delete ${item.type.toLocaleLowerCase()} "${item.name}".`, error);
                }
            })
            .catch(() => {
                // ignored
            });
    }

    const restoreItem = (node: TreeNode) => {
        if (!node || !node.entity || !node.type || !node.entity.type) return;
        const item = node.entity;
        restoreItemDialog(item.type)
            .then(async () => {
                const descriptor = item.type[0] + item.type.slice(1).toLocaleLowerCase();
                try {
                    const response = await restoreBinnedItem(node);
                    if (response) {
                        dispatch(deleteDomainRepoNode(node));
                        dispatch(addDomainRepoNode(response));
                        showSuccess(`${descriptor} "${item.name}" restored successfully.`);
                    }
                } catch (error) {
                    showError(`Failed to restore ${item.type.toLocaleLowerCase()} "${item.name}".`, error);
                }
            })
            .catch(() => {
                // ignored
            });
    }

    const onMenuEvent = (event: ContextMenuEvent): any => {
        switch (event.type) {
            case ContextMenuEventType.Refresh: {
                loadRepositoryContents()
                    .then(() => showSuccess("Contents refreshed successfully."))
                    .catch((error) => showError("Failed to refresh contents.", error));
                break;
            }
            case ContextMenuEventType.OpenFile: {
                if (event.payload) return loadScriptContents(event.payload);
                break;
            }
            case ContextMenuEventType.DeleteItem: {
                if (event.payload) return removeItem(event.payload);
                break;
            }
            case ContextMenuEventType.RestoreItem: {
                if (event.payload) return restoreItem(event.payload);
                break;
            }
            case ContextMenuEventType.ContainerDetails: {
                (async () => {
                    setTimeout(() => {
                        dispatch(detailDomainFolder(event.payload));
                        history.push("/domainfolder")
                    }, 200);
                })();
                break;
            }
            case ContextMenuEventType.FileVersions: {
                if (event.payload) {
                    (async () => {
                        setTimeout(() => {
                            dispatch(versionDomainScript(event.payload));
                            history.push("/domainversions");
                        }, 200);
                    })();
                }
                break;
            }
            case ContextMenuEventType.IncrementVersion: {
                if (event.payload) return incrementVersion(event.payload);
                break;
            }
            case ContextMenuEventType.FinalizeVersion: {
                if (event.payload) return finalizeVersion(event.payload);
                break;
            }
            case ContextMenuEventType.SendDefinition: {
                if (event.payload) return sendDefinition(event.payload);
                break;
            }
            case ContextMenuEventType.SendProgram: {
                if (event.payload) return sendProgram(event.payload);
                break;
            }
        }
    }

    return (
        <>
            <div ref={explorerPanelRef} id="file-explorer" className="file-explorer-container">
                <TreeBeard style={style} data={treeItems} onToggle={onToggle} onSelect={onSelect}
                           decorators={{
                               ...decorators,
                               Toggle: Toggle,
                               Header: ItemHeader,
                               Container: DomainItemContainer
                           }}
                           animations={defaultAnimations} onMenuEvent={onMenuEvent}/>
            </div>
            <ContextMenu menu={<DomainExplorerMenu onMenuEvent={onMenuEvent}/>}
                         domElementRef={explorerPanelRef}/>
        </>
    )
}

export default DomainExplorer;
