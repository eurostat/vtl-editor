import React from "react";
import "./errorbox.scss";
import {faChevronUp} from "@fortawesome/free-solid-svg-icons";
import {faTimesCircle} from "@fortawesome/free-regular-svg-icons";
import {faTimesCircle as faTimesCircleSolid} from "@fortawesome/free-solid-svg-icons";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

type ErrorBoxProps = {
    changeErrorBoxState: () => void,
}

const errorList = [
    "Error description numer 1", "Error description numer 2", "Error description numer 3", "Error description numer 4",
    "Error description numer 5", "Error description numer 6", "Error description numer 7"
];

const ErrorBox = ({changeErrorBoxState}: ErrorBoxProps) => {
    return (
        <>
            <div className="error-container">
                <div className="error-top">
                    <div className="position-right">
                        <div>
                            5
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
                        5
                    </div>
                </div>
                <div className="position-right">
                    <div>
                        VTL 2.0
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