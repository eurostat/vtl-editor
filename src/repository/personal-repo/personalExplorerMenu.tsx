import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import {ContextMenuEvent, ContextMenuEventType, TreeExplorerMenuProps} from "../tree-explorer/contextMenuEvent";

const PersonalExplorerMenu = ({onMenuEvent}: TreeExplorerMenuProps) => {
    const [showNewMenu, setShowNewMenu] = useState(false);

    const subMenuOperation = (event: any) => {
        event.preventDefault();
        setShowNewMenu(!showNewMenu);
    }

    const dispatchMenuEvent = (event: ContextMenuEvent) => {
        if (onMenuEvent) onMenuEvent(event);
    }

    const onNewFolder = () => dispatchMenuEvent({type: ContextMenuEventType.NewFolder});
    const onNewFile = () => dispatchMenuEvent({type: ContextMenuEventType.NewFile});
    const onRefresh = () => dispatchMenuEvent({type: ContextMenuEventType.Refresh});
    const onFolderDetails = () => dispatchMenuEvent({type: ContextMenuEventType.ContainerDetails});

    return (
        <ul className="menu">
            <li className="with-submenu" onClick={subMenuOperation}>
                <span>New</span>
                <div className="position-right">
                    <FontAwesomeIcon icon={faCaretRight}/>
                </div>
                <ul className={showNewMenu ? "submenu visible-menu" : "submenu hide-menu"}>
                    <li onClick={onNewFolder}>Folder</li>
                    <li onClick={onNewFile}>File</li>
                </ul>
            </li>
            <li onClick={onFolderDetails}>Detailed List</li>
            <hr/>
            <li onClick={onRefresh}>Refresh</li>
        </ul>
    );
}

export default PersonalExplorerMenu;