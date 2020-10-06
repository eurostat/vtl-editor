import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { StoredItemType } from "../entity/storedItemType";
import { ContextMenuEvent, ContextMenuEventType } from "./treeExplorerService";

type ItemMenuProps = {
    node: any,
    onMenuEvent?: (event: ContextMenuEvent) => any
}

const ItemMenu = ({node, onMenuEvent}: ItemMenuProps) => {
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [showNewMenu, setShowNewMenu] = useState(false);

    const toggleSortMenu = (event: any) => {
        event.preventDefault();
        setShowSortMenu(!showSortMenu);
    }

    const toggleNewMenu = (event: any) => {
        event.preventDefault();
        setShowNewMenu(!showNewMenu);
    }

    const dispatchMenuEvent = (event: ContextMenuEvent) => {
        if (onMenuEvent) onMenuEvent(event);
    }

    const newParentId = (): number | undefined => {
        if (node && node.entity) {
            switch (node.entity.type) {
                case StoredItemType.FOLDER: {
                    return node.entity.id;
                }
                case StoredItemType.FILE: {
                    return node.entity.parentFolderId;
                }
            }
        }
        return undefined;
    }

    const onNewFolder = () => {
        dispatchMenuEvent({type: ContextMenuEventType.NewFolder, payload: newParentId()});
    }

    const onNewFile = () => {
        dispatchMenuEvent({type: ContextMenuEventType.NewFile, payload: newParentId()});
    }

    const onOpenFile = () => {
        if (node && node.entity) {
            dispatchMenuEvent({type: ContextMenuEventType.OpenFile, payload: node});
        }
    }

    const onRenameItem = () => {
        if (node && node.entity) {
            dispatchMenuEvent({type: ContextMenuEventType.RenameItem, payload: node.entity});
        }
    }

    const onDeleteItem = () => {
        if (node && node.entity) {
            dispatchMenuEvent({type: ContextMenuEventType.DeleteItem, payload: node});
        }
    }

    const onFolderDetails = () => {
        if (node && node.entity) {
            dispatchMenuEvent({type: ContextMenuEventType.FolderDetails, payload: node.entity});
        }
    }

    const onFileVersions = (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        if (node && node.entity) {
            dispatchMenuEvent({type: ContextMenuEventType.FileVersions, payload: node.entity});
        }
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
            {!node.children ? <li onClick={onOpenFile}>Open</li> : null}
            <li onClick={onRenameItem}>Rename</li>
            <hr/>
            {node.children
                ? <li onClick={onFolderDetails}>Detailed list</li>
                : <li onClick={onFileVersions}>Versions</li>}
            {/*<hr/>*/}
            {/*<li className="with-submenu" onClick={toggleSortMenu}>*/}
            {/*    <span>Sort</span>*/}
            {/*    <div className="position-right">*/}
            {/*        <FontAwesomeIcon icon={faCaretRight}/>*/}
            {/*    </div>*/}
            {/*    <ul className={showSortMenu ? "submenu visible-menu" : "submenu hide-menu"}>*/}
            {/*        <li>Name</li>*/}
            {/*        <li>Date</li>*/}
            {/*    </ul>*/}
            {/*</li>*/}
            <hr/>
            <li onClick={onDeleteItem}>Delete</li>
        </ul>
    );
}

export default ItemMenu;