import React from 'react';
import PropTypes from 'prop-types';

import defaultTheme from '../themes/default';
import defaultAnimations from '../themes/animations';
import {randomString} from '../util';
import {Ul} from './common';
import defaultDecorators from './Decorators';
import TreeNode from './TreeNode';

type TreeBeardProps = {
    style?: any,
    customStyles?: any,
    data: any,
    animations?: any,
    onToggle?: any,
    onSelect?: any,
    decorators?: any
}

const TreeBeard = ({
                       animations, decorators, data, onToggle, style, onSelect, customStyles
                   }: TreeBeardProps) => (

    <Ul style={{...defaultTheme.tree.base, ...style.tree.base}}>
        {[data].map(node => (
            <TreeNode
                decorators={decorators}
                node={node}
                parent={undefined}
                onToggle={onToggle}
                animations={animations}
                onSelect={onSelect}
                customStyles={customStyles}
                key={node.id || randomString()}
                style={{...defaultTheme.tree.node, ...style.tree.node}}
            />
        ))}
    </Ul>
);

TreeBeard.defaultProps = {
    style: defaultTheme,
    animations: defaultAnimations,
    decorators: defaultDecorators,
    customStyles: {}
} as Partial<TreeBeardProps>;

export default TreeBeard;
