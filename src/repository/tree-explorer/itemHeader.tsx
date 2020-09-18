import { faFileAlt, faFolder } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useRef } from "react";

type HeaderProps = {
    onSelect: () => void,
    node: any,
    style: any,
    customStyles: any
}

const ItemHeader = ({onSelect, style, customStyles, node}: HeaderProps) => {
    const iconType = node.children ? faFolder : faFileAlt;
    const iconStyle = {marginRight: '5px'};
    const divRef = useRef(null);

    return (
        <>
            <div style={style.base} onClick={onSelect}>
                <div ref={divRef} style={node.selected ? {...style.title, ...customStyles.header.title} : style.title}>
                    <FontAwesomeIcon icon={iconType} style={iconStyle}/>
                    {node.name}
                </div>
            </div>
        </>
    );
}

export default ItemHeader;