import React, {useEffect, useRef, useState} from 'react';
import ContextMenu from "../../ContextMenu/ContextMenu";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCaretRight} from "@fortawesome/free-solid-svg-icons";

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
            {/*<ContextMenu menu={<CustomMenu/>} domElementRef={divRef!}/>*/}
        </>
    );

}
const CustomMenu = () => {
    const [showSortMenu, setShowSortMenu] = useState(false);
    return (
        <ul className="menu">
            <li onClick={() => console.log("test")}>Open</li>
            <li>Delete</li>
            <li>Copy</li>
            <li>Share</li>
            <li>Rename</li>
            <hr/>
            <li>View versions</li>
            <hr/>
            <li>Show file list</li>
            <hr/>
            <li>Move up</li>
            <li>Move down</li>
            <li className="with-submenu" onClick={(e) => {
                e.preventDefault();
                setShowSortMenu(!showSortMenu);
            }}>
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