import { faEdit, faQuestionCircle } from "@fortawesome/free-regular-svg-icons";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@material-ui/core";
import { AccountTreeOutlined, OpenInBrowserOutlined } from "@material-ui/icons";
import React, { useMemo, useState } from "react";
import ModalFactory from "react-modal-promise";
import { useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import TreeExplorer from "../../repository/tree-explorer/treeExplorer";
import SettingsPane from "../../settings/settingsPane";
import { MenuOption } from "../MenuOption";
import SidePane from "../side-pane/sidePane";
import ToolItem, { ToolItemSettings } from "../toolbar/toolItem";
import { switchSidePane } from "../viewSlice";
import "./navigation.scss"

type MenuContentMap = Record<string, ToolItemSettings[]>;

const Navigation = () => {
    const [currentMenuElement, setCurrentMenuElement] = useState<MenuOption>(MenuOption.NONE);
    const location = useLocation();
    const memoFileExplorer = useMemo(() => {
        return (<TreeExplorer/>)
    }, [])
    const dispatch = useDispatch();

    const toggleFileExplorer = () => {
        dispatch(switchSidePane(MenuOption.FILE_EXPLORER));
        setCurrentMenuElement(MenuOption.FILE_EXPLORER);
    }

    const settingsMenuClick = () => {
        dispatch(switchSidePane(MenuOption.SETTINGS));
        setCurrentMenuElement(MenuOption.SETTINGS);
    }

    const menuItems: Record<string, ToolItemSettings> = {
        "vtl-editor": {title: "Editor", clazz: "vtl-editor", faIcon: faEdit, link: "/",},
        "file-explorer": {
            title: "File Explorer", clazz: "menu-file-explorer",
            matIcon: <AccountTreeOutlined style={{fontSize: "36px"}}/>, onClick: toggleFileExplorer
        },
        "import-dsd": {
            title: "Import DSD", clazz: "menu-sdmx",
            matIcon: <OpenInBrowserOutlined style={{fontSize: "36px"}}/>, link: "/sdmx"
        }
    }

    const menuContentMap: MenuContentMap = {
        "/": [menuItems["import-dsd"], menuItems["file-explorer"]],
        "/manual": [],
        "/sdmx": [menuItems["vtl-editor"], menuItems["file-explorer"]],
        "/folder": [menuItems["vtl-editor"], menuItems["import-dsd"], menuItems["file-explorer"]],
        "/diff": [menuItems["vtl-editor"], menuItems["import-dsd"], menuItems["file-explorer"]],
        "/versions": [menuItems["vtl-editor"], menuItems["import-dsd"], menuItems["file-explorer"]]
    };

    return (
        <>
            <div className="nav flex-column nav-pills left-nav" aria-orientation="vertical">
                {menuContentMap[location.pathname]?.map(option => <ToolItem key={option.clazz}
                                                                            itemSettings={option}/>) || []}
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

export default Navigation;