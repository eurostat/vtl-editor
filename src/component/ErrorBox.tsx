import React from "react";
import "./errorbox.scss";
import {faChevronUp} from "@fortawesome/free-solid-svg-icons";
import {faTimesCircle} from "@fortawesome/free-regular-svg-icons";
import {faTimesCircle as faTimesCircleSolid} from "@fortawesome/free-solid-svg-icons";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {VTL_VERSION, languageVersions} from "../editor/settings";


type ErrorBoxProps = {
    changeErrorBoxState: () => void,
    errorList: string[],
    languageVersion: VTL_VERSION
}


const ErrorBox = ({changeErrorBoxState, errorList, languageVersion}: ErrorBoxProps) => {
    const errorsCount = errorList.length;
    const version = languageVersions!.find(l => l.code === languageVersion)!.name;
    return (
        <>
            <div className="error-container">
                <div className="error-top">
                    <div className="position-right">
                        <div>
                            {errorsCount}
                        </div>
                        <div className="error-count">
                            <FontAwesomeIcon icon={faTimesCircleSolid}/>
                        </div>
                        <div className="close-button">
                            <FontAwesomeIcon className="hand-cursor" onClick={changeErrorBoxState} icon={faTimes}/>
                        </div>
                    </div>
                </div>
                <div className="error-list">
                    {errorList.map(e =>
                        <div>
                            <FontAwesomeIcon icon={faTimesCircleSolid}/>
                            <span>{e}</span>
                        </div>)}
                </div>
            </div>
            <div className="error-bar">
                <div className="position-left">
                    <div>
                        <FontAwesomeIcon className="hand-cursor" onClick={changeErrorBoxState} icon={faChevronUp}/>
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faTimesCircle}/>
                    </div>
                    <div>
                        {errorsCount}
                    </div>
                </div>
                <div className="position-right">
                    <div>
                        VTL {version}
                    </div>
                    <div>
                        Line 36, Col 43
                    </div>
                </div>
            </div>
        </>
    )
};


export default ErrorBox;