import _ from "lodash";
import {useSnackbar} from "notistack";
import React, {useCallback, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory} from "react-router-dom";
import {decorators, TreeNode, TreeTheme} from 'react-treebeard';
import {buildTransferFile} from "../../editor/editorFile";
import {storeLoaded} from "../../editor/editorSlice";
import {StoredItemPayload} from "../entity/storedItemPayload";
import {StoredItemTransfer} from "../entity/storedItemTransfer";
import {StoredItemType} from "../entity/storedItemType";
import {
    createFile,
    createFolder,
    deleteItem,
    getFile,
    getFileContent,
    getFolderContents,
    publishFile,
    updateItem
} from "./personalRepoService";
import {
    addFileToTree,
    addFolderToTree,
    addToTree,
    deleteNode,
    detailFolder,
    personalRepoLoaded,
    personalRepoTree,
    replaceNode,
    replaceTree,
    selectFolder,
    updateNode,
    versionFile
} from "./personalRepoSlice";
import ContextMenu from "../tree-explorer/contextMenu";
import PersonalItemContainer from "./personalItemContainer";
import ItemHeader from "../tree-explorer/itemHeader";
import Toggle from "../tree-explorer/tree-beard/components/Decorators/Toggle";
import TreeBeard from "../tree-explorer/tree-beard/components/treeBeard";
import defaultAnimations from "../tree-explorer/tree-beard/themes/animations";
import defaultTheme from "../tree-explorer/tree-beard/themes/defaultTheme";
import "../tree-explorer/treeExplorer.scss";
import PersonalExplorerMenu from "./personalExplorerMenu";
import {buildFileNode, buildFolderNode, buildNode,} from "./personalExplorerService";
import {RepositoryType} from "../entity/repositoryType";
import {ContextMenuEvent, ContextMenuEventType} from "../tree-explorer/contextMenuEvent";
import {
    createItemDialog,
    deleteItemDialog,
    publishItemDialog,
    renameItemDialog
} from "../tree-explorer/treeExplorerService";
import {PublishDialogResult} from "../publishDialog";
import {useEffectOnce} from "../../utility/useEffectOnce";

