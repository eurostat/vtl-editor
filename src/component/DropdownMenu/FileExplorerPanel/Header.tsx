import React, {useEffect, useRef} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileAlt, faFolder} from "@fortawesome/free-solid-svg-icons";
import ContextMenu from "../../ContextMenu/ContextMenu";

type HeaderProps = {
    onSelect: () => void,
    node: any,
    style: any,
    customStyles: any
}

const Header = ({onSelect, style, customStyles, node}: HeaderProps) => {
    const iconType = node.children ? faFolder : faFileAlt;
    const iconStyle = {marginRight: '5px'};
    const divRef = useRef(null);

    useEffect(() => {
        //console.log(node.name, divRef);
    })


    return (
        <>
            <div style={style.base} onClick={onSelect}>
                <div ref={divRef} style={node.selected ? {...style.title, ...customStyles.header.title} : style.title}>
                    <FontAwesomeIcon icon={iconType} style={iconStyle}/>
                    {node.name}
                </div>
            </div>
            {/*<ContextMenu menu={<CustomMenu/>} domElementRef={divRef!}/>*/}
        </>
    );
}
const CustomMenu = () => (
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
        <li className="with-submenu" >
            Sort
            <ul className="submenu">
                <li>Name</li>
                <li>Date</li>
                <li>Custom</li>
            </ul>
        </li>
    </ul>
);
export default Header;