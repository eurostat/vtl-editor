import React, {Component} from 'react';
import shallowEqual from 'shallowequal';
import deepEqual from 'deep-equal';

type NodeHeaderProps = {
    style: any
    customStyles?: any,
    decorators: any,
    animations: object | boolean,
    node: any
    parent: any
    onClick?: any,
    onSelect?: any
}


class NodeHeader extends Component<NodeHeaderProps> {
    public static defaultProps = {
        customStyles: {}
    };
    shouldComponentUpdate(nextProps: NodeHeaderProps) {
        const props: NodeHeaderProps = this.props;
        const nextPropKeys = Object.keys(nextProps);

        for (let i = 0; i < nextPropKeys.length; i++) {
            const key:string = nextPropKeys[i];
            if (key === 'animations') {
                continue;
            }

            // @ts-ignore
            const isEqual = shallowEqual(props[key], nextProps[key]);
            if (!isEqual) {
                return true;
            }
        }

        return !deepEqual(props.animations, nextProps.animations, {strict: true});
    }

    render() {
        const {
            animations, decorators, node, parent, onClick, style, onSelect, customStyles
        } = this.props;
        const {active, children} = node;
        const terminal = !children;
        let styles;
        if (active) {
            styles = Object.assign(style, {container: {...style.link, ...style.activeLink}});
        } else {
            styles = style;
        }
        return (
            <decorators.Container
                animations={animations}
                decorators={decorators}
                parent={parent}
                node={node}
                onClick={onClick}
                customStyles={customStyles}
                onSelect={onSelect}
                terminal={terminal}
                style={styles}
            />
        );
    }
}

export default NodeHeader;