const PersonalExplorer = () => {
    const explorerPanelRef = useRef(null);
    const {enqueueSnackbar} = useSnackbar();
    const dispatch = useDispatch();
    const treeItems = useSelector(personalRepoTree);
    const treeLoaded = useSelector(personalRepoLoaded);
    const history = useHistory();
    const [style] = useState<TreeTheme>((() => {
        const initial: TreeTheme = _.cloneDeep(defaultTheme as TreeTheme);
        initial.tree.base.backgroundColor = "transparent";
        initial.tree.node.header.title.whiteSpace = "nowrap";
        initial.tree.node.header.title.display = "inline";
        initial.tree.node.header.title.position = "relative";
        return initial;
    })());

    const fetchFolderContents = useCallback((folderId?: number) => {
        let folders: TreeNode[] = [];
        let files: TreeNode[] = [];
        return getFolderContents(folderId)
            .then((contents) => {
                if (contents && contents.data) {
                    folders = contents.data.folders.map(
                        (folder: StoredItemTransfer) => buildFolderNode(folder));
                    files = contents.data.files.map(
                        (file: StoredItemTransfer) => buildFileNode(file));
                }
                return {folders: folders, files: files};
            })
            .catch(() => {
                enqueueSnackbar(`Failed to load folder contents.`, {variant: "error"});
                return {folders: folders, files: files};
            });
    }, [enqueueSnackbar]);

    useEffectOnce(() => {
        if (!treeLoaded) fetchFolderContents()
            .then((contents) => dispatch(replaceTree(contents)));
    });

    const onToggle = (node: TreeNode, toggled: boolean) => {
        if (node.children) {
            const baseUpdate: any = {id: node.id, toggled: toggled};
            if (node.loading) {
                fetchFolderContents(node.entity.id).then((response) => {
                    const fetchUpdate: any = {id: node.id, loading: false};
                    dispatch(updateNode(fetchUpdate));
                    dispatch(addToTree(response));
                });
            }
            dispatch(updateNode(baseUpdate));
        }
    }

    const onSelect = (node: TreeNode) => {
        const nodeUpdate: any = {id: node.id, active: !node.active};
        if (!node.active) {
            if (node.entity) {
                switch (node.entity.type) {
                    case StoredItemType.FOLDER: {
                        dispatch(selectFolder(node.entity.id));
                        break;
                    }
                    case StoredItemType.FILE: {
                        dispatch(selectFolder(node.entity.parentId));
                        break;
                    }
                    default: {
                        dispatch(selectFolder(undefined));
                    }
                }
            }
        } else {
            dispatch(selectFolder(undefined));
        }
        dispatch(updateNode(nodeUpdate));
    }

    const createNewFolder = (parentId?: number) => {
        createItemDialog(StoredItemType.FOLDER)
            .then(async (name: string) => {
                const response = await createFolder({name: name, parentId: parentId} as StoredItemPayload)
                    .catch(() => {
                        enqueueSnackbar(`Failed to create folder "${name}".`, {variant: "error"});
                    });
                if (response && response.data) {
                    dispatch(addFolderToTree(buildFolderNode(response.data)));
                    enqueueSnackbar(`Folder "${response.data.name}" created successfully.`, {variant: "success"});
                }
            })
            .catch(() => {
            });
    }

    const createNewFile = (parentId?: number) => {
        createItemDialog(StoredItemType.FILE)
            .then(async (name: string) => {
                const response = await createFile({name: name, parentId: parentId} as StoredItemPayload)
                    .catch(() => {
                        enqueueSnackbar(`Failed to create file "${name}".`, {variant: "error"});
                    });
                if (response && response.data) {
                    dispatch(addFileToTree(buildFileNode(response.data)));
                    enqueueSnackbar(`File "${response.data.name}" created successfully.`, {variant: "success"});
                }
            })
            .catch(() => {
            });
    }

    const loadFileContents = (node: TreeNode) => {
        const entity: StoredItemTransfer = node.entity;
        getFileContent(entity.id).then((content) => {
            getFile(entity.id).then((file) => {
                const nodeUpdate: any = {id: node.id, entity: file};
                dispatch(updateNode(nodeUpdate));
                const loadedFile = buildTransferFile(file, content, RepositoryType.PERSONAL);
                dispatch(storeLoaded(loadedFile));
                enqueueSnackbar(`File "${file.name}" opened successfully.`, {variant: "success"});
                history.push("/");
            }).catch(() => () => enqueueSnackbar(`Failed to load file "${entity.name}".`, {variant: "error"}))
        }).catch(() => enqueueSnackbar(`Failed to load file "${entity.name}".`, {variant: "error"}))
    }

    const renameItem = (item: StoredItemTransfer) => {
        renameItemDialog(item.type, item.name)
            .then(async (name: string) => {
                const descriptor = item.type[0] + item.type.slice(1).toLocaleLowerCase();
                const payload: StoredItemPayload = Object.assign({}, item, {name: name});
                const response = await updateItem(payload, item.type)
                    .catch(() => {
                        enqueueSnackbar(`Failed to rename ${item.type.toLocaleLowerCase()} "${name}".`, {variant: "error"});
                    });
                if (response && response.data) {
                    dispatch(replaceNode(buildNode(response.data)));
                    enqueueSnackbar(`${descriptor} "${item.name}" renamed successfully.`, {variant: "success"});
                }
            })
            .catch(() => {
            });
    }

    const publishItem = (node: TreeNode) => {
        const item = node.entity;
        publishItemDialog(item.type, item.name)
            .then(async (target: PublishDialogResult) => {
                const descriptor = item.type[0] + item.type.slice(1).toLocaleLowerCase();
                const payload: StoredItemPayload = Object.assign({}, {
                    id: item.id,
                    name: target.name,
                    parentId: target.domainId
                });
                const response = await publishFile(payload, item.type)
                    .catch(() => {
                        enqueueSnackbar(`Failed to publish ${item.type.toLocaleLowerCase()} "${target.name}".`, {variant: "error"});
                    });
                if (response && response.data) {
                    // dispatch(replaceNode(buildNode(response.data)));
                    enqueueSnackbar(`${descriptor} "${item.name}" published successfully.`, {variant: "success"});
                }
            })
            .catch(() => {
            });
    }

    const removeItem = (node: TreeNode) => {
        const item = node.entity;
        deleteItemDialog(item.type)
            .then(async () => {
                const descriptor = item.type[0] + item.type.slice(1).toLocaleLowerCase();
                const payload: StoredItemPayload = Object.assign({}, item);
                const response = await deleteItem(payload, item.type)
                    .catch(() => {
                        enqueueSnackbar(`Failed to delete ${item.type.toLocaleLowerCase()} "${item.name}".`, {variant: "error"});
                    });
                if (response && response.success) {
                    dispatch(deleteNode(node));
                    enqueueSnackbar(`${descriptor} "${item.name}" deleted successfully.`, {variant: "success"});
                }
            })
            .catch(() => {
            });
    }

    const onMenuEvent = (event: ContextMenuEvent): any => {
        switch (event.type) {
            case ContextMenuEventType.Refresh: {
                fetchFolderContents().then((response) => {
                    dispatch(replaceTree(response));
                    enqueueSnackbar(`Contents refreshed successfully.`, {variant: "success"});
                });
                break;
            }
            case ContextMenuEventType.NewFolder: {
                return createNewFolder(event.payload);
            }
            case ContextMenuEventType.NewFile: {
                return createNewFile(event.payload);
            }
            case ContextMenuEventType.OpenFile: {
                if (event.payload) return loadFileContents(event.payload);
                break;
            }
            case ContextMenuEventType.RenameItem: {
                if (event.payload) return renameItem(event.payload);
                break;
            }
            case ContextMenuEventType.PublishItem: {
                if (event.payload) return publishItem(event.payload);
                break;
            }
            case ContextMenuEventType.DeleteItem: {
                if (event.payload) return removeItem(event.payload);
                break;
            }
            case ContextMenuEventType.ContainerDetails: {
                (async () => {
                    setTimeout(() => {
                        dispatch(detailFolder(event.payload?.id));
                        history.push("/folder")
                    }, 200);
                })();
                break;
            }
            case ContextMenuEventType.FileVersions: {
                if (event.payload) {
                    (async () => {
                        setTimeout(() => {
                            dispatch(versionFile(event.payload.id));
                            history.push("/versions");
                        }, 200);
                    })();
                }
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
                               Container: PersonalItemContainer
                           }}
                           animations={defaultAnimations} onMenuEvent={onMenuEvent}/>
            </div>
            <ContextMenu menu={<PersonalExplorerMenu onMenuEvent={onMenuEvent}/>}
                         domElementRef={explorerPanelRef}/>
        </>
    )
}

export default PersonalExplorer;