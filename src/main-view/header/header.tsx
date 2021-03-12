import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "@material-ui/core";
import React from "react";
import { useSelector } from "react-redux";
import logo from "../../assets/european-logo.png";
import { idToken, loggedIn, userName } from "../../utility/authSlice";
import { routerPath } from "../../utility/routerSlice";
import userManager, { baseUrl } from "../../utility/userManager";
import ToolItem, { ToolItemSettings } from "../toolbar/toolItem";
import "./header.scss";

const Header = () => {
    const authenticated = useSelector(loggedIn);
    const token = useSelector(idToken);
    const username = useSelector(userName);
    const path = useSelector(routerPath);

    const login = async () => {
        try {
            await userManager.signinRedirect({data: {path: path}})
        } catch {
        }
    };

    const logout = async (event: any) => {
        try {
            event.preventDefault();
            await userManager.signoutRedirect({"id_token_hint": token, "post_logout_redirect_uri": baseUrl + path});
            await userManager.removeUser();
        } catch {
        }
    };

    const profileItem: ToolItemSettings = {
        title: "Profile", key: "profile", link: "/profile",
        className: "fa-icon", faIcon: faUserCircle, tooltip: {placement: "bottom"}
    }

    return (
        <>
            <nav className="navbar navbar-expand-lg  static-top">
                <div className="header-container">

                    <img className="logo" src={logo} alt=""/>

                    <h1 className="title">Validation Rule Manager</h1>
                    <div className="button-pane">
                        {authenticated
                            ?
                            <>
                                <div className="menu-profile">
                                    <ToolItem key={profileItem.key} itemSettings={profileItem}/>
                                </div>
                                <Tooltip title={`Logged in as ${username}`} placement="bottom" arrow>
                                    <button className="btn btn-primary default-button" onClick={logout}>
                                        <span>Log out</span>
                                    </button>
                                </Tooltip>
                            </>
                            :
                            <button className="btn btn-primary default-button" onClick={login}>
                                <span>Log in</span>
                            </button>
                        }
                    </div>
                </div>
            </nav>
            <hr className="bar"/>
        </>
    )
};

export default Header;