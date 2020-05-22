import React, {useEffect} from "react";
import "./navigation.scss"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFile, faQuestionCircle, faSave} from "@fortawesome/free-regular-svg-icons";
import {faCog, faUpload} from "@fortawesome/free-solid-svg-icons";
import {decisionModal} from "./DecisionModal";
import ModalFactory from "react-modal-promise";
import SettingsNav from "./SettingsNav";
import {Tooltip} from "@material-ui/core";
import {Link} from "react-router-dom";

type NavigationProps = {
    showDialog: (value: boolean) => void,
    changeMenu: () => void,
    code: string,
    setCodeChanged: (value: boolean) => void,
    codeChanged: boolean,
    fileName: string,
    createNewFile: () => void,
    settingsNavProps: any
}

const Navigation = ({showDialog, changeMenu, code, setCodeChanged, codeChanged, fileName, createNewFile, settingsNavProps}: NavigationProps) => {
    const downloadFile = () => {
        let url = window.URL;
        let file = url.createObjectURL(new File([code], (!fileName || fileName === "") ? "untitled.vtl" : fileName));
        let a = document.createElement('a');
        a.href = file;
        a.download = fileName;
        a.click();
        setCodeChanged(false);
    };

    useEffect(() => {
        window.onkeydown = (event: KeyboardEvent) => checkKeyEvent(event);
    });

    const checkKeyEvent = (event: KeyboardEvent) => {
        if (event.ctrlKey) {
            let key = event.key;
            if (key === 's') {
                event.preventDefault();
                downloadFile();
            } else if (key === 'o') {
                event.preventDefault();
                openFile();
            } else if ( key === 'e') {
                event.preventDefault();
                makeNewFile();
            } else if (key === "F1") {
                window.open(`${window.location.origin}/documentation`);
            }
        }
    };

    const makeNewFile = async () => {
        const text = codeChanged ? "You have unsaved changes. Do you want to save your progress before creating new file?"
            : "You will lose your code. Do you want to continue?";
        let res = await decisionModal({
            title: "Warning!",
            text
        });
        if (res === "save") {
            if (codeChanged) {
                downloadFile()
            }
            createNewFile();
        }
    };

    const openFile = async () => {
        let res: any = true;
        if (codeChanged) {
            res = await decisionModal({
                title: "Warning!",
                text:
                    "You have unsaved changes. Do you want to save your progress before opening new file?"
            });
            if (res === "save") {
                downloadFile()
            }
        }
        if (res !== "cancel") {
            showDialog(true);
        }
    };

    return (
        <>
            <div className="nav flex-column nav-pills left-nav" aria-orientation="vertical">
                <Tooltip title="New File (Ctrl+E)" placement="right" arrow>
                    <button className="menu-save" onClick={makeNewFile}>
                        <FontAwesomeIcon icon={faFile}/>
                    </button>
                </Tooltip>
                <Tooltip title="Save file (Ctrl+S)" placement="right" arrow>
                    <button className="menu-save" onClick={downloadFile}>
                        <FontAwesomeIcon icon={faSave}/>
                    </button>
                </Tooltip>
                <Tooltip title="Open file (Ctrl+O)" placement="right" arrow>
                    <button className="menu-open" onClick={openFile}>
                        <FontAwesomeIcon icon={faUpload}/>
                    </button>
                </Tooltip>
                <Tooltip title="Settings" placement="right" arrow>
                    <button className="menu-settings" id="setting-icon" onClick={changeMenu}>
                        <FontAwesomeIcon icon={faCog}/>
                    </button>
                </Tooltip>
                <Tooltip title="Help (Ctrl+F1)" placement="right" arrow>
                    <Link to="/documentation" target="_blank">
                        <button className="menu-help">
                            <FontAwesomeIcon icon={faQuestionCircle}/>
                        </button>
                    </Link>
                </Tooltip>
            </div>
            <SettingsNav {...settingsNavProps}/>
            <div style={{display: "inline-block"}}>
                <ModalFactory/>
            </div>
        </>
    )
};

export default Navigation;