import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { TreeNode } from "react-treebeard";
import { decisionModalInput } from "../../main-view/decision-dialog/DecisionModalInput";
import { ScriptFilePayload } from "../entity/scriptFilePayload";
import { StoredFolderPayload } from "../entity/storedFolderPayload";
import { StoredItemType } from "../entity/storedItemType";
import { createFile, createFolder } from "../repositoryService";
import { buildFileNode, buildFolderNode, createItemDialog } from "./treeExplorerService";

type CustomMenuType = {
    node: any,
    setCurrentNode: (node: any) => void
}

const ItemMenu = ({node, setCurrentNode}: CustomMenuType) => {
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [showNewMenu, setShowNewMenu] = useState(false);

    const onDeleteItem = () => {
        // deleteItemDialog(node.type).then(async (name: string) => {
        //     const file = await createFile({name: name} as ScriptFilePayload);
        //     if (file && file.data) {
        //         data.push(buildFileNode(file.data));
        //         onDataChange(data);
        //     }
        // })
        //     .catch(() => {
        //     });
    }

    const toggleSortMenu = (event: any) => {
        event.preventDefault();
        setShowSortMenu(!showSortMenu);
    }

    const toggleNewMenu = (event: any) => {
        event.preventDefault();
        setShowNewMenu(!showNewMenu);
    }

    const onRename = () => {
        const decision = async () => {
            const type = node.children ? "directory" : "file";
            const res = await decisionModalInput({
                title: "Rename",
                text: `Renaming ${type} ${node.name}. Enter new ${type} name.`,
                acceptButton: {value: "rename", color: "primary"}
            });
            if (res !== 'cancel' && res !== node.name) {
                node.name = res;
                setCurrentNode((prev: any) => {
                    return {...prev, name: res}
                });
            }
        }
        decision();
    }

    const addNewItem = (item: TreeNode) => {
        if (node.type === StoredItemType.FOLDER) {
            //node.
        }
    }

    const onNewFile = () => {
        createItemDialog(StoredItemType.FILE)
            .then(async (name: string) => {
                const file = await createFile({name: name} as ScriptFilePayload);
                if (file && file.data) {
                    addNewItem(buildFileNode(file.data));
                }
            })
            .catch(() => {
            });
    }

    const onNewFolder = () => {
        createItemDialog(StoredItemType.FOLDER)
            .then(async (name: string) => {
                const folder = await createFolder({name: name} as StoredFolderPayload);
                if (folder && folder.data) {
                    addNewItem(buildFolderNode(folder.data));
                }
            })
            .catch(() => {
            });
    }

    return (
        <ul className="menu">
            <li className="with-submenu" onClick={toggleNewMenu}>
                <span>New</span>
                <div className="position-right">
                    <FontAwesomeIcon icon={faCaretRight}/>
                </div>
                <ul className={showNewMenu ? "submenu visible-menu" : "submenu hide-menu"}>
                    <li onClick={onNewFolder}>Folder</li>
                    <li onClick={onNewFile}>File</li>
                </ul>
            </li>
            {!node.children ? <li onClick={() => console.log("test")}>Open</li> : null}
            <li>Copy</li>
            <li>Share</li>
            <li onClick={onRename}>Rename</li>
            <hr/>
            {node.children ? <li>Detailed list</li> : <li>Versions</li>}
            <hr/>
            <li className="with-submenu" onClick={toggleSortMenu}>
                <span>Sort</span>
                <div className="position-right">
                    <FontAwesomeIcon icon={faCaretRight}/>
                </div>
                <ul className={showSortMenu ? "submenu visible-menu" : "submenu hide-menu"}>
                    <li>Name</li>
                    <li>Date</li>
                </ul>
            </li>
            <hr/>
            <li onClick={onDeleteItem}>Delete</li>
        </ul>
    );
}

export default ItemMenu;