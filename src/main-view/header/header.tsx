import { Tooltip } from "@material-ui/core";
import React from "react";
import { useSelector } from "react-redux";
import logo from "../../assets/european-logo.png";
import { idToken, loggedIn, userName } from "../../utility/oidcSlice";
import { routerPath } from "../../utility/routerSlice";
import userManager, { baseUrl } from "../../utility/userManager";

const Header = () => {
    const authenticated = useSelector(loggedIn);
    const token = useSelector(idToken);
    const username = useSelector(userName);
    const path = useSelector(routerPath);

    const login = () => {
        userManager.signinRedirect({
            data: {path: path},
        }).then(() => {
        });
    };

    const logout = (event: any) => {
        event.preventDefault();
        userManager.signoutRedirect({"id_token_hint": token, "post_logout_redirect_uri": baseUrl + path}).then(() => {
        });
        userManager.removeUser().then(() => {
        });
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg  static-top">
                <div className="header-container">

                    <img className="logo" src={logo} alt=""/>

                    <h1 className="title">Validation Rule Manager</h1>
                    <div className="nav-button">
                        {authenticated
                            ?
                            <>
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