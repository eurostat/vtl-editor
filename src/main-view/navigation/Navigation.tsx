import { faCopy, faEdit, faFile, faQuestionCircle, faSave, IconDefinition } from "@fortawesome/free-regular-svg-icons";
import { faCog, faTools, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@material-ui/core";
import React, { forwardRef, useEffect, useMemo, useState } from "react";
import ModalFactory from "react-modal-promise";
import { useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { DEFAULT_FILENAME } from "../../editor/editorFile";
import { editorFile, fileEdited, markUnedited } from "../../editor/editorSlice";
import FileExplorerPanel from "../../repository/explorer/FIleExplorerPanel";
import SettingsPanel from "../../settings/SettingsPanel";
import { readState } from "../../utility/store";
import { decisionModal } from "../decision-dialog/DecisionModal";
import { MenuOption } from "../MenuOption";
import DropdownMenu from "../side-panel/DropdownMenu";
import "./navigation.scss"

type NavigationProps = {
    showDialog: (value: boolean) => void,
    changeMenu: (menuOption: MenuOption) => void,
    createNewFile: () => void,
    settingsNavProps: any,
}

type MenuContent = {
    title: string, clazz: string, icon: IconDefinition, onClick?: () => void, link?: string
}
type MenuContentMap = Record<string, MenuContent[]>;

const Navigation = ({showDialog, changeMenu, createNewFile, settingsNavProps}: NavigationProps) => {
    const [currentMenuElement, setCurrentMenuElement] = useState<MenuOption>(MenuOption.NONE);
    const location = useLocation();
    const memoFileExplorer = useMemo(() => {
        return (<FileExplorerPanel/>)
    }, [])
    const dispatch = useDispatch();

    const downloadFile = () => {
        const editedFile = readState(editorFile);
        let url = window.URL;
        let file = url.createObjectURL(new File([editedFile.content],
            (!editedFile.name || editedFile.name === "") ? DEFAULT_FILENAME : editedFile.name));
        let a = document.createElement('a');
        a.href = file;
        a.download = editedFile.name;
        a.click();
        dispatch(markUnedited());
    };

    useEffect(() => {
        window.onkeydown = (event: KeyboardEvent) => checkKeyEvent(event);
    });

    const checkKeyEvent = (event: KeyboardEvent) => {
        if (event.ctrlKey) {
            let key = event.key;
            if (key === 's') {
                event.preventDefault();
                downloadFile();
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

    const makeNewFile = async () => {
        const edited = readState(fileEdited);
        const text = edited ? "You have unsaved changes. Do you want to save your progress before creating new file?"
            : "You will lose your code. Do you want to continue?";
        let res = await decisionModal({
            title: "Warning!",
            text
        });
        if (res === "yes") {
            if (edited) downloadFile();
            createNewFile();
        }
    };

    const openFile = async () => {
        const edited = readState(fileEdited);
        let res: any = true;
        if (edited) {
            res = await decisionModal({
                title: "Warning!",
                text:
                    "You have unsaved changes. Do you want to save your progress before opening new file?"
            });
            if (res === "yes") {
                downloadFile()
            }
        }
        if (res !== "cancel") {
            showDialog(true);
        }
    };

    const fileExplorerMenuClick = () => {
        changeMenu(MenuOption.FILE_EXPLORER)
        setCurrentMenuElement(MenuOption.FILE_EXPLORER)
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
            {title: "New File (Ctrl+E)", clazz: "menu-new", icon: faFile, onClick: makeNewFile},
            {title: "Save file (Ctrl+S)", clazz: "menu-save", icon: faSave, onClick: downloadFile},
            {title: "Open file (Ctrl+O)", clazz: "menu-open", icon: faUpload, onClick: openFile},
            {title: "SDMX Options", clazz: "menu-sdmx", icon: faTools, link: "/sdmx"},
        ]
    };

    const settingsMenuClick = () => {
        changeMenu(MenuOption.SETTINGS)
        setCurrentMenuElement(MenuOption.SETTINGS)
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
            <DropdownMenu currentElement={currentMenuElement}>
                <div title={MenuOption.SETTINGS}>
                    <SettingsPanel {...settingsNavProps}/>
                </div>
                <div title={MenuOption.FILE_EXPLORER}>
                    {memoFileExplorer}
                </div>
            </DropdownMenu>
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