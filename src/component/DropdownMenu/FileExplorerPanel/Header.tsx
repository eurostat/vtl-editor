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
                <div ref={divRef}  style={node.selected ? {...style.title, ...customStyles.header.title} : style.title}>
                    <FontAwesomeIcon icon={iconType} style={iconStyle}/>
                    {node.name}
                </div>
            </div>
            <ContextMenu menu={<CustomMenu/>} domElementRef={divRef!}/>
        </>
    );
}
const CustomMenu = () => (
    <ul className="menu">
        <li>Login</li>
        <li>Register</li>
        <li>Open Profile</li>
    </ul>
);
export default Header;