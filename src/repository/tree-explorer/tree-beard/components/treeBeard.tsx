import React from 'react';
import defaultAnimations from '../themes/animations';

import defaultTheme from '../themes/default';
import { randomString } from '../util';
import { Ul } from './common';
import defaultDecorators from './Decorators';
import TreeNode from './TreeNode/treeNode';

type TreeBeardProps = {
    data: any[],
    style?: any,
    customStyles?: any,
    animations?: any,
    decorators?: any,
    onToggle?: any,
    onSelect?: any,
    onMenuEvent?: any
}

const TreeBeard = ({
                       animations, decorators, data, onToggle, style, onSelect, customStyles, onMenuEvent
                   }: TreeBeardProps) => (

    <Ul style={{...defaultTheme.tree.base, ...style.tree.base}}>
        {data.map(node => (
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
                onMenuEvent={onMenuEvent}
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
