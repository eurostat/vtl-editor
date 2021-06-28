import {TreeNode} from "react-treebeard";
import {sendDeleteRequest, sendGetRequest, sendPutRequest} from "../../web-api/apiService";
import {StoredItemTransfer} from "../entity/storedItemTransfer";
import {NodeType} from "../tree-explorer/nodeType";
import {buildContainerBase} from "../repositoryService";
import {EditorFile} from "../../editor/editorFile";
import {ScriptContentPayload} from "../entity/scriptContentPayload";
import {StoredItemType} from "../entity/storedItemType";
import {IncrementVersionPayload} from "../entity/incrementVersionPayload";
import {ROLE_MANAGER} from "../../control/authorized";

const BASE_URL = process.env.REACT_APP_API_URL;
const REPO_URL = BASE_URL + "/repo/domains";

export interface DomainRepoContainer {
    name: string
    childType: NodeType
    role?: string
}

export const domainRepoContainers: DomainRepoContainer[] = [{name: "Scripts", childType: NodeType.SCRIPT,},
    {name: "Recycle Bin", childType: NodeType.BINNED, role: ROLE_MANAGER}];

export async function fetchDomainRepository() {
    const response = await sendGetRequest(REPO_URL);
    if (response && response.data)
        return response.data.domains
            .map((domain: StoredItemTransfer) => buildDomainNode(domain)) as TreeNode[];
    return Promise.reject();
}

export async function fetchDomainScripts(domain: TreeNode) {
    if (domain.entity && domain.entity.id) {
        try {
            const response = await sendGetRequest(`${REPO_URL}/${domain.entity.id}/files`);
            if (response && response.data) {
                return response.data.map((script: StoredItemTransfer) => buildScriptNode(script, domain.id)) as TreeNode[];
            }
       } catch (response) {
            return Promise.reject(response.error)
        }
    }
    return Promise.reject();
}

export async function fetchDomainBinned(domain: TreeNode) {
    if (domain.entity && domain.entity.id) {
        try {
            const response = await sendGetRequest(`${REPO_URL}/${domain.entity.id}/bin/files`);
            if (response && response.data) {
                return response.data.map((script: StoredItemTransfer) => buildBinnedNode(script, domain.id)) as TreeNode[];
            }
        } catch (response) {
            if (response && response.status === 403) return [] as TreeNode[];
            return Promise.reject(response.error)
        }
    }
    return Promise.reject();
}

export async function fetchScript(script: StoredItemTransfer) {
    if (script.id && script.parentId) {
        try {
            const response = await sendGetRequest(`${REPO_URL}/${script.parentId}/files/${script.id}`);
            if (response && response.data) return response.data as StoredItemTransfer;
        } catch (response) {
            return Promise.reject(response.error)
        }
    }
    return Promise.reject();
}

export async function fetchScriptContent(script: StoredItemTransfer) {
    if (script.id && script.parentId) {
        try {
            const response = await sendGetRequest(`${REPO_URL}/${script.parentId}/files/${script.id}/content`);
            if (response && response.data) {
                const content = atob(response.data.content);
                if (content !== undefined) return content;
            }
        } catch (response) {
            return Promise.reject(response.error)
        }
    }
    return Promise.reject();
}

export async function updateScriptContent(file: EditorFile) {
    const payload = {
        optLock: file.optLock,
        content: btoa(file.content)
    } as ScriptContentPayload;
    try {
        const response = await sendPutRequest(`${REPO_URL}/${file.parentId}/files/${file.id}/content`, payload,
            undefined, {"Content-Type": "application/json"});
        if (response && response.data) return response.data;
        return Promise.reject();
    } catch (response) {
        return Promise.reject(response.error)
    }
}

export async function fetchScriptVersions(script: StoredItemTransfer) {
    if (script.id && script.parentId) {
        try {
            const response = await sendGetRequest(`${REPO_URL}/${script.parentId}/files/${script.id}/versions`);
            if (response && response.data) return response.data;
        } catch (response) {
            return Promise.reject(response.error)
        }
    }
    return Promise.reject();
}

