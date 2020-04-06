import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faQuestionCircle, faSave} from "@fortawesome/free-regular-svg-icons";
import {faCog, faUpload} from "@fortawesome/free-solid-svg-icons";
import {decisionModal} from "./DecisionModal";
import ModalFactory from "react-modal-promise";
import SettingsNav from "./SettingsNav";

type NavigationProps = {
    showDialog: (value: boolean) => void,
    changeMenu: () => void,
    code: string,
    setCodeChanged: (value: boolean) => void,
    codeChanged: boolean,
    settingsNavProps: any
}


const Navigation = ({showDialog, changeMenu, code, setCodeChanged, codeChanged, settingsNavProps}: NavigationProps) => {

    const downloadFile = () => {
        let url = window.URL;
        let file = url.createObjectURL(new File([code], "data.vtl"))
        let a = document.createElement('a');
        a.href = file;
        a.download = 'data.vtl';
        a.click();
        setCodeChanged(true);
        // FileSaver.saveAs(file, "data.vtl");
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
                <button onClick={downloadFile}><FontAwesomeIcon icon={faSave}/></button>
                <button onClick={uploadFile}><FontAwesomeIcon icon={faUpload}/></button>
                <button><FontAwesomeIcon icon={faQuestionCircle}/></button>
                <button onClick={() => changeMenu()}><FontAwesomeIcon icon={faCog}/></button>
            </div>
            <SettingsNav {...settingsNavProps}/>
            <div style={{display: "inline-block"}}>
                <ModalFactory/>
            </div>
        </>
    )
};

export default Navigation;