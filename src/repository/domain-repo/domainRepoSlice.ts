import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { TreeNode } from "react-treebeard";
import { RootState } from "../../utility/store";
import { NodeType } from "../tree-explorer/nodeType";
import {addNode, addNodes, deactivateNodes, deleteNode, replaceNode, TreePayload, updateNode} from "../repositorySlice";

export interface DomainRepoState {
    domains: TreeNode[]
    containers: TreeNode[]
    scripts: TreeNode[]
    binneds: TreeNode[]
    loaded: boolean
    detailedFolder: TreeNode | undefined
    versionedScript: TreeNode | undefined
}

const initialState = {
    domains: [],
    containers: [],
    scripts: [],
    binneds: [],
    loaded: false,
    detailedFolder: undefined,
    versionedScript: undefined
} as DomainRepoState;

export const domainRepoSlice = createSlice({
    name: "domainRepo",
    initialState: initialState,
    reducers: {
        clearDomainRepoTree(state) {
            state = initialState;
        },
        addToDomainRepoTree(state, action: PayloadAction<TreePayload>) {
            const nodes = action.payload.nodes;
            if (nodes.length === 0) return;
            state.loaded = true;
            switch (action.payload.type) {
                case NodeType.DOMAIN: {
                    state.domains = addNodes(nodes, state.domains);
                    return;
                }
                case NodeType.CONTAINER: {
                    state.containers = addNodes(nodes, state.containers);
                    return;
                }
                case NodeType.SCRIPT: {
                    state.scripts = addNodes(nodes, state.scripts);
                    return;
                }
                case NodeType.BINNED: {
                    state.binneds = addNodes(nodes, state.binneds);
                    return;
                }
            }
        },
        addDomainRepoNode(state, action: PayloadAction<TreeNode>) {
            const node = action.payload;
            state.loaded = true;
            switch (node.type) {
                case NodeType.DOMAIN: {
                    state.domains = addNode(node, state.domains);
                    return;
                }
                case NodeType.CONTAINER: {
                    state.containers = addNode(node, state.containers);
                    return;
                }
                case NodeType.SCRIPT: {
                    state.scripts = addNode(node, state.scripts);
                    return;
                }
                case NodeType.BINNED: {
                    state.binneds = addNode(node, state.binneds);
                    return;
                }
            }
        },
        replaceDomainRepoNode(state, action: PayloadAction<TreeNode>) {
            const node = action.payload;
            if (node.active) state = deactivateAllNodes(state);
            switch (node.type) {
                case NodeType.DOMAIN: {
                    state.domains = replaceNode(node, state.domains);
                    return;
                }
                case NodeType.CONTAINER: {
                    state.containers = replaceNode(node, state.containers);
                    return;
                }
                case NodeType.SCRIPT: {
                    state.scripts = replaceNode(node, state.scripts);
                    return;
                }
                case NodeType.BINNED: {
                    state.binneds = replaceNode(node, state.binneds);
                    return;
                }
            }
        },
        updateDomainRepoNode(state, action: PayloadAction<any>) {
            const node = action.payload;
            if (node.active) state = deactivateAllNodes(state);
            switch (node.type) {
                case NodeType.DOMAIN: {
                    state.domains = updateNode(node, state.domains);
                    return;
                }
                case NodeType.CONTAINER: {
                    state.containers = updateNode(node, state.containers);
                    return;
                }
                case NodeType.SCRIPT: {
                    state.scripts = updateNode(node, state.scripts);
                    return;
                }
                case NodeType.BINNED: {
                    state.binneds = updateNode(node, state.binneds);
                    return;
                }
            }
        },
        deleteDomainRepoNode(state, action: PayloadAction<TreeNode>) {
            const node = action.payload;
            switch (node.type) {
                case NodeType.SCRIPT: {
                    state.scripts = deleteNode(node, state.scripts);
                    return;
                }
                case NodeType.BINNED: {
                    state.binneds = deleteNode(node, state.binneds);
                    return;
                }
            }
        },
        detailDomainFolder(state, action: PayloadAction<TreeNode | undefined>) {
            state.detailedFolder = action.payload
        },
        versionDomainScript(state, action: PayloadAction<TreeNode | undefined>) {
            state.versionedScript = action.payload
        },
    }
})

function deactivateAllNodes(state: DomainRepoState): DomainRepoState {
    state.domains = deactivateNodes(state.domains);
    state.containers = deactivateNodes(state.containers);
    state.scripts = deactivateNodes(state.scripts);
    state.binneds = deactivateNodes(state.binneds);
    return state;
}

export const {
    clearDomainRepoTree, addToDomainRepoTree,
    addDomainRepoNode, replaceDomainRepoNode, updateDomainRepoNode, deleteDomainRepoNode,
    detailDomainFolder, versionDomainScript
} = domainRepoSlice.actions;

export const domainRepoTree = (state: RootState) => {
    const stateDomains = state.domainRepo.domains
        .map((domain) => _.merge(_.cloneDeep(domain), {children: [] as TreeNode[]}));
    const stateContainers = state.domainRepo.containers
        .map((container) => _.merge(_.cloneDeep(container), {children: [] as TreeNode[]}));
    const stateScripts = state.domainRepo.scripts
        .map((script) => _.cloneDeep(script));
    const stateBinned = state.domainRepo.binneds
        .map((binned) => _.cloneDeep(binned));
    stateDomains.forEach((domain) => {
        const containers = stateContainers.filter((container) => container.parentId === domain.id);
        containers.forEach((container) => {
            const scripts = stateScripts.filter((script) => container.childType === NodeType.SCRIPT && script.parentId === domain.id);
            const binneds = stateBinned.filter((binned) => container.childType === NodeType.BINNED && binned.parentId === domain.id);
            container.children.push(...scripts, ...binneds);
        })
        domain.children.push(...containers);
    });
    return stateDomains;
}

const folderPath = (state: RootState, folder: TreeNode | undefined) => {
    let path: string = "/";
    if (folder && folder.parentId) {
        const parent = state.domainRepo.domains.find(domain => domain.id === folder.parentId);
        if (parent) {
            path = path + parent.name + "/";
        }
        path = path + folder.name;
    }
    return path;
}

export const domainRepoLoaded = (state: RootState) => state.domainRepo.loaded;
export const domainDetailedFolder = (state: RootState) => state.domainRepo.detailedFolder;
export const domainDetailedFolderPath = (state: RootState) =>  folderPath(state, state.domainRepo.detailedFolder);
export const domainVersionedScript = (state: RootState) => state.domainRepo.versionedScript;

export default domainRepoSlice.reducer;