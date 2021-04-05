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
    domainRepoLoaded,
    domainRepoTree,
    updateDomainRepoNode
} from "./domainRepoSlice";
import {
    buildContainerNode,
    deleteDomainItem,
    domainRepoContainers,
    fetchDomainBinned,
    fetchDomainRepository,
    fetchDomainScripts,
    fetchScript,
    fetchScriptContent
} from "./domainRepoService";
import {isDomain, NodeType} from "../tree-explorer/nodeType";
import DomainExplorerMenu from "./domainExplorerMenu";
import DomainItemContainer from "./domainItemContainer";
import {TreePayload} from "../repositorySlice";
import {useEffectOnce} from "../../utility/useEffectOnce";
import {deleteItemDialog} from "../tree-explorer/treeExplorerService";

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

    const loadRepositoryContents = useCallback(async () => {
        return fetchDomainRepository().then((domains) => {
            dispatch(clearDomainRepoTree());
            let domainLoad: TreePayload = {type: NodeType.DOMAIN, nodes: domains}
            dispatch(addToDomainRepoTree(domainLoad));
            domains.forEach((domain) => {
                const containers = domainRepoContainers
                    .map((container) => buildContainerNode(container.name, domain, container.childType));
                let containerLoad: TreePayload = {type: NodeType.CONTAINER, nodes: containers}
                dispatch(addToDomainRepoTree(containerLoad));
            })
        });
    }, [dispatch]);

    useEffectOnce(() => {
        if (!treeLoaded) loadRepositoryContents().catch(() =>
            enqueueSnackbar(`Failed to load Domain Repository.`, {variant: "error"}));
    });

    const onToggle = async (node: TreeNode, toggled: boolean) => {
        if (node.children) {
            const baseUpdate: any = {id: node.id, type: node.type, toggled: toggled};
            if (node.loading) {
                if (isDomain(node)) {
                    try {
                        dispatch(addToDomainRepoTree({type: NodeType.SCRIPT, nodes: await fetchDomainScripts(node)}));
                        dispatch(addToDomainRepoTree({type: NodeType.BINNED, nodes: await fetchDomainBinned(node)}));
                        const fetchUpdate: any = {id: node.id, type: node.type, loading: false};
                        dispatch(updateDomainRepoNode(fetchUpdate));
                    } catch {
                        enqueueSnackbar(`Failed to load contents.`, {variant: "error"});
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
        const entity: StoredItemTransfer = node.entity;
        fetchScriptContent(node).then((content) => {
            fetchScript(node).then((file) => {
                const nodeUpdate: any = {id: node.id, type: node.type, entity: file};
                dispatch(updateDomainRepoNode(nodeUpdate));
                const loadedFile = buildTransferFile(file, content, RepositoryType.DOMAIN);
                dispatch(storeLoaded(loadedFile));
                enqueueSnackbar(`Script "${file.name}" opened successfully.`, {variant: "success"});
                history.push("/");
            }).catch(() => () => enqueueSnackbar(`Failed to load script "${entity.name}".`, {variant: "error"}))
        }).catch(() => enqueueSnackbar(`Failed to load script "${entity.name}".`, {variant: "error"}))
    }

    const removeItem = (node: TreeNode) => {
        const item = node.entity;
        deleteItemDialog(item.type)
            .then(async () => {
                const descriptor = item.type[0] + item.type.slice(1).toLocaleLowerCase();
                const response = await deleteDomainItem(node)
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
            case ContextMenuEventType.ContainerDetails: {
                // (async () => {
                //     setTimeout(() => {
                //         dispatch(detailFolder(event.payload?.id));
                //         history.push("/folder")
                //     }, 200);
                // })();
                break;
            }
            case ContextMenuEventType.FileVersions: {
                // if (event.payload) {
                //     (async () => {
                //         setTimeout(() => {
                //             dispatch(versionFile(event.payload.id));
                //             history.push("/versions");
                //         }, 200);
                //     })();
                // }
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