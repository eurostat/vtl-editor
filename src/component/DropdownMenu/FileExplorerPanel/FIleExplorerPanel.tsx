import React, {useEffect, useState} from "react";
import {Treebeard, TreeNode, decorators, animations} from 'react-treebeard-ts';
import "./fileExplorer.scss";
import Header from "./Header";

const files = {
    name: 'root',
    toggled: true,
    children: [
        {
            name: 'parent',
            children: [
                {name: 'child1'},
                {name: 'child2'}
            ]
        },
        {
            name: 'loading parent',
            loading: true,
            children: []
        },
        {
            name: 'parent',
            children: [
                {
                    name: 'nested parent',
                    children: [
                        {name: 'nested child 1'},
                        {name: 'nested child 2'}
                    ]
                }
            ]
        }
    ]
};

const FileExplorerPanel = () => {
    const [data, setData] = useState<TreeNode | Array<TreeNode>>(files);
    const [cursor, setCursor] = useState<TreeNode | undefined>(undefined);

    useEffect(() => {
        const elementById = document.getElementById("file-explorer");
        // document.addEventListener("click", handleClick);
        elementById?.addEventListener("contextmenu", (e) => {
            e.preventDefault();
           // console.log("container event", e);
        });
        return () => {
            //document.addEventListener("click", handleClick);
            elementById?.removeEventListener("contextmenu", (e) => e.preventDefault());
        };
    });

    const onToggle = (node: TreeNode, toggled: boolean) => {
        if (cursor) {
            cursor.active = false;
        }
        node.active = true;
        if (node.children) {
            node.toggled = toggled;
        }
        setCursor(node);
        setData(Object.assign({}, data))
    }
    return (
        <div id="file-explorer" className="file-explorer-container">
            <Treebeard data={data} onToggle={onToggle} decorators={{...decorators, Header}} animations={animations}/>
        </div>
    )
}


export default FileExplorerPanel;