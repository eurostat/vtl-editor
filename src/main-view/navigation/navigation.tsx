import { faEdit, faQuestionCircle } from "@fortawesome/free-regular-svg-icons";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@material-ui/core";
import { AccountTreeOutlined, OpenInBrowserOutlined, SupervisorAccount } from "@material-ui/icons";
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
        "vtl-editor": {
            title: "Editor", key: "vtl-editor", link: "/",
            className: "fa-icon", faIcon: faEdit
        },
        "file-explorer": {
            title: "File Explorer", key: "file-explorer",
            className: "menu-file-explorer mat-icon",
            matIcon: <AccountTreeOutlined/>, onClick: toggleFileExplorer
        },
        "import-dsd": {
            title: "Import DSD", key: "import-dsd", link: "/sdmx",
            className: "mat-icon", matIcon: <OpenInBrowserOutlined/>
        },
        "manage-domains": {
            title: "Manage Domains", key: "manage-domains", link: "/manage",
            className: "mat-icon", matIcon: <SupervisorAccount/>
        }
    }

    const menuContentMap: MenuContentMap = {
        "/": [menuItems["import-dsd"], menuItems["file-explorer"], menuItems["manage-domains"]],
        "/manual": [],
        "/sdmx": [menuItems["vtl-editor"], menuItems["file-explorer"], menuItems["manage-domains"]],
        "/folder": [menuItems["vtl-editor"], menuItems["import-dsd"], menuItems["file-explorer"], menuItems["manage-domains"]],
        "/diff": [menuItems["vtl-editor"], menuItems["import-dsd"], menuItems["file-explorer"], menuItems["manage-domains"]],
        "/versions": [menuItems["vtl-editor"], menuItems["import-dsd"], menuItems["file-explorer"], menuItems["manage-domains"]],
        "/manage": [menuItems["vtl-editor"], menuItems["import-dsd"], menuItems["file-explorer"]]
    };

    return (
        <>
            <div className="nav flex-column nav-pills left-nav" aria-orientation="vertical">
                {menuContentMap[location.pathname]?.map(option => <ToolItem key={option.key}
                                                                            itemSettings={option}/>) || []}
                <Tooltip title="Settings" placement="right" arrow>
                    <button className="fa-icon" id="setting-icon" onClick={settingsMenuClick}>
                        <FontAwesomeIcon icon={faCog}/>
                    </button>
                </Tooltip>
                <Tooltip title="Help (Ctrl+F1)" placement="right" arrow>
                    <Link to="/manual" target="_blank" rel="noopener noreferrer">
                        <button className="fa-icon">
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