import { TreeNode } from "react-treebeard";

export enum NodeType {
    FOLDER = "F",
    FILE = "f",
    DOMAIN = "D",
    SCRIPT = "s",
    CONTAINER = "Cs",
    BINNED = "b",
}

export function isDomain(node: TreeNode) {
    return !!node.type && node.type === NodeType.DOMAIN;
}

export function isContainer(node: TreeNode) {
    return !!node.type && node.type === NodeType.CONTAINER;
}

export function isScript(node: TreeNode) {
    return !!node.type && node.type === NodeType.SCRIPT;
}

export function isBinned(node: TreeNode) {
    return !!node.type && node.type === NodeType.BINNED;
}