import {StoredItemType} from "../entity/storedItemType";
import {inputDialog} from "../../main-view/decision-dialog/inputDialog";
import {decisionDialog} from "../../main-view/decision-dialog/decisionDialog";
import {publishDialog, PublishDialogResult} from "../publishDialog";
import {StoredItemTransfer} from "../entity/storedItemTransfer";
import {incrementDialog} from "../incrementDialog";


export const createItemDialog = (type: StoredItemType, input?: string) => {
    const decision = async () => {
        const descriptor = type.toLocaleLowerCase();
        const result = await inputDialog({
            title: "Create New",
            text: `Enter new ${descriptor} name.`,
            defaultValue: input || "",
            acceptButton: {value: "create", color: "primary"}
        });
        return result !== "cancel"
            ? Promise.resolve(result)
            : Promise.reject();
    }
    return decision();
}

export const deleteItemDialog = (type: StoredItemType) => {
    const decision = async () => {
        const descriptor = type.toLocaleLowerCase();
        const result = await decisionDialog({
            title: "Warning",
            text: `Do you really want to delete this ${descriptor}?`,
            buttons: [
                {key: "yes", text: "Yes", color: "primary"},
                {key: "no", text: "No", color: "secondary"}
            ]
        });
        return result === "yes"
            ? Promise.resolve()
            : Promise.reject();
    }
    return decision();
}

export const restoreItemDialog = (type: StoredItemType) => {
    const decision = async () => {
        const descriptor = type.toLocaleLowerCase();
        const result = await decisionDialog({
            title: "Warning",
            text: `Do you really want to restore this ${descriptor}?`,
            buttons: [
                {key: "yes", text: "Yes", color: "primary"},
                {key: "no", text: "No", color: "secondary"}
            ]
        });
        return result === "yes"
            ? Promise.resolve()
            : Promise.reject();
    }
    return decision();
}

export const renameItemDialog = (type: StoredItemType, name: string) => {
    const decision = async () => {
        const descriptor = type.toLocaleLowerCase();
        const result = await inputDialog({
            title: "Rename",
            text: `Renaming ${descriptor} "${name}". Enter new name.`,
            defaultValue: name,
            acceptButton: {value: "rename", color: "primary"}
        });
        return result !== "cancel"
            ? Promise.resolve(result)
            : Promise.reject();
    }
    return decision();
}

export const incrementVersionDialog = (item: StoredItemTransfer) => {
    const decision = async () => {
        const descriptor = item.type.toLocaleLowerCase();
        const result = await incrementDialog({
            title: "Increment Version",
            text: `Increment version of ${descriptor} "${item.name}" from ${item.version} to minor or major. Enter new version.`,
            subject: item,
            defaultValue: item.version,
            acceptButton: {value: "increment", color: "primary"}
        });
        return result
            ? Promise.resolve(result)
            : Promise.reject();
    }
    return decision();
}

export const publishItemDialog = (type: StoredItemType, name: string) => {
    const decision = async () => {
        const descriptor = type.toLocaleLowerCase();
        const result: PublishDialogResult | undefined = await publishDialog({
            title: "Publish to domain",
            text: `Publishing ${descriptor} "${name}".\nEnter new name (optional) and select domain.`,
            defaultValue: name,
        });
        return result
            ? Promise.resolve(result)
            : Promise.reject();
    }
    return decision();
}
