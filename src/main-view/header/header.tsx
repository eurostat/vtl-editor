import { Tooltip } from "@material-ui/core";
import logo from "../../assets/european-logo.png";
import React from "react";

const Header = () => {
    return (
        <>
            <nav className="navbar navbar-expand-lg  static-top">
                <div className="header-container">

                    <img className="logo" src={logo} alt=""/>

                    <h1 className="title">Validation Rule Manager</h1>
                    <div className="nav-button">
                        <Tooltip title={"Logged in as "} placement="bottom" arrow>
                            <button className="btn btn-primary default-button">
                                <span>Log out</span>
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </nav>
            <hr className="bar"/>
        </>
    )
};

export default Header;