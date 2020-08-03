import React, {useState} from "react";
import {decisionModal} from "../../DecisionModal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretRight} from "@fortawesome/free-solid-svg-icons";

type CustomMenuType = {
    node: any,
    setCurrentNode: (node: any) => void
}

const CustomMenu = ({node, setCurrentNode}: CustomMenuType) => {
    const [showSortMenu, setShowSortMenu] = useState(false);

    const onDeleteClick = () => {
        const decision = async () => {
            const res = await decisionModal({
                title: "Warning!",
                text:
                    `Do you really want to delete this ${node.children ? "folder" : "file"}?`
            });
            if (res === "yes") {
                alert("TODO");
            }
        }
        decision()
    }

    const subMenuOperation = (event: any) => {
        event.preventDefault();
        setShowSortMenu(!showSortMenu);
    }

    const onRename = () => {
        node.name = "TODO";
        setCurrentNode((prev: any) => {
            return {...prev, name: "TODO"}
        });
    }

    return (
        <ul className="menu">
            <li onClick={() => console.log("test")}>Open</li>
            <li onClick={onDeleteClick}>Delete</li>
            <li>Copy</li>
            <li>Share</li>
            <li onClick={onRename}>Rename</li>
            <hr/>
            <li>View versions</li>
            <hr/>
            <li>Show file list</li>
            <hr/>
            <li>Move up</li>
            <li>Move down</li>
            <li className="with-submenu" onClick={subMenuOperation}>
                <span>Sort</span>
                <div className="position-right">
                    <FontAwesomeIcon icon={faCaretRight}/>
                </div>
                <ul className={showSortMenu ? "submenu visible-menu" : "submenu hide-menu"}>
                    <li>Name</li>
                    <li>Date</li>
                    <li>Custom</li>
                </ul>
            </li>
        </ul>
    );
}


export default CustomMenu;