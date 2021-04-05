import React from "react";
import {ContextMenuEvent, ContextMenuEventType} from "../tree-explorer/contextMenuEvent";
import {isContainer, isScript} from "../tree-explorer/nodeType";

type ItemMenuProps = {
    node: any,
    onMenuEvent?: (event: ContextMenuEvent) => any
}

const DomainItemMenu = ({node, onMenuEvent}: ItemMenuProps) => {

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

    const onContainerDetails = () => {
        if (node && node.entity) {
            dispatchMenuEvent({type: ContextMenuEventType.ContainerDetails, payload: node.entity});
        }
    }

    const onFileVersions = () => {
        if (node && node.entity) {
            dispatchMenuEvent({type: ContextMenuEventType.FileVersions, payload: node.entity});
        }
    }

    return (
        <ul className="menu">
            {isScript(node)
                ? <>
                    <li onClick={onOpenFile}>Open</li>
                    <li onClick={onRenameItem}>Rename</li>
                    <hr/>
                </>
                : null}
            {isContainer(node) ?
                <li onClick={onContainerDetails}>Detailed List</li>
                : null}
            {isScript(node)
                ? <li onClick={onFileVersions}>Versions</li>
                : null}
            {isScript(node)
                ? <>
                    <hr/>
                    <li onClick={onDeleteItem}>Delete</li>
                </>
                : null}
        </ul>
    );
}

export default DomainItemMenu;