import React from "react";
import {ContextMenuEvent, ContextMenuEventType, TreeExplorerMenuProps} from "../tree-explorer/contextMenuEvent";

const DomainExplorerMenu = ({onMenuEvent}: TreeExplorerMenuProps) => {

    const dispatchMenuEvent = (event: ContextMenuEvent) => {
        if (onMenuEvent) onMenuEvent(event);
    }

    const onRefresh = () => dispatchMenuEvent({type: ContextMenuEventType.Refresh});

    return (
        <ul className="menu">
            <li onClick={onRefresh}>Refresh</li>
        </ul>
    );
}

export default DomainExplorerMenu;