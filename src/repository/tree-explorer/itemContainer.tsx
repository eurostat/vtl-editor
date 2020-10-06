import React, { useRef } from 'react';
import { VelocityComponent } from "velocity-react";
import ContextMenu from "./context-menu/ContextMenu";
import ItemMenu from "./itemMenu";
import { ContextMenuEvent } from "./treeExplorerService";

type ItemContainerProps = {
    customStyles: any,
    style: any,
    decorators: any,
    terminal: any,
    onClick: any,
    onSelect: any,
    animations: any,
    node: any,
    parent: any,
    onMenuEvent?: (event: ContextMenuEvent) => any
};

const ItemContainer = ({
                           customStyles, style, decorators, terminal,
                           onSelect, onClick, animations, node, parent, onMenuEvent
                       }: ItemContainerProps) => {
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

    return (
        <>
            <div ref={divRef!} style={node.active ? {...style.container} : {...style.link}} onClick={onSelect}>
                {!terminal ? renderToggle() : null}
                <decorators.Header node={node} style={style.header} customStyles={customStyles}/>
            </div>
            <ContextMenu menu={<ItemMenu node={node} onMenuEvent={onMenuEvent}/>}
                         domElementRef={divRef!}/>
        </>
    );

}

export default ItemContainer;