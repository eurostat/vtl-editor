import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFolder, faFileAlt} from "@fortawesome/free-solid-svg-icons";

type HeaderProps = {
    onSelect: () => void,
    node: any,
    style: any,
    customStyles: any
}

const Header = ({onSelect, style, customStyles, node}: HeaderProps) => {
    const iconType = node.children ? faFolder : faFileAlt;
    const iconStyle = {marginRight: '5px'};
    return (
        <div style={style.base} onClick={onSelect}>
            <div style={node.selected ? {...style.title, ...customStyles.header.title} : style.title}>
                <FontAwesomeIcon icon={iconType} style={iconStyle}/>
                {node.name}
            </div>
        </div>
    );
}

export default Header;