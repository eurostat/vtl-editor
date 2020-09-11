import React from 'react';

import {Div} from '../common';

type HeaderProps ={
    onSelect?: any,
    style?: any,
    customStyles?: any,
    node: any
}

const Header = ({onSelect, node, style, customStyles}:HeaderProps) => (
    <div style={style.base} onClick={onSelect}>
        <Div style={node.selected ? {...style.title, ...customStyles.header.title} : style.title}>
            {node.name}
        </Div>
    </div>
);

Header.defaultProps = {
    customStyles: {}
};

export default Header;
