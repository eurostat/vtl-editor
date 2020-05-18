import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faQuestionCircle, faSave} from "@fortawesome/free-regular-svg-icons";
import {faUpload} from "@fortawesome/free-solid-svg-icons";
import React from "react";


const Navigation = () => {
    return (
        <div className="nav flex-column nav-pills left-nav" aria-orientation="vertical">
            <FontAwesomeIcon icon={faSave}/>
            <FontAwesomeIcon icon={faUpload}/>
            <FontAwesomeIcon icon={faQuestionCircle}/>
        </div>
    )
};

export default Navigation;