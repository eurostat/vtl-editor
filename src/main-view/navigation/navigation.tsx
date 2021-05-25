import {faEdit, faQuestionCircle} from "@fortawesome/free-regular-svg-icons";
import {faCog} from "@fortawesome/free-solid-svg-icons";
import {AccountTreeOutlined, Domain, LineStyle, OpenInBrowserOutlined, SupervisorAccount} from "@material-ui/icons";
import React, {useMemo} from "react";
import ModalFactory from "react-modal-promise";
import {useDispatch, useSelector} from "react-redux";
import {useManagerRole, useUserRole} from "../../control/authorized";
import PersonalExplorer from "../../repository/personal-repo/personalExplorer";
import {MenuOption} from "../menuOption";
import SettingsPane from "../settingsPane";
import SidePane from "../side-pane/sidePane";
import ToolItem, {AuthorizedToolItemSettings} from "../toolbar/toolItem";
import {sidePaneView, sidePaneVisible, switchSidePane} from "../viewSlice";
import "./navigation.scss"
import DomainExplorer from "../../repository/domain-repo/domainExplorer";

export default function Navigation() {
    const memoDomainExplorer = useMemo(() => <DomainExplorer/>, []);
    const memoPersonalExplorer = useMemo(() => <PersonalExplorer/>, []);
    const dispatch = useDispatch();
    const sidePaneElement = useSelector(sidePaneView);
    const sidePaneShown = useSelector(sidePaneVisible);
    const forManager = useManagerRole();
    const forUser = useUserRole();

    const toggleDomainRepo = () => {
        dispatch(switchSidePane(MenuOption.DOMAIN_REPO));
    }

    const togglePersonalRepo = () => {
        dispatch(switchSidePane(MenuOption.PERSONAL_REPO));
    }

    const settingsMenuClick = () => {
        dispatch(switchSidePane(MenuOption.SETTINGS));
    }

    const menuItems: AuthorizedToolItemSettings[] = [
        {
            title: "Editor", key: "vtl-editor", link: "/",
            className: "fa-icon", faIcon: faEdit,
        },
        {
            title: "Import DSD", key: "import-dsd", link: "/sdmx",
            className: "mat-icon", matIcon: <OpenInBrowserOutlined/>,
        },
        {
            title: "Personal Repository", key: "personal-repo",
            className: "personal-repo-pane mat-icon",
            matIcon: <AccountTreeOutlined/>, onClick: togglePersonalRepo,
            authCheck: forUser,
        },
        {
            title: "Domain Repository", key: "domain-repo",
            className: "domain-repo-pane mat-icon",
            matIcon: <Domain/>, onClick: toggleDomainRepo,
        },
        {
            title: "EDIT Service", key: "edit-client", link: "/editclient",
            className: "mat-icon", matIcon: <LineStyle/>,
            authCheck: forUser,
        },
        {
            title: "Manage Domains", key: "manage-domains", link: "/manage",
            className: "mat-icon", matIcon: <SupervisorAccount/>,
            authCheck: forManager,
        },
        {
            title: "Settings", key: "settings",
            className: "settings-pane fa-icon",
            faIcon: faCog, onClick: settingsMenuClick,
        },
        {
            title: "Help (Ctrl+F1)", key: "help",
            link: "/manual", target: "_blank", rel: "noopener noreferrer",
            className: "fa-icon",
            faIcon: faQuestionCircle,
        },
    ];

    const sidePaneStyling = () => sidePaneShown ? `open-${sidePaneElement}` : "";

    return (
        <>
            <div className={`nav flex-column nav-pills left-nav ${sidePaneStyling()}`}
                 aria-orientation="vertical">
                {
                    menuItems.map((option) => {
                            const component = <ToolItem key={option.key} itemSettings={option}/>;
                            return option.authCheck
                                ? option.authCheck(component)
                                : component;
                        }
                    )
                    || []
                }
            </div>
            <SidePane currentElement={sidePaneElement}>
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
