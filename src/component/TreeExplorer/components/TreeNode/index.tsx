import React, {PureComponent} from 'react';
import styled from '@emotion/styled';
import defaultAnimations from '../../themes/animations';
import {randomString} from '../../util';
import {Ul} from '../common';
import NodeHeader from '../NodeHeader';
import Drawer from './Drawer';
import Loading from './Loading';

// @ts-ignore
const Li = styled('li', {shouldForwardProp: prop => ['className', 'children', 'ref'].indexOf(prop) !== -1})(({style}) => style);

type TreeNodeProps = {
    onSelect?: (node:any) => void,
    onToggle?: any,
    style: any,
    customStyles?: any,
    node: any,
    parent: any,
    decorators: any,
    animations: any
}

class TreeNode extends PureComponent<TreeNodeProps> {

    public static defaultProps = {
        customStyles: {}
    };

    onClick() {
        const {node, onToggle} = this.props;
        if (onToggle) {
            onToggle(node, !node.toggled);
        }
    }

    animations() {
        const {animations, node} = this.props;
        if (!animations) {
            return {
                toggle: defaultAnimations.toggle(this.props, 0)
            };
        }
        const animation = Object.assign({}, animations, node.animations);
        return {
            toggle: animation.toggle(this.props),
            drawer: animation.drawer(this.props)
        };
    }

    decorators() {
        const {decorators, node} = this.props;
        let nodeDecorators = node.decorators || {};

        return Object.assign({}, decorators, nodeDecorators);
    }

    renderChildren(decorators: any) {
        const {
            animations, decorators: propDecorators, node, style, onToggle, onSelect, customStyles
        } = this.props;

        if (node.loading) {
            return (
                <Loading decorators={decorators} style={style}/>
            );
        }

        let children = node.children;
        if (!Array.isArray(children)) {
            children = children ? [children] : [];
        }

        return (
            <Ul style={style.subtree}>
                {children.map((child: any) => (
                    <TreeNode
                        onSelect={onSelect}
                        onToggle={onToggle}
                        animations={animations}
                        style={style}
                        customStyles={customStyles}
                        decorators={propDecorators}
                        key={child.id || randomString()}
                        node={child}
                        parent={node}
                    />
                ))}
            </Ul>
        );
    }

    render() {
        const {
            node, style, onSelect, customStyles, parent
        } = this.props;
        const decorators = this.decorators();
        const animations = this.animations();
        const {...restAnimationInfo} = animations.drawer;
        return (
            <Li style={style.base}>
                <NodeHeader
                    decorators={decorators}
                    animations={animations}
                    node={node}
                    parent={parent}
                    style={style}
                    customStyles={customStyles}
                    onClick={() => this.onClick()}
                    onSelect={onSelect ? (() => onSelect(node)) : undefined}
                />
                <Drawer restAnimationInfo={{...restAnimationInfo}}>
                    {node.toggled ? this.renderChildren(decorators) : null}
                </Drawer>
            </Li>
        );
    }
}


export default TreeNode;
