import {
    faEdit,
    faFile,
    faFolderOpen,
    faQuestionCircle,
    faSave,
    IconDefinition
} from "@fortawesome/free-regular-svg-icons";
import { faCloudUploadAlt, faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@material-ui/core";
import { AccountTreeOutlined, OpenInBrowserOutlined } from "@material-ui/icons";
import { useSnackbar } from "notistack";
import React, { forwardRef, useEffect, useMemo, useState } from "react";
import ModalFactory from "react-modal-promise";
import { useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { DEFAULT_FILENAME, EditorFile } from "../../editor/editorFile";
import { editorFile, fileChanged, markUnchanged, updateFileMeta, updateSaved } from "../../editor/editorSlice";
import { StoredItemPayload } from "../../repository/entity/storedItemPayload";
import { StoredItemTransfer } from "../../repository/entity/storedItemTransfer";
import { StoredItemType } from "../../repository/entity/storedItemType";
import { createFile, updateFileContent } from "../../repository/repositoryService";
import { addFileToTree, selectedFolder } from "../../repository/repositorySlice";
import TreeExplorer from "../../repository/tree-explorer/treeExplorer";
import { buildFileNode, createItemDialog } from "../../repository/tree-explorer/treeExplorerService";
import SettingsPane from "../../settings/settingsPane";
import { readState } from "../../utility/store";
import { decisionDialog } from "../decision-dialog/decisionDialog";
import { MenuOption } from "../MenuOption";
import SidePane from "../side-pane/sidePane";
import { switchSidePane } from "../viewSlice";
import "./navigation.scss"

type NavigationProps = {
    showDialog: (value: boolean) => void,
    createNewFile: () => void
}

type MenuContent = {
    title: string, clazz: string, faIcon?: IconDefinition, matIcon?: React.ReactElement<any>, onClick?: () => void, link?: string
}
type MenuContentMap = Record<string, MenuContent[]>;

const Navigation = ({showDialog, createNewFile}: NavigationProps) => {
    const [currentMenuElement, setCurrentMenuElement] = useState<MenuOption>(MenuOption.NONE);
    const location = useLocation();
    const memoFileExplorer = useMemo(() => {
        return (<TreeExplorer/>)
    }, [])
    const dispatch = useDispatch();
    const {enqueueSnackbar} = useSnackbar();

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
            const res = await decisionDialog({
                title: "Warning",
                text: warningText,
                settings: {
                    buttons: [
                        {value: "yes", color: "primary"},
                        {value: "no", color: "secondary"}
                    ]
                }
            });
            if (res === "no") return false;
        }
        dispatch(updateSaved(editedFile.content));
        dispatch(markUnchanged());
        return true;
    };

    useEffect(() => {
        window.onkeydown = (event: KeyboardEvent) => checkKeyEvent(event);
    });

    const checkKeyEvent = (event: KeyboardEvent) => {
        if (event.ctrlKey) {
            let key = event.key;
            if (key === 's') {
                event.preventDefault();
                saveFile();
            } else if (key === 'o') {
                event.preventDefault();
                openFile();
            } else if (key === 'e') {
                event.preventDefault();
                makeNewFile();
            } else if (key === "F1") {
                window.open(`${window.location.origin}/documentation`);
            }
        }
    };

    const unsavedFileGuard = async (action: () => void) => {
        let warningText = "This action replaces editor contents. You have unsaved changes. " +
            "Do you want to save your progress first?";
        let res = await decisionDialog({
            title: "Warning",
            text: warningText,
            settings: {
                buttons: [
                    {value: "yes", color: "primary"},
                    {value: "no", color: "secondary"}
                ]
            }
        });
        warningText = "Do you want to proceed? " +
            "If save process was canceled, current contents will be lost."
        if ((res === "yes" && await saveFile(warningText)) || res !== "cancel") {
            action();
        }
    }

    const makeNewFile = async () => {
        if (readState(fileChanged)) await unsavedFileGuard(createNewFile);
        else createNewFile();
    };

    const openFile = async () => {
        if (readState(fileChanged)) await unsavedFileGuard(() => showDialog(true));
        else showDialog(true);
    };

    const uploadFile = async () => {
        const updateContent = (file: EditorFile) => {
            updateFileContent(file).then((response) => {
                if (response && response.data) {
                    enqueueSnackbar(`File "${file.name}" saved successfully.`, {variant: "success"});
                    file = Object.assign({}, file, {changed: false, version: response.data.version});
                    dispatch(updateFileMeta(file));
                    dispatch(updateSaved(file.content));
                    dispatch(markUnchanged());
                }
            }).catch(() => enqueueSnackbar(`Failed to save file "${file.name}".`, {variant: "error"}));
        }

        let file = readState(editorFile);
        if (file.remoteId > 0) {
            if (!file.changed) {
                enqueueSnackbar(`File "${file.name}" has not been changed. Skipping save.`,
                    {variant: "info"});
                return;
            }
            updateContent(file);
        } else {
            const parentId = readState(selectedFolder);
            createItemDialog(StoredItemType.FILE, file.name)
                .then((name: string) => {
                    const payload: StoredItemPayload = {name: name, parentFolderId: parentId};
                    createFile(payload).then((response) => {
                        if (response && response.data) {
                            const saved: StoredItemTransfer = response.data;
                            dispatch(addFileToTree(buildFileNode(saved)));
                            file = Object.assign({}, file,
                                {
                                    name: saved.name, remoteId: saved.id,
                                    optLock: saved.optLock, version: saved.version
                                });
                            dispatch(updateFileMeta(file));
                            updateContent(file);
                        }
                    }).catch(() => enqueueSnackbar(`Failed to save file "${file.name}".`, {variant: "error"}));
                });
        }
    }

    const toggleFileExplorer = () => {
        dispatch(switchSidePane(MenuOption.FILE_EXPLORER));
        setCurrentMenuElement(MenuOption.FILE_EXPLORER);
    }

    const menuOptions: MenuContentMap = {
        "/": [
            {
                title: "File Explorer", clazz: "menu-file-explorer",
                matIcon: <AccountTreeOutlined style={{fontSize: "36px"}}/>, onClick: toggleFileExplorer
            },
            {title: "Upload File", clazz: "menu-upload", faIcon: faCloudUploadAlt, onClick: uploadFile},
            {title: "New File (Ctrl+E)", clazz: "menu-new", faIcon: faFile, onClick: makeNewFile},
            {title: "Save file (Ctrl+S)", clazz: "menu-save", faIcon: faSave, onClick: saveFile},
            {title: "Open file (Ctrl+O)", clazz: "menu-open", faIcon: faFolderOpen, onClick: openFile},
            {
                title: "Import DSD",
                clazz: "menu-sdmx",
                matIcon: <OpenInBrowserOutlined style={{fontSize: "36px"}}/>,
                link: "/sdmx"
            },
        ],
        "/manual": [],
        "/sdmx": [],
        "/folder": [
            {
                title: "File Explorer", clazz: "menu-file-explorer",
                matIcon: <AccountTreeOutlined style={{fontSize: "36px"}}/>, onClick: toggleFileExplorer
            },
        ],
        "/diff": [
            {
                title: "File Explorer", clazz: "menu-file-explorer",
                matIcon: <AccountTreeOutlined style={{fontSize: "36px"}}/>, onClick: toggleFileExplorer
            },
        ],
        "/versions": [
            {
                title: "File Explorer", clazz: "menu-file-explorer",
                matIcon: <AccountTreeOutlined style={{fontSize: "36px"}}/>, onClick: toggleFileExplorer
            },
        ]
    };

    const settingsMenuClick = () => {
        dispatch(switchSidePane(MenuOption.SETTINGS));
        setCurrentMenuElement(MenuOption.SETTINGS);
    }

    return (
        <>
            <div className="nav flex-column nav-pills left-nav" aria-orientation="vertical">
                <Tooltip title="Editor" placement="right" arrow>
                    <Link to="/">
                        <button>
                            <FontAwesomeIcon icon={faEdit}/>
                        </button>
                    </Link>
                </Tooltip>
                {menuOptions[location.pathname]?.map(option => <MenuItem key={option.clazz} item={option}/>) || []}
                <Tooltip title="Settings" placement="right" arrow>
                    <button className="menu-settings" id="setting-icon" onClick={settingsMenuClick}>
                        <FontAwesomeIcon icon={faCog}/>
                    </button>
                </Tooltip>
                <Tooltip title="Help (Ctrl+F1)" placement="right" arrow>
                    <Link to="/manual" target="_blank" rel="noopener noreferrer">
                        <button className="menu-help">
                            <FontAwesomeIcon icon={faQuestionCircle}/>
                        </button>
                    </Link>
                </Tooltip>
            </div>
            <SidePane currentElement={currentMenuElement}>
                <div title={MenuOption.SETTINGS}>
                    <SettingsPane/>
                </div>
                <div title={MenuOption.FILE_EXPLORER}>
                    {memoFileExplorer}
                </div>
            </SidePane>
            <div style={{display: "inline-block"}}>
                <ModalFactory/>
            </div>
        </>
    )
};

