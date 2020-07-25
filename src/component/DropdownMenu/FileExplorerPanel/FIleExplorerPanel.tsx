import React, {useEffect, useState} from "react";
import {Treebeard, TreeNode, decorators, animations, theme, TreeTheme} from 'react-treebeard-ts';
import "./fileExplorer.scss";
import CustomHeader from "./CustomHeader";
import CustomContainer from "./CustomContainer";

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
                        {name: 'nested child 1'},
                        {name: 'nested child 1'},
                        {name: 'nested child 1'},
                        {name: 'nested child 1'},
                        {name: 'nested child 1'},
                        {name: 'nested child 1'},
                        {name: 'nested child 1'},
                        {name: 'nested child 1'},
                        {name: 'nested child 1'},
                        {name: 'nested child 1'},
                        {name: 'nested child 1'},
                        {name: 'nested child 1'},
                        {name: 'nested child 1'},
                        {name: 'nested child 1'},
                        {name: 'nested child 1'},
                        {name: 'nested child 1'},
                        {name: 'nested child 1'},
                        {name: 'nested child 1'},
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
        console.log("file explorer usefefect");
    })

    useEffect(() => {
        const elementById = document.getElementById("file-explorer");
        elementById?.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });
        return () => {
            elementById?.removeEventListener("contextmenu", (e) => e.preventDefault());
        };
    },[]);

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

    const updatedStyle = () => {
        const newTheme: TreeTheme = Object.assign(theme, {});
        newTheme.tree.base.backgroundColor = "transparent";
        return newTheme;
    }

    return (
        <div id="file-explorer" className="file-explorer-container">
            <Treebeard style={updatedStyle()} data={data} onToggle={onToggle}
                       decorators={{...decorators, Header: CustomHeader, Container: CustomContainer}} animations={animations}/>
        </div>
    )
}


export default FileExplorerPanel;