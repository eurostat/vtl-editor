import React, {useEffect} from "react";
import "./navigation.scss"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faQuestionCircle, faSave} from "@fortawesome/free-regular-svg-icons";
import {faCog, faUpload} from "@fortawesome/free-solid-svg-icons";
import {decisionModal} from "./DecisionModal";
import ModalFactory from "react-modal-promise";
import SettingsNav from "./SettingsNav";
import {Tooltip} from "@material-ui/core";

type NavigationProps = {
    showDialog: (value: boolean) => void,
    changeMenu: () => void,
    code: string,
    setCodeChanged: (value: boolean) => void,
    codeChanged: boolean,
    fileName: string,
    settingsNavProps: any
}

const Navigation = ({showDialog, changeMenu, code, setCodeChanged, codeChanged, fileName, settingsNavProps}: NavigationProps) => {
    const downloadFile = () => {
        let url = window.URL;
        let file = url.createObjectURL(new File([code], (!fileName || fileName === "") ? "untitled.vtl" : fileName));
        let a = document.createElement('a');
        a.href = file;
        a.download = fileName;
        a.click();
        setCodeChanged(false);
        // FileSaver.saveAs(file, "data.vtl");
    };

    useEffect(() => {
        window.onkeydown = (event: KeyboardEvent) => checkKeyEvent(event);
    });


    const checkKeyEvent = (event: KeyboardEvent) => {
        console.log(event);
        if (event.ctrlKey) {
            let key = event.key;
            if (key === 's') {
                event.preventDefault();
                downloadFile();
            } else if (key === 'o') {
                event.preventDefault();
                uploadFile();
            }
        }
    };


    const uploadFile = async () => {
        if (codeChanged) {
            const res = await decisionModal({
                title: "Warning!",
                text:
                    "You have unsaved changes. Do you want to save your progress before opening new file?"
            });
            if (res) {
                downloadFile()
            }
        }
        showDialog(true);
    };

    return (
        <>
            <div className="nav flex-column nav-pills left-nav" aria-orientation="vertical">
                <Tooltip title="Save file (Ctrl+S)" placement="right" arrow>
                    <button className="menu-save" onClick={downloadFile}>
                        <FontAwesomeIcon icon={faSave}/>
                    </button>
                </Tooltip>
                <Tooltip title="Open file (Ctrl+O)" placement="right" arrow>
                    <button className="menu-open" onClick={uploadFile}>
                        <FontAwesomeIcon icon={faUpload}/>
                    </button>
                </Tooltip>
                <Tooltip title="Settings" placement="right" arrow>
                    <button className="menu-settings" id="setting-icon" onClick={() => changeMenu()}>
                        <FontAwesomeIcon icon={faCog}/>
                    </button>
                </Tooltip>
                <Tooltip title="Help" placement="right" arrow>
                    <button className="menu-help">
                        <FontAwesomeIcon icon={faQuestionCircle}/>
                    </button>
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