type MenuItemProps = {
    item: MenuContent,
}

const MenuItem = ({item}: MenuItemProps) => {
    const {title, clazz, faIcon, matIcon, onClick, link = ""} = item;
    const afterClick = () => {
        if (onClick)
            onClick();
    };
    return (
        <Tooltip title={title} placement="right" arrow>
            <LinkWrapper link={link}
                         wrapper={(children: any, ref: any, tooltipProps: any) =>
                             <Link ref={ref} to={link} {...tooltipProps}>{children}</Link>}
                         afterClick={afterClick} faIcon={faIcon} matIcon={matIcon} clazz={clazz}/>
        </Tooltip>
    )
};

const LinkWrapper = forwardRef(function LinkWrapper(props: any, ref: any) {
    const {link, wrapper, afterClick, faIcon, matIcon, clazz, onBlur, onFocus, onMouseLeave, onMouseOver, onTouchEnd, onTouchStart} = props;
    const tooltipProps = {onBlur, onFocus, onMouseLeave, onMouseOver, onTouchEnd, onTouchStart};
    const buttonProps = {clazz, afterClick, faIcon, matIcon, tooltipProps};
    const children = <ButtonComponent {...buttonProps} ref={!link ? ref : undefined}/>;
    return link ? wrapper(children, ref, tooltipProps) : children;
});

const ButtonComponent = forwardRef(function ButtonComponent(props: any, ref) {
    const {clazz, afterClick, faIcon, matIcon, tooltipProps} = props;
    return (
        <button ref={ref} className={clazz} onClick={afterClick} {...tooltipProps} >
            {faIcon !== undefined
                ? <FontAwesomeIcon icon={faIcon}/>
                : matIcon !== undefined
                    ? matIcon
                    : null}
        </button>
    );
});

export default Navigation;