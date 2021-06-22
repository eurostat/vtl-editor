import {faFile, faFolderOpen, faSave} from "@fortawesome/free-regular-svg-icons";
import {faCloudUploadAlt} from "@fortawesome/free-solid-svg-icons";
import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useUserRole} from "../../control/authorized";
import {decisionDialog} from "../../main-view/decision-dialog/decisionDialog";
import {inputDialog} from "../../main-view/decision-dialog/inputDialog";
import OpenDialog from "../../main-view/open-dialog/openDialog";
import ToolItem, {AuthorizedToolItemSettings} from "../../main-view/toolbar/toolItem";
import {StoredItemPayload} from "../../repository/entity/storedItemPayload";
import {StoredItemTransfer} from "../../repository/entity/storedItemTransfer";
import {createFile, updateFileContent} from "../../repository/personal-repo/personalRepoService";
import {addFileToTree, selectedFolder, selectedFolderPath} from "../../repository/personal-repo/personalRepoSlice";
import {buildFileNode} from "../../repository/personal-repo/personalExplorerService";
import {readState} from "../../utility/store";
import {buildEmptyFile, buildFile, DEFAULT_FILENAME, EditorFile} from "../editorFile";
import {
    editorFile,
    fileChanged,
    fileId,
    fileName,
    markUnchanged,
    storeLoaded,
    updateFileMeta,
    updateSaved
} from "../editorSlice";
import "./topBar.scss";
import {RepositoryType} from "../../repository/entity/repositoryType";
import {updateScriptContent} from "../../repository/domain-repo/domainRepoService";
import {useErrorNotice, useInfoNotice, useSuccessNotice} from "../../utility/useNotification";

