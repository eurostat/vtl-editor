import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { ContextMenuEvent, ContextMenuEventType } from "./treeExplorerService";

type TreeExplorerMenuProps = {
    onMenuEvent: (event: ContextMenuEvent) => any
}

const TreeExplorerMenu = ({onMenuEvent}: TreeExplorerMenuProps) => {
    const [showNewMenu, setShowNewMenu] = useState(false);

    const subMenuOperation = (event: any) => {
        event.preventDefault();
        setShowNewMenu(!showNewMenu);
    }

    const onNewFile = () => {
        onMenuEvent({type: ContextMenuEventType.NewFile});
    }

    const onNewFolder = () => {
        onMenuEvent({type: ContextMenuEventType.NewFolder});
    }

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
        </ul>
    );
}

export default TreeExplorerMenu;