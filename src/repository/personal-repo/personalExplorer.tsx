import _ from "lodash";
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
    incrementFileVersion,
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
    incrementVersionDialog,
    publishItemDialog,
    renameItemDialog
} from "../tree-explorer/treeExplorerService";
import {PublishDialogResult} from "../publishDialog";
import {useEffectOnce} from "../../utility/useEffectOnce";
import {buildIncrementPayload} from "../entity/incrementVersionPayload";
import {IncrementDialogResult} from "../incrementDialog";
import {deleteEntityDialog} from "../../main-view/decision-dialog/decisionDialog";
import {uploadEditDefinition, uploadEditProgram,} from "../../edit-client/editClientService";
import {getEditCredentials} from "../../edit-client/credentialsService";
import {useErrorNotice, useSuccessNotice} from "../../utility/useNotification";

const PersonalExplorer = () => {
    const explorerPanelRef = useRef(null);
    const showSuccess = useSuccessNotice();
    const showError = useErrorNotice();
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
                if (contents) {
                    folders = contents.folders.map(
                        (folder: StoredItemTransfer) => buildFolderNode(folder));
                    files = contents.files.map(
                        (file: StoredItemTransfer) => buildFileNode(file));
                }
                return {folders: folders, files: files};
            });
    }, []);

    useEffectOnce(() => {
        if (!treeLoaded) fetchFolderContents()
            .then((contents) => dispatch(replaceTree(contents)))
            .catch((error) => showError(`Failed to load contents.`, error));
    });

    const onToggle = (node: TreeNode, toggled: boolean) => {
        if (node.children) {
            const baseUpdate: any = {id: node.id, toggled: toggled};
            if (node.loading) {
                fetchFolderContents(node.entity.id)
                    .then((response) => {
                        const fetchUpdate: any = {id: node.id, loading: false};
                        dispatch(updateNode(fetchUpdate));
                        dispatch(addToTree(response));
                    })
                    .catch((error) => showError(`Failed to load folder contents.`, error));
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
                try {
                    const response = await createFolder({name: name, parentId: parentId} as StoredItemPayload);
                    if (response) {
                        dispatch(addFolderToTree(buildFolderNode(response)));
                        showSuccess(`Folder "${response.name}" created successfully.`);
                    }
                } catch (error) {
                    showError(`Failed to create folder "${name}".`, error);
                }
            })
            .catch(() => {
                // ignored
            });
    }

    const createNewFile = (parentId?: number) => {
        createItemDialog(StoredItemType.FILE)
            .then(async (name: string) => {
                try {
                    const response = await createFile({name: name, parentId: parentId} as StoredItemPayload);
                    if (response) {
                        dispatch(addFileToTree(buildFileNode(response)));
                        showSuccess(`File "${response.name}" created successfully.`);
                    }
                } catch (error) {
                    showError(`Failed to create file "${name}".`, error);
                }
            })
            .catch(() => {
                // ignored
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
                showSuccess(`File "${file.name}" opened successfully.`);
                history.push("/");
            }).catch((error) => () => showError(`Failed to load file "${entity.name}".`, error))
        }).catch((error) => showError(`Failed to load file "${entity.name}".`, error))
    }

    const renameItem = (item: StoredItemTransfer) => {
        renameItemDialog(item.type, item.name)
            .then(async (name: string) => {
                const descriptor = item.type[0] + item.type.slice(1).toLocaleLowerCase();
                const payload: StoredItemPayload = Object.assign({}, item, {name: name});
                try {
                    const response = await updateItem(payload, item.type);
                    if (response) {
                        dispatch(replaceNode(buildNode(response)));
                        showSuccess(`${descriptor} "${item.name}" renamed successfully.`);
                    }
                } catch (error) {
                    showError(`Failed to rename ${item.type.toLocaleLowerCase()} "${item.name}".`, error);
                }
            })
            .catch(() => {
                // ignored
            });
    }

    const incrementVersion = (item: StoredItemTransfer) => {
        incrementVersionDialog(item)
            .then(async (target: IncrementDialogResult) => {
                const descriptor = item.type.toLocaleLowerCase();
                const payload = buildIncrementPayload(target.version, item.optLock, target.squash);
                try {
                    const response = await incrementFileVersion(item, payload);
                    if (response) {
                        showSuccess(`Version of ${descriptor} "${item.name}" incremented successfully.`);
                    }
                } catch (error) {
                    showError(`Failed to increment version of ${descriptor} "${item.name}".`, error);
                }
            })
            .catch(() => {
                // ignored
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
                try {
                    const response = await publishFile(payload, item.type);
                    if (response) {
                        showSuccess(`${descriptor} "${item.name}" published successfully.`);
                    }
                } catch (error) {
                    showError(`Failed to publish ${item.type.toLocaleLowerCase()} "${target.name}".`, error);
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
            uploadEditDefinition(item, undefined, credentials)
                .then((response) => {
                    if (response) {
                        showSuccess(`${descriptor} "${item.name}" uploaded successfully to EDIT as dataset definition.`);
                    }
                })
                .catch((error) => showError(`Failed to upload ${item.type.toLocaleLowerCase()} "${item.name}".`, error))
        } catch {
        }
    }

    const sendProgram = async (item: StoredItemTransfer) => {
        const descriptor = item.type.toLocaleLowerCase();
        try {
            const credentials = await getEditCredentials();
            uploadEditProgram(item, undefined, credentials)
                .then((response) => {
                    if (response) {
                        showSuccess(`${descriptor} "${item.name}" uploaded successfully to EDIT as program.`);
                    }
                })
                .catch((error) => showError(`Failed to upload ${item.type.toLocaleLowerCase()} "${item.name}".`, error))
        } catch {
        }
    }

    const removeItem = (node: TreeNode) => {
        const item = node.entity;
        deleteEntityDialog(item.type.toString(), item.name)
            .then(async () => {
                const descriptor = item.type[0] + item.type.slice(1).toLocaleLowerCase();
                const payload: StoredItemPayload = Object.assign({}, item);
                try {
                    const response = await deleteItem(payload, item.type);
                    if (response && response.success) {
                        dispatch(deleteNode(node));
                        showSuccess(`${descriptor} "${item.name}" deleted successfully.`);
                    }
                } catch (error) {
                    showError(`Failed to delete ${item.type.toLocaleLowerCase()} "${item.name}".`, error);
                }
            })
            .catch(() => {
                // ignored
            });
    }

    const onMenuEvent = (event: ContextMenuEvent): any => {
        switch (event.type) {
            case ContextMenuEventType.Refresh: {
                fetchFolderContents()
                    .then((response) => {
                        dispatch(replaceTree(response));
                        showSuccess("Contents refreshed successfully.");
                    })
                    .catch((error) => showError("Failed to refresh contents.", error));
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
            case ContextMenuEventType.IncrementVersion: {
                if (event.payload) return incrementVersion(event.payload);
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
