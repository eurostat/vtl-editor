import {faFile, faQuestionCircle, faSave, IconDefinition, faEdit} from "@fortawesome/free-regular-svg-icons";
import {faCog, faUpload, faCrown} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Tooltip} from "@material-ui/core";
import React, {forwardRef, useEffect, useState} from "react";
import ModalFactory from "react-modal-promise";
import {Link} from "react-router-dom";
import {decisionModal} from "./DecisionModal";
import "./navigation.scss"
import SettingsNav from "./SettingsNav";


type NavigationProps = {
    showDialog: (value: boolean) => void,
    changeMenu: () => void,
    code: string,
    setCodeChanged: (value: boolean) => void,
    codeChanged: boolean,
    fileName: string,
    createNewFile: () => void,
    settingsNavProps: any,
}

type MenuContent = {
    title: string, clazz: string, icon: IconDefinition, onClick?: () => void, link?: string
}
type MenuContentMap = Record<string, MenuContent[]>;

const Navigation = ({showDialog, changeMenu, code, setCodeChanged, codeChanged, fileName, createNewFile, settingsNavProps}: NavigationProps) => {
    const [href, setHref] = useState(window.location.pathname);
    const downloadFile = () => {
        let url = window.URL;
        let file = url.createObjectURL(new File([code], (!fileName || fileName === "") ? "untitled.vtl" : fileName));
        let a = document.createElement('a');
        a.href = file;
        a.download = fileName;
        a.click();
        setCodeChanged(false);
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
        const text = codeChanged ? "You have unsaved changes. Do you want to save your progress before creating new file?"
            : "You will lose your code. Do you want to continue?";
        let res = await decisionModal({
            title: "Warning!",
            text
        });
        if (res === "save") {
            if (codeChanged) {
                downloadFile()
            }
            createNewFile();
        }
    };

    const openFile = async () => {
        let res: any = true;
        if (codeChanged) {
            res = await decisionModal({
                title: "Warning!",
                text:
                    "You have unsaved changes. Do you want to save your progress before opening new file?"
            });
            if (res === "save") {
                downloadFile()
            }
        }
        if (res !== "cancel") {
            showDialog(true);
        }
    };

    const menuOptions: MenuContentMap = {
        "/sdmx": [
            {title: "Editor", clazz: "menu-first-item", icon: faEdit, link: "/"}
        ],
        "/": [
            {title: "New File (Ctrl+E)", clazz: "menu-new menu-first-item", icon: faFile, onClick: makeNewFile},
            {title: "Save file (Ctrl+S)", clazz: "menu-save", icon: faSave, onClick: downloadFile},
            {title: "Open file (Ctrl+O)", clazz: "menu-open", icon: faUpload, onClick: openFile},
            {title: "SDMX Options", clazz: "menu-sdmx", icon: faCrown, link: "/sdmx"},
        ]
    };

    return (
        <>
            <div className="nav flex-column nav-pills left-nav" aria-orientation="vertical">
                {menuOptions[href].map(option => <MenuItem key={option.clazz} item={option} setHref={setHref}/>)}
                <Tooltip title="Settings" placement="right" arrow>
                    <button className="menu-settings" id="setting-icon" onClick={changeMenu}>
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
            <SettingsNav {...settingsNavProps}/>
            <div style={{display: "inline-block"}}>
                <ModalFactory/>
            </div>
        </>
    )
};

type MenuItemProps = {
    item: MenuContent,
    setHref: (value: string) => void
}

const MenuItem = ({item, setHref}: MenuItemProps) => {
    const {title, clazz, icon, onClick, link = ""} = item;
    const afterClick = () => {
        if (link)
            setHref(link);
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