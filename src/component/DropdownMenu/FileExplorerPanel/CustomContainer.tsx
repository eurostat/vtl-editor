import React, {useEffect, useRef, useState} from 'react';
import ContextMenu from "../../ContextMenu/ContextMenu";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretRight} from "@fortawesome/free-solid-svg-icons";
import {DataStructure} from "../../../models/api/DataStructure";
import {decisionModal} from "../../DecisionModal";
import {setSdmxStorageValue} from "../../../utility/localStorage";

type ContainerProps = {
    customStyles: any,
    style: any,
    decorators: any,
    terminal: any,
    onClick: any,
    onSelect: any,
    animations: any,
    node: any,
};


const CustomContainer = ({customStyles, style, decorators, terminal, onSelect, onClick, animations, node}: ContainerProps) => {
    const divRef = useRef(null);

    const renderToggleDecorator = () => {
        return <decorators.Toggle style={style.toggle} onClick={onClick}/>;
    }


    return (
        <>
            <div ref={divRef!} style={node.active ? {...style.container} : {...style.link}} onClick={onClick}>
                {!terminal ? renderToggleDecorator() : null}
                <decorators.Header node={node} style={style.header} customStyles={customStyles} onSelect={onSelect}/>
            </div>
            <ContextMenu menu={<CustomMenu node={node}/>} domElementRef={divRef!}/>
        </>
    );

}
type CustomMenuType = {
    node: any
}

const CustomMenu = ({node}: CustomMenuType) => {
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
export default CustomContainer;