export async function fetchScriptVersionContent(script: StoredItemTransfer, versionId: string) {
    if (script.id && script.parentId) {
        try {
            const response = await sendGetRequest(`${REPO_URL}/${script.parentId}/files/${script.id}/versions/${versionId}`);
            if (response && response.data) {
                const content = atob(response.data.content);
                if (content !== undefined) return content;
            }
        } catch (response) {
            return Promise.reject(response.error)
        }
    }
    return Promise.reject();
}

export async function restoreScriptVersion(script: StoredItemTransfer, versionId: string) {
    try {
        const response = await sendPutRequest(`${REPO_URL}/${script.parentId}/files/${script.id}/versions/${versionId}/restore`,
            {optLock: script.optLock}, undefined, {"Content-Type": "application/json"});
        if (response && response.data) return response.data;
        return Promise.reject();
    } catch (response) {
        return Promise.reject(response.error)
    }
}

export async function incrementScriptVersion(item: StoredItemTransfer, payload: IncrementVersionPayload) {
    if (item.type === StoredItemType.FILE) {
        try {
            const response = await sendPutRequest(`${REPO_URL}/${item.parentId}/files/${item.id}/versions/increment`,
                payload, undefined, {"Content-Type": "application/json"});
            if (response && response.data) return response.data;
        } catch (response) {
            return Promise.reject(response.error)
        }
    }
    return Promise.reject();
}

export async function finalizeScriptVersion(item: StoredItemTransfer) {
    if (item.type === StoredItemType.FILE) {
        try {
            const response = await sendPutRequest(`${REPO_URL}/${item.parentId}/files/${item.id}/versions/finalize`,
                {optLock: item.optLock}, undefined, {"Content-Type": "application/json"});
            if (response && response.data) return response.data;
        } catch (response) {
            return Promise.reject(response.error)
        }
    }
    return Promise.reject();
}

export async function deleteDomainItem(node: TreeNode) {
    if (node.entity && node.entity.id && node.entity.type === StoredItemType.FILE && node.entity.parentId) {
        try {
            const item: StoredItemTransfer = node.entity;
            const response = await sendDeleteRequest(`${REPO_URL}/${item.parentId}/files/${item.id}`,
                {optLock: item.optLock}, undefined,
                {"Content-Type": "application/json"});
            if (response && response.data) {
                return buildBinnedNode(response.data, item.parentId.toString());
            }
        } catch (response) {
            return Promise.reject(response.error)
        }
    }
    return Promise.reject();
}

export async function deleteBinnedItem(node: TreeNode) {
    if (node.type === NodeType.BINNED && node.entity && node.entity.id && node.entity.type && node.entity.parentId) {
        try {
            const item: StoredItemTransfer = node.entity;
            const response = await sendDeleteRequest(`${REPO_URL}/${item.parentId}/bin/files/${item.id}`,
                {optLock: item.optLock}, undefined,
                {"Content-Type": "application/json"});
            if (response && response.success) return Promise.resolve();
        } catch (response) {
            return Promise.reject(response.error)
        }
    }
    return Promise.reject();
}

export async function restoreBinnedItem(node: TreeNode) {
    if (node.type === NodeType.BINNED && node.entity && node.entity.id && node.entity.type && node.entity.parentId) {
        try {
            const item: StoredItemTransfer = node.entity;
            const response = await sendPutRequest(`${REPO_URL}/${item.parentId}/bin/files/${item.id}/restore`,
                {optLock: item.optLock}, undefined, {"Content-Type": "application/json"});
            if (response && response.data) {
                return buildScriptNode(response.data, item.parentId.toString());
            }
        } catch (response) {
            return Promise.reject(response.error)
        }
    }
    return Promise.reject();
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
