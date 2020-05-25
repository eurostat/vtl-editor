import React from "react";
import "./guideOverlay.scss";

const GuideOverlay = () => {


    return (
        <div className="overlay">
            <div className="overlay-header"></div>
            <div className="overlay-nav"></div>
            <div className="overlay-settings"></div>
            <div className="middle-container">
                <div className="overlay-top"></div>
                <div className="overlay-editor"></div>
                <div className="overlay-error-box"></div>
                <div className="overlay-error-bar"></div>
            </div>
        </div>
    );
};


export default GuideOverlay;