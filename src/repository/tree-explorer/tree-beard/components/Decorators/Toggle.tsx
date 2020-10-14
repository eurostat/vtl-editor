import React from 'react';
import styled from '@emotion/styled';

import {Div} from '../common';

// @ts-ignore
const Polygon = styled('polygon', {shouldForwardProp: prop => ['className', 'children', 'points'].indexOf(prop) !== -1})((({style}) => style));

type ToggleProps = {
    onClick: any,
    style?: any
}

const Toggle = ({style, onClick}: ToggleProps) => {
    const {height, width} = style;
    const midHeight = height * 0.5;
    const points = `0,0 0,${height} ${width},${midHeight}`;

    return (
        <div style={style.base} onClick={onClick}>
            <Div style={style.wrapper}>
                <svg {...{height, width}}>
                    <Polygon points={points} style={style.arrow}/>
                </svg>
            </Div>
        </div>
    );
};

export default Toggle;