export default function TopBar() {
    const [showDialog, setShowDialog] = useState(false);
    const dispatch = useDispatch();
    const name = useSelector(fileName);
    const changed = useSelector(fileChanged);
    const showSuccess = useSuccessNotice();
    const showInfo = useInfoNotice();
    const showError = useErrorNotice();
    const forUser = useUserRole();

    useEffect(() => {
        window.onkeydown = (event: KeyboardEvent) => checkKeyEvent(event);
    });

    const checkKeyEvent = (event: KeyboardEvent) => {
        if (event.ctrlKey) {
            let key = event.key;
            if (key === 's') {
                event.preventDefault();
                saveFile().then();
            } else if (key === 'o') {
                event.preventDefault();
                openFile().then();
            } else if (key === 'e') {
                event.preventDefault();
                makeNewFile().then();
            } else if (key === "F1") {
                window.open(`${window.location.origin}/manual`);
            }
        }
    };

    const unsavedFileGuard = async (action: () => void) => {
        let warningText = "This action replaces editor contents. You have unsaved changes. " +
            "Do you want to save your progress first?";
        let res = await decisionDialog({
            title: "Warning",
            text: warningText,
            buttons: [
                {key: "yes", text: "Yes", color: "primary"},
                {key: "no", text: "No", color: "secondary"}
            ]
        });
        warningText = "Do you want to proceed? " +
            "If save process was canceled, current contents will be lost."
        if (res === "yes") {
            const id = readState(fileId);
            if (id > 0) {
                await uploadFile();
                action();
            } else if (await saveFile(warningText)) {
                action();
            }
        } else if (res === "no") {
            action();
        }
    };

    const saveFile = async (warningText?: string) => {
        const editedFile = readState(editorFile);
        let url = window.URL;
        let file = url.createObjectURL(new File([editedFile.content],
            (!editedFile.name || editedFile.name === "") ? DEFAULT_FILENAME : editedFile.name));
        let a = document.createElement('a');
        a.href = file;
        a.download = editedFile.name;
        a.click();
        if (warningText) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            // @ts-ignore
            const res = await decisionDialog({
                title: "Warning",
                text: warningText,
                buttons: [
                    {key: "yes", text: "Yes", color: "primary"},
                    {key: "no", text: "No", color: "secondary"}
                ]
            });
            if (res === "no") return false;
        }
        dispatch(updateSaved(editedFile.content));
        dispatch(markUnchanged());
        return true;
    };

    const createNewFile = () => {
        const loadedFile = buildEmptyFile();
        dispatch(storeLoaded(loadedFile));
    };

    const makeNewFile = async () => {
        if (readState(fileChanged)) await unsavedFileGuard(createNewFile);
        else createNewFile();
    };

    const loadFile = (newFiles: string[], filename: string) => {
        const loadedFile = buildFile(filename, newFiles[0], false);
        dispatch(storeLoaded(loadedFile));
    };

    const openFile = async () => {
        if (readState(fileChanged)) await unsavedFileGuard(() => setShowDialog(true));
        else setShowDialog(true);
    };

    const uploadFileDialog = (path: string, filename: string) => {
        const decision = async () => {
            const result = await inputDialog({
                title: "Upload As",
                text: `File will be uploaded to ${path === "/" ? "root folder" : "folder " + path}.\n` +
                    "To change this location, select target folder in the Personal Repository.\n" +
                    "You can change file name below.",
                defaultValue: filename || "",
                acceptButton: {value: "upload", color: "primary"}
            });
            return result !== "cancel"
                ? Promise.resolve(result)
                : Promise.reject();
        }
        return decision();
    }

    const updateContent = async (file: EditorFile) => {
        const call = file.repository === RepositoryType.DOMAIN ? updateScriptContent : updateFileContent;
        await call(file).then((response) => {
            if (response) {
                showSuccess(`File "${file.name}" saved successfully.`);
                file = Object.assign({}, file,
                    {changed: false, version: response.version, optLock: response.optLock});
                dispatch(updateFileMeta(file));
                dispatch(updateSaved(file.content));
                dispatch(markUnchanged());
            }
        }).catch((error) => showError(`Failed to save file "${file.name}".`, error));
    }

    const uploadFile = async () => {
        let file = readState(editorFile);
        if (file.id > 0) {
            if (!file.changed) {
                showInfo(`File "${file.name}" has not been changed. Skipping save.`);
                return;
            }
            await updateContent(file);
        } else {
            const parentId = readState(selectedFolder);
            const path = readState(selectedFolderPath);
            try {
                const filename = await uploadFileDialog(path, file.name)
                const payload: StoredItemPayload = {name: filename, parentId: parentId};
                createFile(payload).then((response) => {
                    if (response) {
                        const saved: StoredItemTransfer = response;
                        dispatch(addFileToTree(buildFileNode(saved)));
                        file = Object.assign({}, file,
                            {
                                name: saved.name, id: saved.id,
                                optLock: saved.optLock, version: saved.version
                            });
                        dispatch(updateFileMeta(file));
                        updateContent(file);
                    }
                }).catch((error) => showError(`Failed to save file "${file.name}".`, error));
            } catch {
            }
        }
    };

    const toolbarItems: AuthorizedToolItemSettings[] = [
        {
            title: "New File (Ctrl+E)", key: "new-file", onClick: makeNewFile,
            className: "menu-new separated", faIcon: faFile, tooltip: {placement: "bottom"},
        },
        {
            title: "Open file (Ctrl+O)", key: "open-file", onClick: openFile,
            className: "menu-open", faIcon: faFolderOpen, tooltip: {placement: "bottom"},
        },
        {
            title: "Save file (Ctrl+S)", key: "save-file", onClick: saveFile,
            className: "menu-save separated", faIcon: faSave, tooltip: {placement: "bottom"},
        },
        {
            title: "Upload File", key: "upload-file", onClick: uploadFile,
            className: "menu-upload separated", faIcon: faCloudUploadAlt, tooltip: {placement: "bottom"},
            authCheck: forUser,
        },
    ];

    return (
        <>
            <div id="top-bar" className="top-bar" aria-orientation="horizontal">
                <div className="toolbar">
                    {toolbarItems.map((option) => {
                            const component = <ToolItem key={option.key} itemSettings={option}/>;
                            return option.authCheck
                                ? option.authCheck(component)
                                : component;
                        }
                    )
                    || []}
                </div>
                <div className="titlebar">
                    <span>{name}&nbsp;{changed ? "*" : ""}</span>
                </div>
                <div className="rightbar" style={{width: (toolbarItems.length * 40) + "px"}}/>
            </div>
            {showDialog ?
                <OpenDialog onClose={setShowDialog} onLoad={loadFile}/> : null}
        </>
    )
}
