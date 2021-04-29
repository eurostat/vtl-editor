import React, {useState} from "react";
import {ContextMenuEvent, ContextMenuEventType} from "../tree-explorer/contextMenuEvent";
import {NodeType} from "../tree-explorer/nodeType";
import {useManagerRole} from "../../control/authorized";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretRight} from "@fortawesome/free-solid-svg-icons";

type ItemMenuProps = {
    node: any,
    onMenuEvent?: (event: ContextMenuEvent) => any
}

const DomainItemMenu = ({node, onMenuEvent}: ItemMenuProps) => {
    const [showEditSendMenu, setShowEditSendMenu] = useState(false);
    const forManager = useManagerRole();

    const toggleEditSendMenu = (event: any) => {
        if (!showEditSendMenu) event.preventDefault();
        setShowEditSendMenu(!showEditSendMenu);
    }

    const dispatchMenuEvent = (event: ContextMenuEvent) => {
        if (onMenuEvent) onMenuEvent(event);
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

    const onRestoreItem = () => {
        if (node && node.entity) {
            dispatchMenuEvent({type: ContextMenuEventType.RestoreItem, payload: node});
        }
    }

    const onContainerDetails = () => {
        if (node && node.entity) {
            dispatchMenuEvent({type: ContextMenuEventType.ContainerDetails, payload: node});
        }
    }

    const onFileVersions = () => {
        if (node && node.entity) {
            dispatchMenuEvent({type: ContextMenuEventType.FileVersions, payload: node});
        }
    }

    const onIncrementVersion = () => {
        if (node && node.entity) {
            dispatchMenuEvent({type: ContextMenuEventType.IncrementVersion, payload: node.entity});
        }
    }

    const onFinalizeVersion = () => {
        if (node && node.entity) {
            dispatchMenuEvent({type: ContextMenuEventType.FinalizeVersion, payload: node.entity});
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

    function buildScriptMenu() {
        return (
            <ul className="menu">
                <li onClick={onOpenFile}>Open</li>
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
                {forManager(<li onClick={onIncrementVersion}>Increment Version</li>)}
                {forManager(<li onClick={onFinalizeVersion}>Finalize Version</li>)}
                {/*<li onClick={onRenameItem}>Rename</li>*/}
                <hr/>
                <li onClick={onFileVersions}>Versions</li>
                {forManager(
                    <>
                        <hr/>
                        <li onClick={onDeleteItem}>Delete</li>
                    </>
                )}
            </ul>
        );
    }

    function buildContainerMenu() {
        return (
            <ul className="menu">
                <li onClick={onContainerDetails}>Detailed List</li>
            </ul>
        )
    }

    function buildBinnedMenu() {
        return (
            forManager(<ul className="menu">
                <li onClick={onRestoreItem}>Restore</li>
                <hr/>
                <li onClick={onDeleteItem}>Delete permanently</li>
            </ul>)
        )
    }

    switch (node.type) {
        case NodeType.SCRIPT: {
            return buildScriptMenu();
        }
        case NodeType.CONTAINER: {
            return buildContainerMenu();
        }
        case NodeType.BINNED: {
            return buildBinnedMenu();
        }
        default: {
            return null;
        }
    }
}

export default DomainItemMenu;