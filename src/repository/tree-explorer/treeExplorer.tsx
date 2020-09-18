import React, { useEffect, useRef, useState } from "react";
import { decorators, theme, TreeNode, TreeTheme } from 'react-treebeard';
import { ScriptFilePayload } from "../entity/scriptFilePayload";
import { StoredFolderPayload } from "../entity/storedFolderPayload";
import { StoredItemTransfer } from "../entity/storedItemTransfer";
import { StoredItemType } from "../entity/storedItemType";
import { createFile, createFolder, getFolderContents } from "../repositoryService";
import ContextMenu from "./context-menu/ContextMenu";
import ItemContainer from "./itemContainer";
import ItemHeader from "./itemHeader";
import TreeBeard from "./tree-beard/components/treeBeard";
import defaultAnimations from "./tree-beard/themes/animations";
import "./treeExplorer.scss";
import TreeExplorerMenu from "./treeExplorerMenu";
import {
    buildFileNode,
    buildFolderNode,
    ContextMenuEvent,
    ContextMenuEventType,
    createItemDialog
} from "./treeExplorerService";

const TreeExplorer = () => {
    const [data, setData] = useState<Array<TreeNode>>([]);
    const [cursor, setCursor] = useState<TreeNode | undefined>(undefined);
    const explorerPanelRef = useRef(null);

    const fetchContents = async (folderId?: number) => {
        let contents = await getFolderContents(folderId);
        if (contents && contents.data) {
            console.log(contents.data);
            const treeNodes: TreeNode[] = [] as Array<TreeNode>;
            contents.data.folders.forEach((folder: StoredItemTransfer) => {
                treeNodes.push(buildFolderNode(folder));
            })
            contents.data.files.forEach((file: StoredItemTransfer) => {
                treeNodes.push(buildFileNode(file));
            })
            return treeNodes;
            // return files;
        }
        return [];
    };

    useEffect(() => {
        console.log("file explorer usefefect");
        const fetch = async () => {
            let response: any[] = await fetchContents()
            //setData(await fetchContents());
            setData(response);
        }
        fetch();
    }, []);

    const onToggle = (node: TreeNode, toggled: boolean) => {
        if (cursor) cursor.active = false;

        node.active = true;
        if (node.children) {
            node.toggled = toggled;
            if (node.loading) {
                fetchContents(node.entity.id).then((children) => {
                    node.loading = false;
                    node.children = new Array(...children);
                    setData(new Array(...data));
                });
            }
        }
        setCursor(node);
        setData(new Array(...data));
    }

    const onDataChange = (changedData: TreeNode[]) => {
        setData(new Array(...changedData));
    }

    const updatedStyle = () => {
        const newTheme: TreeTheme = Object.assign(theme, {});
        newTheme.tree.base.backgroundColor = "transparent";
        return newTheme;
    }

    const createNewFolder = () => {
        createItemDialog(StoredItemType.FOLDER)
            .then(async (name: string) => {
                const folder = await createFolder({name: name} as StoredFolderPayload);
                if (folder && folder.data) {
                    data.push(buildFolderNode(folder.data));
                    onDataChange(data);
                }
            })
            .catch(() => {
            });
    }

    const createNewFile = () => {
        createItemDialog(StoredItemType.FILE)
            .then(async (name: string) => {
                const file = await createFile({name: name} as ScriptFilePayload);
                if (file && file.data) {
                    data.push(buildFileNode(file.data));
                    onDataChange(data);
                }
            })
            .catch(() => {
            });
    }

    const onMenuEvent = (event: ContextMenuEvent): any => {
        switch (event.type) {
            case ContextMenuEventType.NewFolder: {
                return createNewFolder();
            }
            case ContextMenuEventType.NewFile: {
                return createNewFile();
            }
        }
    }

    console.log("tree explorer render")
    return (
        <>
            <div ref={explorerPanelRef!} id="file-explorer" className="file-explorer-container">
                <TreeBeard style={updatedStyle()} data={data} onToggle={onToggle}
                           decorators={{...decorators, Header: ItemHeader, Container: ItemContainer}}
                           animations={defaultAnimations}/>
            </div>
            <ContextMenu menu={<TreeExplorerMenu onMenuEvent={onMenuEvent}/>}
                         domElementRef={explorerPanelRef!}/>
        </>
    )
}

export default TreeExplorer;