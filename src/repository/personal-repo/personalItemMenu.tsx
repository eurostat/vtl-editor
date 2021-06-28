import {faCaretRight} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React, {useState} from "react";
import {StoredItemType} from "../entity/storedItemType";
import {ContextMenuEvent, ContextMenuEventType} from "../tree-explorer/contextMenuEvent";

type ItemMenuProps = {
    node: any,
    onMenuEvent?: (event: ContextMenuEvent) => any
}

const PersonalItemMenu = ({node, onMenuEvent}: ItemMenuProps) => {
    const [showEditSendMenu, setShowEditSendMenu] = useState(false);
    const [showNewMenu, setShowNewMenu] = useState(false);

    const toggleEditSendMenu = (event: any) => {
        if (!showEditSendMenu) event.preventDefault();
        setShowEditSendMenu(!showEditSendMenu);
    }

    const toggleNewMenu = (event: any) => {
        if (!showNewMenu) event.preventDefault();
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
                    return node.entity.parentId;
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

    const onPublishItem = () => {
        if (node && node.entity) {
            dispatchMenuEvent({type: ContextMenuEventType.PublishItem, payload: node});
        }
    }

    const onDeleteItem = () => {
        if (node && node.entity) {
            dispatchMenuEvent({type: ContextMenuEventType.DeleteItem, payload: node});
        }
    }

    const onFolderDetails = () => {
        if (node && node.entity) {
            dispatchMenuEvent({type: ContextMenuEventType.ContainerDetails, payload: node.entity});
        }
    }

    const onFileVersions = () => {
        if (node && node.entity) {
            dispatchMenuEvent({type: ContextMenuEventType.FileVersions, payload: node.entity});
        }
    }

    const onIncrementVersion = () => {
        if (node && node.entity) {
            dispatchMenuEvent({type: ContextMenuEventType.IncrementVersion, payload: node.entity});
        }
    }

    const onSendDefinition = () => {
        if (node && node.entity) {
            dispatchMenuEvent({type: ContextMenuEventType.SendDefinition, payload: node.entity});
        }
    }

    const onSendProgram = () => {
        if (node && node.entity) {
            dispatchMenuEvent({type: ContextMenuEventType.SendProgram, payload: node.entity});
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
            {!node.children
                ? <>
                    <li onClick={onOpenFile}>Open</li>
                    <li onClick={onIncrementVersion}>Increment Version</li>
                    <li onClick={onPublishItem}>Publish</li>
                    <li className="with-submenu" onClick={toggleEditSendMenu}>
                        <span>Upload To EDIT</span>
                        <div className="position-right">
                            <FontAwesomeIcon icon={faCaretRight}/>
                        </div>
                        <ul className={showEditSendMenu ? "submenu visible-menu" : "submenu hide-menu"}>
                            <li onClick={onSendDefinition}>As Dataset Definition</li>
                            <li onClick={onSendProgram}>As Program</li>
                        </ul>
                    </li>
                </>
                : null}
            <li onClick={onRenameItem}>Rename</li>
            <hr/>
            {node.children
                ? <li onClick={onFolderDetails}>Detailed List</li>
                : <li onClick={onFileVersions}>Versions</li>}
            <hr/>
            <li onClick={onDeleteItem}>Delete</li>
        </ul>
    );
}

export default PersonalItemMenu;