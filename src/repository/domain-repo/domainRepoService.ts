import {TreeNode} from "react-treebeard";
import {sendDeleteRequest, sendGetRequest, sendPutRequest} from "../../web-api/apiService";
import {StoredItemTransfer} from "../entity/storedItemTransfer";
import {NodeType} from "../tree-explorer/nodeType";
import {buildContainerBase} from "../repositoryService";
import {EditorFile} from "../../editor/editorFile";
import {ScriptContentPayload} from "../entity/scriptContentPayload";
import {StoredItemType} from "../entity/storedItemType";

const BASE_URL = process.env.REACT_APP_API_URL;
const REPO_URL = BASE_URL + "/repo/domains";

export interface DomainRepoContainer {
    name: string
    childType: NodeType
}

export const domainRepoContainers: DomainRepoContainer[] = [{name: "Scripts", childType: NodeType.SCRIPT},
    {name: "Recycle Bin", childType: NodeType.BINNED}];

export async function fetchDomainRepository() {
    const response = await sendGetRequest(REPO_URL);
    if (response && response.data)
        return response.data.domains
            .map((domain: StoredItemTransfer) => buildDomainNode(domain)) as TreeNode[];
    return Promise.reject();
}

export async function fetchDomainScripts(domain: TreeNode) {
    if (domain.entity && domain.entity.id) {
        const response = await sendGetRequest(`${REPO_URL}/${domain.entity.id}/files`);
        if (response && response.data)
            return response.data
                .map((script: StoredItemTransfer) => buildScriptNode(script, domain.id));
    }
    return Promise.reject();
}

export async function fetchDomainBinned(domain: TreeNode) {
    if (domain.entity && domain.entity.id) {
        const response = await sendGetRequest(`${REPO_URL}/${domain.entity.id}/bin/files`);
        if (response && response.data)
            return response.data
                .map((script: StoredItemTransfer) => buildBinnedNode(script, domain.id));
    }
    return Promise.reject();
}

export async function fetchScriptContent(script: TreeNode) {
    if (script.entity && script.entity.id && script.entity.parentId) {
        const response =
            await sendGetRequest(`${REPO_URL}/${script.entity.parentId}/files/${script.entity.id}/content`);
        if (response && response.data) {
            const content = atob(response.data.content);
            if (content !== undefined) return content;
        }
    }
    return Promise.reject();
}

export async function fetchScript(node: TreeNode) {
    if (node.entity && node.entity.id && node.entity.parentId) {
        const item: StoredItemTransfer = node.entity;
        const response =
            await sendGetRequest(`${REPO_URL}/${item.parentId}/files/${item.id}`);
        if (response && response.data) return response.data as StoredItemTransfer;
    }
    return Promise.reject();
}

export async function updateScriptContent(file: EditorFile) {
    const payload = {
        optLock: file.optLock,
        content: btoa(file.content)
    } as ScriptContentPayload;
    return sendPutRequest(`${REPO_URL}/${file.parentId}/files/${file.id}/content`, payload, "application/json");
}

export async function deleteDomainItem(node: TreeNode) {
    if (node.entity && node.entity.id && node.entity.type && node.entity.parentId) {
        const item: StoredItemTransfer = node.entity;
        return item.type === StoredItemType.FILE
            ? sendDeleteRequest(`${REPO_URL}/${item.parentId}/files/${item.id}`,
                {optLock: item.optLock}, "application/json")
            : Promise.reject();
    }
}

export const buildDomainNode = (domain: StoredItemTransfer) => {
    const node = buildContainerBase();
    node.name = domain.name;
    node.id = domain.id.toString();
    node.type = NodeType.DOMAIN;
    node.entity = domain;
    return node;
}

export const buildContainerNode = (name: string, parent: TreeNode, childType: NodeType) => {
    const node = buildContainerBase();
    node.name = name;
    node.id = parent.id + childType;
    node.type = NodeType.CONTAINER;
    node.entity = parent.entity;
    node.parentId = parent.id;
    node.childType = childType;
    node.loading = false;
    return node;
}

export const buildScriptNode = (script: StoredItemTransfer, parentId: string) => {
    return {
        name: script.name,
        id: script.id.toString(),
        type: NodeType.SCRIPT,
        parentId: parentId,
        entity: script,
        toggled: false,
    } as TreeNode;
}

export const buildBinnedNode = (binned: StoredItemTransfer, parentId: string) => {
    return {
        name: binned.name,
        id: binned.id.toString(),
        type: NodeType.BINNED,
        parentId: parentId,
        entity: binned,
        toggled: false,
    } as TreeNode;
}