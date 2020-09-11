import React, {useEffect, useState} from "react";
import {TreeNode, decorators, animations, theme, TreeTheme} from 'react-treebeard-ts';
import TreeBeard from "./tree-beard/components";
import "./fileExplorer.scss";
import CustomHeader from "./CustomHeader";
import CustomContainer from "./CustomContainer";
//
// id:string
// owner: string;
// creator: string;
// modifiedOn: Date;
// createdOn: Date;
// size: string;
// version: string;


const files = {
    name: 'root',
    owner: "owner1",
    creator: "26/10/2020 15:34",
    modifiedOn: "26/10/2020 15:34",
    createdOn: "26/10/2020 15:34",
    size: "15KB",
    version: "1.01",
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
                        {
                            name: 'nested child 1', owner: "owner1",
                            creator: "26/10/2020 15:34",
                            modifiedOn: "26/10/2020 15:34",
                            createdOn: "26/10/2020 15:34",
                            size: "15KB",
                            version: "1.01",
                        },
                        {
                            name: 'nested child 1', owner: "owner1",
                            creator: "26/10/2020 15:34",
                            modifiedOn: "26/10/2020 15:34",
                            createdOn: "26/10/2020 15:34",
                            size: "15KB",
                            version: "1.01",
                        },
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
    }, []);

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
            <TreeBeard style={updatedStyle()} data={data} onToggle={onToggle}
                       decorators={{...decorators, Header: CustomHeader, Container: CustomContainer}}
                       animations={animations}/>
        </div>
    )
}


export default FileExplorerPanel;