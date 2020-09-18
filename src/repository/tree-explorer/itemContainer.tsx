import React, { useEffect, useRef, useState } from 'react';
import { VelocityComponent } from "velocity-react";
import ContextMenu from "./context-menu/ContextMenu";
import ItemMenu from "./itemMenu";

type ContainerProps = {
    customStyles: any,
    style: any,
    decorators: any,
    terminal: any,
    onClick: any,
    onSelect: any,
    animations: any,
    node: any,
    parent: any
};

const ItemContainer = ({customStyles, style, decorators, terminal, onSelect, onClick, animations, node, parent}: ContainerProps) => {
    const [currentNode, setCurrentNode] = useState(node);
    const divRef = useRef(null);

    const renderToggle = () => {
        if (!animations) {
            return renderToggleDecorator();
        }

        return (
            <VelocityComponent animation={animations.toggle.animation} duration={animations.toggle.duration}>
                {renderToggleDecorator()}
            </VelocityComponent>
        );
    }

    const renderToggleDecorator = () => {
        return <decorators.Toggle style={style.toggle} onClick={onClick}/>;
    }

    useEffect(() => {
        // console.log(parent);
    }, [])

    return (
        <>
            <div ref={divRef!} style={currentNode.active ? {...style.container} : {...style.link}} onClick={onClick}>
                {!terminal ? renderToggle() : null}
                <decorators.Header node={currentNode} style={style.header} customStyles={customStyles}
                                   onSelect={onSelect}/>
            </div>
            <ContextMenu menu={<ItemMenu node={currentNode} setCurrentNode={setCurrentNode}/>}
                         domElementRef={divRef!}/>
        </>
    );

}

export default ItemContainer;