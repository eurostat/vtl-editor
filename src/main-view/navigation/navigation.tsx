import { faEdit, faQuestionCircle } from "@fortawesome/free-regular-svg-icons";
import { faCog } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "@material-ui/core";
import {AccountTreeOutlined, Domain, OpenInBrowserOutlined, SupervisorAccount} from "@material-ui/icons";
import React, { useMemo, useState } from "react";
import ModalFactory from "react-modal-promise";
import { useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { useManagerRole, useUserRole } from "../../control/authorized";
import PersonalExplorer from "../../repository/personal-repo/personalExplorer";
import { MenuOption } from "../menuOption";
import SettingsPane from "../settingsPane";
import SidePane from "../side-pane/sidePane";
import ToolItem, { AuthorizedToolItemSettings } from "../toolbar/toolItem";
import { switchSidePane } from "../viewSlice";
import "./navigation.scss"
import DomainExplorer from "../../repository/domain-repo/domainExplorer";

type MenuContentMap = Record<string, AuthorizedToolItemSettings[]>;

export default function Navigation() {
    const [currentMenuElement, setCurrentMenuElement] = useState<MenuOption>(MenuOption.NONE);
    const location = useLocation();
    const memoDomainExplorer = useMemo(() => <DomainExplorer/>, []);
    const memoPersonalExplorer = useMemo(() => <PersonalExplorer/>, []);
    const dispatch = useDispatch();

    const forManager = useManagerRole();
    const forUser = useUserRole();

    const toggleDomainRepo = () => {
        dispatch(switchSidePane(MenuOption.DOMAIN_REPO));
        setCurrentMenuElement(MenuOption.DOMAIN_REPO);
    }

    const togglePersonalRepo = () => {
        dispatch(switchSidePane(MenuOption.PERSONAL_REPO));
        setCurrentMenuElement(MenuOption.PERSONAL_REPO);
    }

    const settingsMenuClick = () => {
        dispatch(switchSidePane(MenuOption.SETTINGS));
        setCurrentMenuElement(MenuOption.SETTINGS);
    }

    const menuItems: Record<string, AuthorizedToolItemSettings> = {
        "vtl-editor": {
            title: "Editor", key: "vtl-editor", link: "/",
            className: "fa-icon", faIcon: faEdit,
        },
        "domain-repo": {
            title: "Domain Repository", key: "domain-repo",
            className: "domain-repo-pane mat-icon",
            matIcon: <Domain/>, onClick: toggleDomainRepo,
        },
        "personal-repo": {
            title: "Personal Repository", key: "personal-repo",
            className: "personal-repo-pane mat-icon",
            matIcon: <AccountTreeOutlined/>, onClick: togglePersonalRepo,
            authCheck: forUser,
        },
        "import-dsd": {
            title: "Import DSD", key: "import-dsd", link: "/sdmx",
            className: "mat-icon", matIcon: <OpenInBrowserOutlined/>,
        },
        "manage-domains": {
            title: "Manage Domains", key: "manage-domains", link: "/manage",
            className: "mat-icon", matIcon: <SupervisorAccount/>,
            authCheck: forManager,
        }
    }

    const menuContentMap: MenuContentMap = {
        "/": [menuItems["import-dsd"], menuItems["personal-repo"], menuItems["domain-repo"], menuItems["manage-domains"]],
        "/manual": [],
        "/sdmx": [menuItems["vtl-editor"], menuItems["personal-repo"], menuItems["domain-repo"], menuItems["manage-domains"]],
        "/folder": [menuItems["vtl-editor"], menuItems["import-dsd"], menuItems["personal-repo"], menuItems["domain-repo"], menuItems["manage-domains"]],
        "/diff": [menuItems["vtl-editor"], menuItems["import-dsd"], menuItems["personal-repo"], menuItems["domain-repo"], menuItems["manage-domains"]],
        "/versions": [menuItems["vtl-editor"], menuItems["import-dsd"], menuItems["personal-repo"], menuItems["domain-repo"], menuItems["manage-domains"]],
        "/manage": [menuItems["vtl-editor"], menuItems["import-dsd"], menuItems["personal-repo"], menuItems["domain-repo"]],
        "/profile": [menuItems["vtl-editor"], menuItems["import-dsd"], menuItems["personal-repo"], menuItems["domain-repo"], menuItems["manage-domains"]]
    };

    return (
        <>
            <div className="nav flex-column nav-pills left-nav" aria-orientation="vertical">
                {
                    menuContentMap[location.pathname]?.map((option) => {
                            const component = <ToolItem key={option.key} itemSettings={option}/>;
                            return option.authCheck
                                ? option.authCheck(component)
                                : component;
                        }
                    )
                    || []
                }
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
                <div title={MenuOption.DOMAIN_REPO}>
                    {memoDomainExplorer}
                </div>
                <div title={MenuOption.PERSONAL_REPO}>
                    {memoPersonalExplorer}
                </div>
            </SidePane>
            <div style={{display: "inline-block"}}>
                <ModalFactory/>
            </div>
        </>
    )
}