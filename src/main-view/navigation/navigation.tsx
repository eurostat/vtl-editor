import { faCopy, faEdit, faFile, faQuestionCircle, faSave, IconDefinition } from "@fortawesome/free-regular-svg-icons";
import { faCloudUploadAlt, faCog, faTools, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@material-ui/core";
import React, { forwardRef, useEffect, useMemo, useState } from "react";
import ModalFactory from "react-modal-promise";
import { useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { DEFAULT_FILENAME } from "../../editor/editorFile";
import { editorFile, fileEdited, markUnedited, updateSaved } from "../../editor/editorSlice";
import TreeExplorer from "../../repository/tree-explorer/treeExplorer";
import SettingsPane from "../../settings/settingsPane";
import { readState } from "../../utility/store";
import { decisionModal } from "../decision-dialog/decisionModal";
import { MenuOption } from "../MenuOption";
import SidePane from "../side-pane/sidePane";
import { switchSidePane } from "../viewSlice";
import "./navigation.scss"

type NavigationProps = {
    showDialog: (value: boolean) => void,
    createNewFile: () => void
}

type MenuContent = {
    title: string, clazz: string, icon: IconDefinition, onClick?: () => void, link?: string
}
type MenuContentMap = Record<string, MenuContent[]>;

const Navigation = ({showDialog, createNewFile}: NavigationProps) => {
    const [currentMenuElement, setCurrentMenuElement] = useState<MenuOption>(MenuOption.NONE);
    const location = useLocation();
    const memoFileExplorer = useMemo(() => {
        return (<TreeExplorer/>)
    }, [])
    const dispatch = useDispatch();

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
            const res = await decisionModal({
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
        dispatch(markUnedited());
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
        let res = await decisionModal({
            title: "Warning",
            text: warningText
        });
        warningText = "Do you want to proceed? " +
            "If save process was canceled, current contents will be lost."
        if ((res === "yes" && await saveFile(warningText)) || res !== "cancel") {
            action();
        }
    }

    const makeNewFile = async () => {
        const edited = readState(fileEdited);
        if (edited) await unsavedFileGuard(createNewFile);
        else createNewFile();
    };

    const openFile = async () => {
        const edited = readState(fileEdited);
        if (edited) await unsavedFileGuard(() => showDialog(true));
        else showDialog(true);
    };

    const uploadFile = async () => {

    }

    const fileExplorerMenuClick = () => {
        dispatch(switchSidePane(MenuOption.FILE_EXPLORER));
        setCurrentMenuElement(MenuOption.FILE_EXPLORER);
    }

    const menuOptions: MenuContentMap = {
        "/sdmx": [
            {title: "Editor", clazz: "menu-first-item", icon: faEdit, link: "/"}
        ],
        "/diff": [],
        "/historical": [],
        "/": [
            {
                title: "File Explorer",
                clazz: "menu-file-explorer menu-first-item",
                icon: faCopy,
                onClick: fileExplorerMenuClick
            },
            {title: "Upload File", clazz: "menu-upload", icon: faCloudUploadAlt, onClick: uploadFile},
            {title: "New File (Ctrl+E)", clazz: "menu-new", icon: faFile, onClick: makeNewFile},
            {title: "Save file (Ctrl+S)", clazz: "menu-save", icon: faSave, onClick: saveFile},
            {title: "Open file (Ctrl+O)", clazz: "menu-open", icon: faUpload, onClick: openFile},
            {title: "SDMX Options", clazz: "menu-sdmx", icon: faTools, link: "/sdmx"},
        ]
    };

    const settingsMenuClick = () => {
        dispatch(switchSidePane(MenuOption.SETTINGS));
        setCurrentMenuElement(MenuOption.SETTINGS);
    }

    return (
        <>
            <div className="nav flex-column nav-pills left-nav" aria-orientation="vertical">
                {menuOptions[location.pathname]?.map(option => <MenuItem key={option.clazz} item={option}/>) || []}
                <Tooltip title="Settings" placement="right" arrow>
                    <button className="menu-settings" id="setting-icon" onClick={settingsMenuClick}>
                        <FontAwesomeIcon icon={faCog}/>
                    </button>
                </Tooltip>
                <Tooltip title="Help (Ctrl+F1)" placement="right" arrow>
                    <Link to="/documentation" target="_blank">
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
    const {title, clazz, icon, onClick, link = ""} = item;
    const afterClick = () => {
        if (onClick)
            onClick();
    };
    return (
        <Tooltip title={title} placement="right" arrow>
            <LinkWrapper link={link} wrapper={(children: any, ref: any, tooltipProps: any) => <Link ref={ref}
                                                                                                    to={link} {...tooltipProps}>{children}</Link>}
                         afterClick={afterClick} icon={icon} clazz={clazz}/>
        </Tooltip>
    )
};

const LinkWrapper = forwardRef(function LinkWrapper(props: any, ref: any) {
    const {link, wrapper, afterClick, icon, clazz, onBlur, onFocus, onMouseLeave, onMouseOver, onTouchEnd, onTouchStart} = props;
    const tooltipProps = {onBlur, onFocus, onMouseLeave, onMouseOver, onTouchEnd, onTouchStart};
    const buttonProps = {clazz, afterClick, icon, tooltipProps};
    const children = <ButtonComponent {...buttonProps} ref={!link ? ref : undefined}/>;
    return link ? wrapper(children, ref, tooltipProps) : children;
});

const ButtonComponent = forwardRef(function ButtonComponent(props: any, ref) {
    const {clazz, afterClick, icon, tooltipProps} = props;
    return (<button ref={ref} className={clazz} onClick={afterClick} {...tooltipProps}><FontAwesomeIcon icon={icon}/>
    </button>);
});

export default Navigation;