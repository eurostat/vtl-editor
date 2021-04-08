import _ from "lodash";
import {useSnackbar} from "notistack";
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
    incrementScriptVersion,
    restoreBinnedItem
} from "./domainRepoService";
import {isDomain, NodeType} from "../tree-explorer/nodeType";
import DomainExplorerMenu from "./domainExplorerMenu";
import DomainItemContainer from "./domainItemContainer";
import {TreePayload} from "../repositorySlice";
import {useEffectOnce} from "../../utility/useEffectOnce";
import {deleteItemDialog, incrementVersionDialog, restoreItemDialog} from "../tree-explorer/treeExplorerService";
import {buildIncrementPayload} from "../entity/incrementVersionPayload";
import {IncrementDialogResult} from "../incrementDialog";
import {useManagerRole, useRole} from "../../control/authorized";

const DomainExplorer = () => {
    const explorerPanelRef = useRef(null);
    const {enqueueSnackbar} = useSnackbar();
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
        if (!treeLoaded) loadRepositoryContents().catch(() =>
            enqueueSnackbar(`Failed to load Domain Repository.`, {variant: "error"}));
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
                        .catch(() => enqueueSnackbar(`Failed to load scripts.`, {variant: "error"}));
                    if (forManager(true)) {
                        fetchDomainBinned(node)
                            .then((results) => {
                                dispatch(addToDomainRepoTree({type: NodeType.BINNED, nodes: results}));
                            })
                            .catch(() => enqueueSnackbar(`Failed to load recycle bin.`, {variant: "error"}));
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
                enqueueSnackbar(`Script "${file.name}" opened successfully.`, {variant: "success"});
                history.push("/");
            }).catch(() => () => enqueueSnackbar(`Failed to load script "${script.name}".`, {variant: "error"}))
        }).catch(() => enqueueSnackbar(`Failed to load script "${script.name}".`, {variant: "error"}))
    }

    const incrementVersion = (item: StoredItemTransfer) => {
        incrementVersionDialog(item)
            .then(async (target: IncrementDialogResult) => {
                const descriptor = item.type.toLocaleLowerCase();
                const payload = buildIncrementPayload(target.version, item.optLock, target.squash);
                try {
                    const response = await incrementScriptVersion(item, payload);
                    if (response && response.data) {
                        enqueueSnackbar(`Version of ${descriptor} "${item.name}" incremented successfully.`, {variant: "success"});
                    }
                } catch {
                    enqueueSnackbar(`Failed to increment version of ${descriptor} "${item.name}".`, {variant: "error"});
                }
            })
            .catch(() => {
            });
    }

    const removeItem = (node: TreeNode) => {
        if (!node || !node.entity || !node.type || !node.entity.type) return;
        const item = node.entity;
        deleteItemDialog(item.type)
            .then(async () => {
                const descriptor = item.type[0] + item.type.slice(1).toLocaleLowerCase();
                const call = node.type === NodeType.BINNED ? deleteBinnedItem : deleteDomainItem;
                const response = await call(node)
                    .catch(() => {
                        enqueueSnackbar(`Failed to delete ${item.type.toLocaleLowerCase()} "${item.name}".`, {variant: "error"});
                    });
                if (response && response.success) {
                    dispatch(deleteDomainRepoNode(node));
                    enqueueSnackbar(`${descriptor} "${item.name}" deleted successfully.`, {variant: "success"});
                }
            })
            .catch(() => {
            });
    }

    const restoreItem = (node: TreeNode) => {
        if (!node || !node.entity || !node.type || !node.entity.type) return;
        const item = node.entity;
        restoreItemDialog(item.type)
            .then(async () => {
                const descriptor = item.type[0] + item.type.slice(1).toLocaleLowerCase();
                const response = await restoreBinnedItem(node)
                    .catch(() => {
                        enqueueSnackbar(`Failed to restore ${item.type.toLocaleLowerCase()} "${item.name}".`, {variant: "error"});
                    });
                if (response && response.success) {
                    dispatch(deleteDomainRepoNode(node));
                    enqueueSnackbar(`${descriptor} "${item.name}" restored successfully.`, {variant: "success"});
                }
            })
            .catch(() => {
            });
    }

    const onMenuEvent = (event: ContextMenuEvent): any => {
        switch (event.type) {
            case ContextMenuEventType.Refresh: {
                loadRepositoryContents()
                    .then(() =>
                        enqueueSnackbar(`Contents refreshed successfully.`, {variant: "success"}))
                    .catch(() =>
                        enqueueSnackbar(`Failed to refresh contents.`, {variant: "error"}));
                break;
            }
            case ContextMenuEventType.OpenFile: {
                if (event.payload) return loadScriptContents(event.payload);
                break;
            }
            case ContextMenuEventType.RenameItem: {
                // if (event.payload) return renameItem(event.payload);
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