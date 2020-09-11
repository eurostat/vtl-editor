import React, {useEffect, useRef, useState} from 'react';
import ContextMenu from "./context-menu/ContextMenu";
import CustomMenu from "./CustomMenu";

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


const CustomContainer = ({customStyles, style, decorators, terminal, onSelect, onClick, animations, node, parent}: ContainerProps) => {
    const [currentNode, setCurrentNode] = useState(node);
    const [name, setName] = useState(node.name);
    const divRef = useRef(null);

    const renderToggleDecorator = () => {
        return <decorators.Toggle style={style.toggle} onClick={onClick}/>;
    }

    useEffect(() => {
       // console.log(parent);
    }, [])

    return (
        <>
            <div ref={divRef!} style={currentNode.active ? {...style.container} : {...style.link}} onClick={onClick}>
                {!terminal ? renderToggleDecorator() : null}
                <decorators.Header node={currentNode} style={style.header} customStyles={customStyles}
                                   onSelect={onSelect}/>
            </div>
            <ContextMenu menu={<CustomMenu node={currentNode} setCurrentNode={setCurrentNode}/>}
                         domElementRef={divRef!}/>
        </>
    );

}

export default CustomContainer;