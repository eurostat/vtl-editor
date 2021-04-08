import React from "react";
import {ContextMenuEvent, ContextMenuEventType} from "../tree-explorer/contextMenuEvent";
import {NodeType} from "../tree-explorer/nodeType";
import {useManagerRole} from "../../control/authorized";

type ItemMenuProps = {
    node: any,
    onMenuEvent?: (event: ContextMenuEvent) => any
}

const DomainItemMenu = ({node, onMenuEvent}: ItemMenuProps) => {
    const forManager = useManagerRole();

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

    function buildScriptMenu() {
        return (
            <ul className="menu">
                <li onClick={onOpenFile}>Open</li>
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