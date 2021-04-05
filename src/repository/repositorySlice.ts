import {TreeNode} from "react-treebeard";
import {NodeType} from "./tree-explorer/nodeType";

export interface TreePayload {
    type: NodeType,
    nodes: TreeNode[],
}

export function addNodes(payload: TreeNode[], state: TreeNode[]): TreeNode[] {
    let replacements: (string | undefined)[] = payload.map((item) => item.id);
    let existing = state.filter((item) => !replacements.includes(item.id));
    existing.push(...payload);
    return existing;
}

export function addNode(payload: TreeNode, state: TreeNode[]): TreeNode[] {
    let replacements = state.filter((item) => item.id !== payload.id);
    replacements.push(payload);
    return replacements;
}

export function deactivateNodes(state: TreeNode[]): TreeNode[] {
    state.forEach((item) => item.active = false);
    return state;
}

export function replaceNode(payload: TreeNode, state: TreeNode[]): TreeNode[] {
    const active = payload.active;
    return state.map((item) => {
        if (item.id === payload.id) return payload;
        if (active) item.active = false;
        return item;
    });
}

export function updateNode(payload: TreeNode, state: TreeNode[]): TreeNode[] {
    const active = payload.active;
    return state.map((item) => {
        if (item.id === payload.id) return Object.assign({}, item, payload);
        if (active) item.active = false;
        return item;
    });
}

export function deleteNode(payload: TreeNode, state: TreeNode[]): TreeNode[] {
    return state.filter((item) => item.id !== payload.id);
}